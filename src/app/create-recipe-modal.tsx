
import React, { useCallback, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useFocusEffect} from 'expo-router';

import { RecipeColors as C } from '@/constants/theme';
import type { NewRecipe } from '@/types/recipe';
import { consumePendingPhoto } from '@/utils/photos';
import { INGREDIENTS } from '@/data/ingredients';

interface CreateRecipeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (recipe: NewRecipe) => Promise<void> | void;
}

export default function CreateRecipeModal({
  visible,
  onClose,
  onSave,
}: CreateRecipeModalProps) {
  const router = useRouter();

  // Formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const suggestions = ingredientInput.trim()
  ? INGREDIENTS.filter((ingredient) =>
      ingredient
        .toLowerCase()
        .includes(ingredientInput.trim().toLowerCase())
    )
      .filter((ingredient) => !ingredients.includes(ingredient))
      .slice(0, 5)
  : [];

const selectIngredient = (ingredient: string) => {
  setIngredients((current) => [...current, ingredient]);
  setIngredientInput('');
};
  const [photoUri, setPhotoUri] = useState<string>();
  const [placeName, setPlaceName] = useState('');

  // États
  const [saving, setSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  // Récupérer la photo lorsque l'écran Recettes
  // reprend le focus après la caméra.
  useFocusEffect(
    useCallback(() => {
      if (cameraOpen) {
        const uri = consumePendingPhoto();

        if (uri) {
          setPhotoUri(uri);
        }

        setCameraOpen(false);
      }
    }, [cameraOpen])
  );

  // Ouvrir camera.tsx
  const openCamera = () => {
    if (saving) return;

    setCameraOpen(true);
    router.push('/camera');
  };

  // Ajouter un ingrédient
  const addIngredient = () => {
    const value = ingredientInput.trim();

    if (!value) return;

    setIngredients((current) => [...current, value]);
    setIngredientInput('');
  };

  // Supprimer un ingrédient
  const removeIngredient = (index: number) => {
    setIngredients((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  

  // Réinitialiser le formulaire
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setIngredientInput('');
    setIngredients([]);
    setPhotoUri(undefined);
    setPlaceName('');
    setCameraOpen(false);
  };

  // Fermer le modal
  const handleClose = () => {
    if (saving) return;

    resetForm();
    onClose();
  };

  // Enregistrer la recette
  const handleSave = async () => {
    if (saving) return;

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const pendingIngredient = ingredientInput.trim();

    const finalIngredients = pendingIngredient
      ? [...ingredients, pendingIngredient]
      : ingredients;

    if (
      !cleanTitle ||
      !cleanDescription ||
      finalIngredients.length === 0
    ) {
      Alert.alert(
        'Champs obligatoires',
        'Ajoute un titre, une description et au moins un ingrédient.'
      );
      return;
    }

    const newRecipe: NewRecipe = {
      title: cleanTitle,
      description: cleanDescription,
      ingredients: finalIngredients,
      ...(photoUri ? { photoUri } : {}),
      ...(placeName.trim()
        ? { placeName: placeName.trim() }
        : {}),
    };

    try {
      setSaving(true);

      await onSave(newRecipe);

      resetForm();
      onClose();
    } catch {
      Alert.alert(
        'Erreur',
        "Impossible d'enregistrer la recette."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible && !cameraOpen}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
  style={styles.overlay}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={0}
>
        <View style={styles.modal}>
          {/* En-tête */}
          <View style={styles.header}>
            <Text style={styles.heading}>
              Nouvelle recette
            </Text>

            <Pressable
              onPress={handleClose}
              disabled={saving}
            >
              <Ionicons
                name="close"
                size={26}
                color={C.text}
              />
            </Pressable>
          </View>

          <ScrollView
  keyboardShouldPersistTaps="handled"
  keyboardDismissMode="on-drag"
  showsVerticalScrollIndicator={false}
  automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
  contentContainerStyle={styles.form}
>
            {/* Photo */}
            <Pressable
              style={styles.photoBox}
              onPress={openCamera}
              disabled={saving}
            >
              {photoUri ? (
                <>
                  <Image
                    source={{ uri: photoUri }}
                    style={styles.photo}
                  />

                  <View style={styles.photoOverlay}>
                    <Ionicons
                      name="camera-outline"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.changePhotoText}>
                      Reprendre une photo
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Ionicons
                    name="camera-outline"
                    size={34}
                    color={C.primary}
                  />
                  <Text style={styles.photoLabel}>
                    Prendre une photo
                  </Text>
                </>
              )}
            </Pressable>

            {/* Titre */}
            <Text style={styles.label}>
              Nom de la recette *
            </Text>

            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex. Poulet Kung Pao"
              placeholderTextColor="#999999"
              editable={!saving}
            />

            {/* Description */}
            <Text style={styles.label}>
              Description *
            </Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Décris ta recette..."
              placeholderTextColor="#999999"
              multiline
              textAlignVertical="top"
              editable={!saving}
            />

            
{/* Ingrédients */}
<Text style={styles.label}>
  Ingrédients *
</Text>

<View style={styles.ingredientRow}>
  <TextInput
    style={[styles.input, styles.ingredientInput]}
    value={ingredientInput}
    onChangeText={setIngredientInput}
    placeholder="Rechercher un ingrédient..."
    placeholderTextColor="#999999"
    onSubmitEditing={addIngredient}
    returnKeyType="done"
    editable={!saving}
  />

  <Pressable
    style={styles.addButton}
    onPress={addIngredient}
    disabled={saving}
  >
    <Ionicons
      name="add"
      size={25}
      color="#FFFFFF"
    />
  </Pressable>
</View>

{/* Suggestions automatiques */}
{suggestions.length > 0 && (
  <View style={styles.suggestions}>
    {suggestions.map((ingredient) => (
      <Pressable
        key={ingredient}
        style={styles.suggestionItem}
        onPress={() => selectIngredient(ingredient)}
        disabled={saving}
      >
        <Text style={styles.suggestionText}>
          {ingredient}
        </Text>

        <Ionicons
          name="add-circle-outline"
          size={20}
          color={C.primary}
        />
      </Pressable>
    ))}
  </View>
)}

{/* Ingrédients sélectionnés */}
<View style={styles.chips}>
  {ingredients.map((ingredient, index) => (
    <Pressable
      key={`${ingredient}-${index}`}
      style={styles.chip}
      onPress={() => removeIngredient(index)}
      disabled={saving}
    >
      <Text style={styles.chipText}>
        {ingredient}
      </Text>

      <Ionicons
        name="close-circle"
        size={16}
        color={C.text}
      />
    </Pressable>
  ))}
</View>


            {/* Lieu */}
            <Text style={styles.label}>
              Lieu (facultatif)
            </Text>

            <TextInput
              style={styles.input}
              value={placeName}
              onChangeText={setPlaceName}
              placeholder="Bordeaux, Paris"
              placeholderTextColor="#999999"
              editable={!saving}
            />

            {/* Enregistrement */}
            <Pressable
              style={[
                styles.saveButton,
                saving && styles.disabled,
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={C.surface} />
              ) : (
                <Text style={styles.saveText}>
                  Enregistrer la recette
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  modal: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
    minHeight: 300,         
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: C.text,
  },

  form: {
    paddingBottom: 40,
    gap: 12,
  },

  photoBox: {
    height: 150,
    backgroundColor: C.background,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: C.border,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 8,
  },

  photo: {
    width: '100%',
    height: '100%',
  },

  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 8,
  },

  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  photoLabel: {
    color: C.primary,
    fontWeight: '600',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    marginTop: 6,
  },

  input: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    color: C.text,
    fontSize: 15,
  },

  textArea: {
    minHeight: 90,
    paddingTop: 12,
  },

  ingredientRow: {
    flexDirection: 'row',
    gap: 8,
  },

  ingredientInput: {
    flex: 1,
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6EDE4',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  chipText: {
    color: C.text,
    fontSize: 13,
  },

  saveButton: {
    backgroundColor: C.primary,
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  saveText: {
    color: C.surface,
    fontSize: 15,
    fontWeight: '600',
  },

  disabled: {
    opacity: 0.6,
  },
  suggestions: {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: C.border,
  borderRadius: 12,
  overflow: 'hidden',
},

suggestionItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: C.border,
},

suggestionText: {
  color: C.text,
  fontSize: 15,
},
});
