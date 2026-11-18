import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { ComponentRef, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RecipeColors } from "@/constants/theme";
// Adaptez ce chemin à l'emplacement de votre fichier firebase.ts
import { auth } from "@/storage/firebase";
import Ionicons from '@expo/vector-icons/Ionicons';
import BotanicalBackground from '@/components/ui/botanical-background';


type Mode = "login" | "register";
type TextInputRef = ComponentRef<typeof TextInput>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6; // minimum imposé par Firebase Authentication
const PLACEHOLDER_COLOR = "#9ca3af";

function getErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "E-mail ou mot de passe incorrect.";
    case "auth/invalid-email":
      return "L'adresse e-mail n'est pas valide.";
    case "auth/email-already-in-use":
      return "Un compte existe déjà avec cette adresse e-mail.";
    case "auth/weak-password":
      return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
    case "auth/too-many-requests":
      return "Trop de tentatives. Réessayez dans quelques minutes.";
    case "auth/network-request-failed":
      return "Pas de connexion. Vérifiez votre réseau.";
    default:
      return "Une erreur est survenue. Réessayez.";
  }
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<TextInputRef>(null);

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "login";

  const validate = (): string | null => {
    if (!EMAIL_REGEX.test(email.trim())) return "Saisissez une adresse e-mail valide.";
    if (!password) return "Saisissez votre mot de passe.";
    if (!isLogin && password.length < MIN_PASSWORD_LENGTH) {
      return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
    }
    return null;
  };

  const submit = async () => {
    if (loading) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const trimmedEmail = email.trim();
      if (isLogin) {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      } else {
        await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      }
      // Pas de navigation ici : la redirection est faite par Stack.Protected
      // dès que onAuthStateChanged signale la nouvelle session.
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isLogin ? "register" : "login");
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <BotanicalBackground>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
  <View style={styles.logoBox}>
    <Ionicons
      name="restaurant-outline"
      size={36}
      color={RecipeColors.primary}
    />
  </View>

  <View style={styles.animationContainer}>
 
</View>

  <Text style={styles.brandText}>RecipeBook</Text>
</View>
        <Text style={styles.title}>{isLogin ? "Connexion" : "Créer un compte"}</Text>
        <Text style={styles.subtitle}>
          {isLogin
            ? "Retrouvez vos recettes."
            : "Créez votre compte pour enregistrer vos recettes."}
        </Text>

        <Text style={styles.label}>Adresse e-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="vous@exemple.com"
          placeholderTextColor={PLACEHOLDER_COLOR}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!loading}
        />

        <Text style={styles.label}>Mot de passe</Text>
        <View style={styles.passwordRow}>
          <TextInput
            ref={passwordRef}
            style={[styles.input, styles.passwordInput]}
            value={password}
            onChangeText={setPassword}
            placeholder="Votre mot de passe"
            placeholderTextColor={PLACEHOLDER_COLOR}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete={isLogin ? "current-password" : "new-password"}
            textContentType={isLogin ? "password" : "newPassword"}
            returnKeyType="go"
            onSubmitEditing={submit}
            editable={!loading}
          />
          <Pressable
            style={styles.toggle}
            onPress={() => setShowPassword((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            <Text style={styles.toggleText}>{showPassword ? "Masquer" : "Afficher"}</Text>
          </Pressable>
        </View>

        {error && (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={submit}
          disabled={loading}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color={RecipeColors.surface} />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? "Se connecter" : "Créer mon compte"}</Text>
          )}
        </Pressable>

        <Pressable onPress={switchMode} disabled={loading} style={styles.switch}>
          <Text style={styles.switchText}>
            {isLogin ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
          </Text>
        </Pressable>

        <View style={styles.footer}>
  <View style={styles.footerDecoration}>
     <Image
    source={require('../../assets/images/decorations/cooking-loader.gif')}
    style={styles.cookingAnimation}
    resizeMode="contain"
    blurRadius={2}
  />
  </View>

  <Text style={styles.footerText}>
    Cuisinez, partagez, savourez.
  </Text>
</View>

      </ScrollView>
      </BotanicalBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: RecipeColors.background },
  container: { flexGrow: 1, paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: "700", color: RecipeColors.text },
  subtitle: { fontSize: 16, color: RecipeColors.text, opacity: 0.7, marginTop: 4, marginBottom: 32 },
  label: { fontSize: 14, fontWeight: "600", color: RecipeColors.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: RecipeColors.border,
    backgroundColor: RecipeColors.surface,
    color: RecipeColors.text,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordRow: { position: "relative" },
  passwordInput: { paddingRight: 96 },
  toggle: {
    position: "absolute",
    right: 0,
    top: 0,
    height: 48,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  toggleText: { color: RecipeColors.primary, fontWeight: "600" },
  error: { color: "#dc2626", marginBottom: 16 },
  button: {
    backgroundColor: RecipeColors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: RecipeColors.surface, fontSize: 16, fontWeight: "600" },
  switch: { marginTop: 20, alignItems: "center" },
  switchText: { color: RecipeColors.primary, fontSize: 15 },

  brand: {
  alignItems: 'center',
  marginBottom: 32,
},

logoBox: {
  width: 82,
  height: 82,
  borderRadius: 26,
  backgroundColor: '#E5EEDB',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 12,
},

brandText: {
  fontSize: 30,
  fontWeight: '700',
  fontStyle: 'italic',
  color: RecipeColors.primary,
  letterSpacing: -1,
},

footer: {
  marginTop: 44,
  alignItems: 'center',
  paddingBottom: 12,
},

footerDecoration: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 28,
  marginBottom: 12,
},

footerText: {
  fontSize: 13,
  color: RecipeColors.text,
  opacity: 0.6,
  fontStyle: 'italic',
},
animationContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 24,
},

cookingAnimation: {
  width: 180,
  height: 180,
  borderRadius: 90,
  opacity: 0.85,
},
});