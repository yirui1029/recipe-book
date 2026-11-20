
import BotanicalBackground from '@/components/ui/botanical-background';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RecipeCard from '@/components/ui/recipe-card';
import { RecipeColors as C } from '@/constants/theme';
import { getRecipes } from '@/storage/recipes';
import { Recipe } from '@/types/recipe';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  
  useFocusEffect(
    useCallback(() => {
      handleRecipes();
    }, [])
   );
  
  async function handleRecipes() {
  setLoading(true);

  try {
    const data = await getRecipes();
    setRecipes(data);
  } catch (error) {
    console.error('Erreur chargement recettes :', error);
  } finally {
    setLoading(false);
  }
}

  return (
    
    <SafeAreaView style={styles.container} edges={['top']}>
      <BotanicalBackground>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
  <View style={styles.header}>
    <View style={styles.brandRow}>
      <Ionicons
        name="restaurant-outline"
        size={28}
        color={C.primary}
      />
      <Text style={styles.title}>RecipeBook</Text>
      <Ionicons
        name="leaf-outline"
        size={24}
        color={C.primary}
      />
    </View>

    <View style={styles.welcomeCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>
          Mes recettes
        </Text>
        <Text style={styles.subtitle}>
          Retrouve toutes tes créations gourmandes !
        </Text>
      </View>

    </View>
  </View>
}
        ListEmptyComponent={
  loading ? (
    <View style={styles.emptyContainer}>
      <ActivityIndicator
        size="large"
        color={C.primary}
      />
      <Text style={styles.emptyText}>
        Chargement des recettes...
      </Text>
    </View>
  ) : (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Aucune recette pour le moment.
      </Text>
    </View>
  )
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
      </BotanicalBackground>
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
   fontSize: 28,
  fontWeight: 'bold',
  color: C.primary,
  textAlign: 'center',
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
  lineHeight: 20,
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
  brandRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  marginBottom: 24,
},

welcomeCard: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 20,
  backgroundColor: 'rgba(226, 235, 217, 0.35)',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: 'rgba(82, 122, 82, 0.10)',
  gap: 12,
},
});
