
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { RecipeColors as C } from '@/constants/theme';
import { mockRecipes } from '@/data/mock-recipes';

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const recipe = mockRecipes.find(
    (item) => item.id === id
  );

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>
          Recette introuvable
        </Text>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>
            Retour
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={C.primary}
        />
        <Text style={styles.backText}>
          Retour
        </Text>
      </Pressable>

      {recipe.photoUri ? (
        <Image
          source={{ uri: recipe.photoUri }}
          style={styles.image}
        />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons
            name="restaurant-outline"
            size={60}
            color={C.primary}
          />
        </View>
      )}

      <Text style={styles.title}>
        {recipe.title}
      </Text>

      {recipe.placeName ? (
        <View style={styles.location}>
          <Ionicons
            name="location-outline"
            size={18}
            color={C.primary}
          />
          <Text style={styles.locationText}>
            {recipe.placeName}
          </Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>
        Description
      </Text>

      <Text style={styles.description}>
        {recipe.description}
      </Text>

      <Text style={styles.sectionTitle}>
        Ingrédients
      </Text>

      {recipe.ingredients.map((ingredient, index) => (
        <View
          key={`${ingredient}-${index}`}
          style={styles.ingredientRow}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={C.primary}
          />
          <Text style={styles.ingredientText}>
            {ingredient}
          </Text>
        </View>
      ))}
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
    paddingBottom: 48,
    gap: 14,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  backText: {
    color: C.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 20,
  },
  placeholder: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    backgroundColor: C.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: C.text,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: C.primary,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginTop: 12,
  },
  description: {
    color: C.text,
    fontSize: 15,
    lineHeight: 24,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: C.surface,
    borderRadius: 12,
  },
  ingredientText: {
    color: C.text,
    fontSize: 15,
    flex: 1,
  },
});
