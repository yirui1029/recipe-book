import {
  Alert,
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';

import CreateRecipeModal from '@/app/(app)/create-recipe-modal';
import RecipeButton from '@/components/ui/recipe-button';
import { useCallback, useRef, useState, useEffect } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { consumePendingPhoto } from '@/utils/photos';
import { RecipeColors as C } from '@/constants/theme';
import { useAuth } from '@/context/AuthProvider';
import type { NewRecipe } from '@/types/recipe';
import BotanicalBackground from '@/components/ui/botanical-background';
import CookingLoader from '@/components/ui/cooking-loader';
import { getRecipes } from '@/storage/recipes';


export default function RecipesScreen() {
  // Contrôle l'affichage du formulaire
  const [modalVisible, setModalVisible] = useState(false);
  const auth = useAuth()
  const [loading, setLoading] = useState(true);

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
    <BotanicalBackground>
    <View style={styles.container}>
         {/* Image du carnet vintage */}
      <Image
        source={require('@/assets/images/decorations/empty-recipes.png')}
        style={styles.bookImage}
        resizeMode="contain"
      />
      {/* Texte d'accueil */}
      <View style={styles.welcome}>
        <Text style={styles.title}>
          Mon carnet de recettes
        </Text>

        <Text style={styles.subtitle}>
          Les petits plats font les grands souvenirs.
        </Text>

        <Text style={styles.description}>
          Conserve tes recettes préférées et
          retrouve-les à tout moment.
        </Text>
      </View>
    

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
      </BotanicalBackground>
    

  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  paddingHorizontal: 24,
  paddingTop: 65,
  gap: 24,
},

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: C.text,
    textAlign:'center'
  },

  welcome: {
  alignItems: 'center',
  gap: 12,
  marginBottom: 20,
},
subtitle: {
  fontSize: 16,
  fontStyle: 'italic',
  color: C.primary,
  textAlign: 'center',
},

  description: {
  fontSize: 14,
  color: C.text,
  textAlign: 'center',
  lineHeight: 22,
},
 bookImage: {
    width: 150,
    height: 150,
    marginBottom: 1,
    alignSelf:'center'
  },
});
