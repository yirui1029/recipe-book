import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RecipeColors as C } from '@/constants/theme';
import { useAuth } from '@/context/AuthProvider';
import { getRecipes } from '@/storage/recipes';


export default function ProfileScreen() {
  const auth = useAuth();
  const router = useRouter();

  const [recipeCount, setRecipeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const user = auth.user;

  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'Mon espace cuisine';

  const email = user?.email || 'Adresse e-mail indisponible';

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadRecipes = async () => {
        setLoading(true);

        try {
          const recipes = await getRecipes();

          if (active) {
            setRecipeCount(recipes.length);
          }
        } catch (error) {
          console.error('Erreur chargement recettes :', error);
          if (active) {
            setRecipeCount(0);
          }
        } finally {
          if (active) setLoading(false);
        }
      };

      if (user) {
        loadRecipes();
      } else {
        setRecipeCount(0);
        setLoading(false);
      }

      return () => {
        active = false;
      };
    }, [user?.uid])
  );

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Souhaites-tu te déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            void auth.logOut();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Mon profil</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons
            name="person-outline"
            size={36}
            color={C.surface}
          />
        </View>

        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.subtitle}>{email}</Text>

        <View style={styles.statsCard}>
          {loading ? (
            <ActivityIndicator color={C.primary} />
          ) : (
            <Text style={styles.statsNumber}>
              {recipeCount}
            </Text>
          )}
          <Text style={styles.statsLabel}>
            Recettes enregistrées
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>
          Mes informations
        </Text>

        <Pressable
          style={styles.infoRow}
          onPress={() => router.push('/recipes')}
        >
          <Ionicons
            name="book-outline"
            size={22}
            color={C.primary}
          />
          <Text style={styles.infoText}>
            Mes recettes
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={C.primary}
          />
        </Pressable>

        <View style={styles.infoRow}>
          <Ionicons
            name="heart-outline"
            size={22}
            color={C.primary}
          />
          <Text style={styles.infoText}>
            Mes favoris (à venir)
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="settings-outline"
            size={22}
            color={C.primary}
          />
          <Text style={styles.infoText}>
            Paramètres (à venir)
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color={C.primary}
        />
        <Text style={styles.logoutText}>
          Déconnexion
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
    gap: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: C.text,
  },
  profileCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: C.text,
  },
  subtitle: {
    fontSize: 14,
    color: C.text,
    textAlign: 'center',
  },
  statsCard: {
    width: '100%',
    backgroundColor: C.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  statsNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    color: C.primary,
  },
  statsLabel: {
    fontSize: 14,
    color: C.primary,
  },
  infoCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: C.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 36,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: C.text,
  },
  logoutButton: {
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.primary,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoutText: {
    color: C.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});