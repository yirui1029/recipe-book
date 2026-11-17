import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import CreateRecipeModal from '@/app/(app)/create-recipe-modal';
import RecipeButton from '@/components/ui/recipe-button';

import { RecipeColors as C } from '@/constants/theme';
import { createRecipe } from '@/storage/recipes';

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
