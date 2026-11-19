
import React from 'react';
import {
  Pressable,
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { RecipeColors as C } from '@/constants/theme';
import type { Recipe } from '@/types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export default function RecipeCard({
  recipe,
  onPress,
}: RecipeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      {recipe.photoUri ? (
        <Image
          source={{ uri: recipe.photoUri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons
            name="restaurant-outline"
            size={38}
            color={C.primary}
          />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {recipe.title}
        </Text>

        <Text
          style={styles.description}
          numberOfLines={2}
        >
          {recipe.description}
        </Text>

        {recipe.placeName ? (
          <View style={styles.location}>
            <Ionicons
              name="location-outline"
              size={14}
              color={C.primary}
            />
            <Text
              style={styles.locationText}
              numberOfLines={1}
            >
              {recipe.placeName}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    height:260,
  },
  pressed: {
    opacity: 0.8,
  },
  image: {
    width: '100%',
    height: 140,
  },
  placeholder: {
    width: '100%',
    height: 140,
    backgroundColor: C.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 12,
    gap: 6,
    flex:1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  description: {
   fontSize: 13,
  color: C.text,
  opacity: 0.75,
  lineHeight: 18,
  minHeight: 36,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    color: C.primary,
    fontSize: 12,
    flex: 1,
  },
});
