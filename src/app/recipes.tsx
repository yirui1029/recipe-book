
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';

import RecipeButton from '@/components/ui/recipe-button';
import CreateRecipeModal from './create-recipe-modal';

import { RecipeColors as C } from '@/constants/theme';
import type { NewRecipe } from '@/types/recipe';

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
        onSave={handleSaveRecipe}
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
