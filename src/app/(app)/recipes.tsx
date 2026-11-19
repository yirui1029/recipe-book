import {
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';

import BotanicalBackground from '@/components/ui/botanical-background';
import CreateRecipeModal from '@/components/ui/create-recipe-modal';
import RecipeButton from '@/components/ui/recipe-button';
import { RecipeColors as C } from '@/constants/theme';
import { createRecipe } from '@/storage/recipes';
import { consumePendingPhoto } from '@/utils/photos';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';



export default function RecipesScreen() {
  // Contrôle l'affichage du formulaire
  const [modalVisible, setModalVisible] = useState(false);
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const [pendingPhoto, setPendingPhoto] = useState<string | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      const uri = consumePendingPhoto(); // lit puis vide
      if (uri) {
        setPendingPhoto(uri);
        setModalVisible(true); // rouvre la modale
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
        onClose={closeModal}
        onSave={createRecipe}
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
