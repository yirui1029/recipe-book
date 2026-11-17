import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { RecipeColors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/AuthProvider';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, isLoading } = useAuth();

  // Tant que Firebase n'a pas restauré la session, on n'affiche ni l'accueil ni le formulaire :
  // cela évite de voir brièvement le mauvais écran au lancement.
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={RecipeColors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tout le contenu de l'app (accueil, recettes, profil...) : réservé aux utilisateurs connectés */}
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      {/* Formulaire de connexion : réservé aux visiteurs non connectés */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RecipeColors.background,
  },
});