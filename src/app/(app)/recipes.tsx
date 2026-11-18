import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import CreateRecipeModal from '@/app/(app)/create-recipe-modal';
import RecipeButton from '@/components/ui/recipe-button';
import { useCallback, useState, useEffect} from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { consumePendingPhoto } from '@/utils/photos';
import { RecipeColors as C } from '@/constants/theme';
import { createRecipe } from '@/storage/recipes';


let cameraReturnPending = false;

export default function RecipesScreen() {
  // Contrôle l'affichage du formulaire
  const [modalVisible, setModalVisible] = useState(false);

  // Ouvrir le formulaire
  const openModal = () => {
    setModalVisible(true);
  
  };

  // Fermer le formulaire
  const closeModal = () => {
    setModalVisible(false);
  };


  const router = useRouter();

  useEffect(() => {


  return () => {
   
  };
}, []);

const [photoUri, setPhotoUri] = useState<string>();


// ouverture camera 
const openCamera = () => {

  cameraReturnPending  = true;

  setModalVisible(false);
  router.push('/camera');
};

// detecter le retour camera 
useFocusEffect(
  useCallback(() => {
    
if (!cameraReturnPending) return;

cameraReturnPending = false;
    const uri = consumePendingPhoto();


    if (uri) {
      setPhotoUri(uri);
    }

    setModalVisible(true);
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
        onClose={closeModal}
        onSave={createRecipe}
         photoUri={photoUri}
        onOpenCamera={openCamera}
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
