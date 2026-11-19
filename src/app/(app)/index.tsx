
import {useFocusEffect, useRouter } from 'expo-router';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RecipeCard from '@/components/ui/recipe-card';
import { RecipeColors as C } from '@/constants/theme';
import { getRecipes } from '@/storage/recipes';
import { Recipe } from '@/types/recipe';
import { useCallback, useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>();
  
  useFocusEffect(
  useCallback(() => {
    handleRecipes();
  }, [])
);
  
  async function handleRecipes() {
    const data = await getRecipes()
    if (data) {
      setRecipes(data)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>
              Recipe-Book
            </Text>

            <Text style={styles.sectionTitle}>
              Mes recettes
            </Text>

            <Text style={styles.subtitle}>
              Découvre tes recettes préférées !
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aucune recette pour le moment.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <RecipeCard
              recipe={item}
              onPress={() =>
                router.push({
                  pathname: '/recipe/[id]',
                  params: { id: item.id },
                })
              }
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: C.text,
    textAlign: 'center',
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: C.text,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: C.primary,
  },

  row: {
    gap: 12,
    marginBottom: 16,
  },

  cardWrapper: {
    flex: 1,
    minWidth: 0,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 15,
    color: C.text,
    textAlign: 'center',
  },
});
