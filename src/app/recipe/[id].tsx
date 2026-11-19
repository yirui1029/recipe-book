
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecipeColors as C } from '@/constants/theme';
import { deleteRecipe, getRecipeById, updateRecipe } from '@/storage/recipes';
import { NewRecipe, Recipe } from '@/types/recipe';
import CreateRecipeModal from '../../components/ui/create-recipe-modal';

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [modalVisible, setModalVisible] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null)
    
  const handleUpdate = async (data: NewRecipe) => {
    if (!recipe) return;
    const updated = await updateRecipe(recipe.id, {...data, photoUri: data.photoUri ?? null});
    if (!updated) throw new Error('Recette introuvable.');
    setRecipe(updated);
  };
  
  // Ouvrir le formulaire
  const openModal = () => {
    setModalVisible(true);
  };
  // Fermer le formulaire
  const closeModal = () => {
    setModalVisible(false);
  };


  const handleDelete = () => {
  if (!recipe) return;

  Alert.alert(
    'Supprimer la recette',
    `Voulez-vous vraiment supprimer "${recipe.title}" ?`,
    [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            const deleted = await deleteRecipe(recipe.id);

            if (!deleted) {
              Alert.alert('Erreur', 'Recette introuvable.');
              return;
            }

            router.back();
          } catch (error) {
            console.error('Erreur suppression :', error);
            Alert.alert(
              'Erreur',
              'Impossible de supprimer la recette.'
            );
          }
        },
      },
    ]
  );
};

  async function getRecipe() {
    const r = await getRecipeById(id)
    if (r) setRecipe(r)
  }

  useEffect(() => {
    getRecipe()
  }, [])

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
    <SafeAreaView style={styles.container} edges={['top']}>
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
            {ingredient.quantity} {ingredient.unit} — {ingredient.name}
          </Text>
        </View>
      ))}
      {/* Formulaire de création -lors que le button de modification recette cliqué*/}
<CreateRecipeModal
  visible={modalVisible}
  onClose={closeModal}
  onSave={handleUpdate}
  isEditing={true}
  recipeToUpdate={recipe}

/>

  {/* Bouton de suppression */}
    <Pressable
  style={styles.deleteButton}
  onPress={handleDelete}
>
  <Ionicons
    name="trash-outline"
    size={20}
    color="#DC2626"
  />
  <Text style={styles.deleteButtonText}>
    Supprimer la recette
  </Text>
    </Pressable>
 {/* Bouton de update */}
    <Pressable
  style={styles.editButton}
  onPress={openModal}
>
  <Ionicons
    name="create-outline"
    size={20}
    color={C.surface}
  />
  <Text style={styles.editButtonText}>
    Modifier la recette
  </Text>
</Pressable>
    </ScrollView>
    </SafeAreaView>
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
  marginTop: 8,
  marginBottom: 12,
  paddingVertical: 8,
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
  deleteButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  marginTop: 24,
  paddingVertical: 14,
  borderWidth: 1,
  borderColor: '#DC2626',
  borderRadius: 12,
  backgroundColor: C.surface,
},

deleteButtonText: {
  color: '#DC2626',
  fontSize: 16,
  fontWeight: '600',
},
editButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  marginTop: 24,
  paddingVertical: 14,
  backgroundColor: C.primary,
  borderRadius: 12,
},

editButtonText: {
  color: C.surface,
  fontSize: 16,
  fontWeight: '600',
},
});
