
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { RecipeColors } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon profil</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons
            name="person-outline"
            size={36}
            color={RecipeColors.surface}
          />
        </View>

        <Text style={styles.name}>Mon espace cuisine</Text>

        <Text style={styles.subtitle}>
          Bienvenue dans Recipe-Book !
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>
          Mes informations
        </Text>

        <View style={styles.infoRow}>
          <Ionicons
            name="book-outline"
            size={22}
            color={RecipeColors.primary}
          />
          <Text style={styles.infoText}>
            Mes recettes enregistrées
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="heart-outline"
            size={22}
            color={RecipeColors.primary}
          />
          <Text style={styles.infoText}>
            Mes favoris
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="settings-outline"
            size={22}
            color={RecipeColors.primary}
          />
          <Text style={styles.infoText}>
            Paramètres
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RecipeColors.background,
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: RecipeColors.text,
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: RecipeColors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: RecipeColors.border,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: RecipeColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: RecipeColors.text,
  },
  subtitle: {
    fontSize: 14,
    color: RecipeColors.text,
  },
  infoCard: {
    backgroundColor: RecipeColors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: RecipeColors.border,
    padding: 24,
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: RecipeColors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoText: {
    fontSize: 15,
    color: RecipeColors.text,
  },
});
