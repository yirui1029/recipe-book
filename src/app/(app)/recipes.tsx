import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CreateRecipeModal from '@/app/(app)/create-recipe-modal';
import RecipeButton from '@/components/ui/recipe-button';
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { consumePendingPhoto } from '@/utils/photos';
import { RecipeColors as C } from '@/constants/theme';
import { useAuth } from '@/context/AuthProvider';
import type { NewRecipe } from '@/types/recipe';

export default function RecipesScreen() {
  // Contrôle l'affichage du formulaire
  const [modalVisible, setModalVisible] = useState(false);
  const auth = useAuth()

  // Ouvrir le formulaire
  const openModal = () => {
    setModalVisible(true);
  };

  // Fermer le formulaire
  const closeModal = () => {
    setModalVisible(false);
  };

  // Enregistrer une nouvelle recette
  const handleSaveRecipe = async (recipe: NewRecipe) => {
    console.log('Nouvelle recette :', recipe);

    // TODO : enregistrer dans Firebase ou dans
    // le système de stockage prévu par le projet.

    Alert.alert(
      'Succès',
      'Le formulaire a été validé.'
    );
  };

const router = useRouter();

const [photoUri, setPhotoUri] = useState<string>();

const openCamera = () => {
  setModalVisible(false);
  router.push('/camera');
};

useFocusEffect(
  useCallback(() => {
    const uri = consumePendingPhoto();

    if (uri) {
      setPhotoUri(uri);
      setModalVisible(true);
    }
  }, [])
);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Mes recettes
      </Text>

      <Text style={styles.description}>
        Retrouve toutes tes recettes préférées.
      </Text>

      {/* Bouton pour ouvrir le formulaire */}
      <RecipeButton
        title="Ajouter une recette"
        onPress={openModal}
      />

      {/* Formulaire de création */}
      <CreateRecipeModal
      visible={modalVisible}
  userId={auth.user?.uid ?? ''}
  photoUri={photoUri}
  onOpenCamera={openCamera}
  onClose={closeModal}
  onSave={handleSaveRecipe}
  onRemovePhoto={() => setPhotoUri(undefined)}
  onSelectPhoto={setPhotoUri}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    padding: 24,
    gap: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: C.text,
  },

  description: {
    fontSize: 15,
    color: C.text,
  },
});
