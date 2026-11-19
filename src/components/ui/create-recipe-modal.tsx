import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import IngredientEditor from '@/components/ui/ingredient-editor';
import RecipePhotoPicker from '@/components/ui/recipe-photo-picker';
import { RecipeColors as C } from '@/constants/theme';
import { useRecipeIngredient } from '@/hooks/use-recipe-ingredient';
import type { NewRecipe, Recipe } from '@/types/recipe';
import { RecipeFormValues } from '@/types/recipeForm';

function getInitialValues(recipe?: Recipe): RecipeFormValues {
  if (!recipe) {
    return { title: '', description: '', ingredients: [], photoUri: undefined, placeName: '' };
  }
  return {
    title: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients,
    photoUri: recipe.photoUri,
    placeName: recipe.placeName ?? '',
  };
}

type CreateRecipeModalProps = {
  photoUri?: string;
  visible: boolean;
  onClose: () => void;
  onOpenCamera: () => void;
  /**
   * Appelé à l'enregistrement, en création comme en modification.
   * C'est le parent qui choisit la méthode à appeler (création ou modification).
   */
  onSave: (recipe: NewRecipe) => Promise<unknown> | void;
} & (
  | { isEditing?: false; recipeToUpdate?: undefined }
  | { isEditing: true; recipeToUpdate: Recipe }
);

export default function CreateRecipeModal({
  visible,
  onClose,
  onSave,
  isEditing = false,
  recipeToUpdate,
  photoUri,
  onOpenCamera,
}: CreateRecipeModalProps) {
  // État unique du formulaire (création et modification)
  const [form, setForm] = useState<RecipeFormValues>(() =>
    getInitialValues(isEditing ? recipeToUpdate : undefined)
  );

  
  // États d'interface
  const [saving, setSaving] = useState(false);
  const updateForm = <K extends keyof RecipeFormValues>(key: K, value: RecipeFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    
  }
  const { hasPending, resetDraft } = useRecipeIngredient(form, updateForm);
  //récupérer la photo après le retour de la caméra
  useEffect(() => {
    if (photoUri) {
      updateForm('photoUri', photoUri);
    }
  }, [photoUri]);

  // À chaque ouverture : on repart de zéro (création) ou de la recette à modifier (édition).
  // La réinitialisation se fait à l'ouverture et non à la fermeture, pour ne pas vider
  // le formulaire pendant l'animation de fermeture. Le retour de la caméra ne la déclenche pas,
  // car `visible` reste vrai pendant la prise de photo.
  useEffect(() => {
    if (!visible) return;
    setForm({
      ...getInitialValues(isEditing ? recipeToUpdate : undefined),
      photoUri: photoUri,
    });

    resetDraft();
  }, [visible, isEditing, recipeToUpdate?.id]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSave = async () => {
    if (saving) return;

    const cleanTitle = form.title.trim();
    const cleanDescription = form.description.trim();

    if (hasPending) { Alert.alert('Ingrédient en cours', '...'); return; }

    if (!cleanTitle || !cleanDescription) {
      Alert.alert('Champs obligatoires', 'Ajoute un titre et une description.');
      return;
    }

    if (form.ingredients.length === 0) {
      Alert.alert('Champs obligatoires', 'Ajoute au moins un ingrédient.');
      return;
    }

    const newRecipe: NewRecipe = {
      title: cleanTitle,
      description: cleanDescription,
      ingredients: form.ingredients,
      ...(form.photoUri ? { photoUri: form.photoUri } : {}),
      ...(form.placeName.trim() ? { placeName: form.placeName.trim() } : {}),
    };

    try {
      setSaving(true);
      // Création ou modification : le parent décide de la méthode à appeler
      await onSave(newRecipe);
      onClose();
    } catch {
      Alert.alert(
        'Erreur',
        isEditing
          ? "Impossible de modifier la recette."
          : "Impossible d'enregistrer la recette."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
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
          <View style={styles.header}>
            <Text style={styles.heading}>
              {isEditing ? 'Modifier la recette' : 'Nouvelle recette'}
            </Text>
            <Pressable onPress={handleClose} disabled={saving}>
              <Ionicons name="close" size={26} color={C.text} />
            </Pressable>
        </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            contentContainerStyle={styles.form}
          >
        <View style={{ gap: 12 }}>
          <RecipePhotoPicker
            form={form}
            updateForm={updateForm}
            saving={saving}
            onOpenCamera={onOpenCamera}
          />
        </View>
        <View>
            <Text style={styles.label}>Nom de la recette *</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(value) => updateForm('title', value)}
              placeholder="Ex. Poulet Kung Pao"
              placeholderTextColor="#999999"
              editable={!saving}
            />

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={(value) => updateForm('description', value)}
              placeholder="Décris ta recette..."
              placeholderTextColor="#999999"
              multiline
              textAlignVertical="top"
              editable={!saving}
            />

            {/* Ingrédient et suggestions : conservés */}
            <IngredientEditor
              form={form}
              updateForm={updateForm}
              saving={saving}
            />

            </View>

            <Text style={styles.label}>Lieu (facultatif)</Text>
            <TextInput
              style={styles.input}
              value={form.placeName}
              onChangeText={(value) => updateForm('placeName', value)}
              placeholder="Bordeaux, Paris"
              placeholderTextColor="#999999"
              editable={!saving}
            />

            <Pressable
              style={[styles.saveButton, saving && styles.disabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={C.surface} />
              ) : (
                <Text style={styles.saveText}>
                  {isEditing ? 'Enregistrer les modifications' : 'Enregistrer la recette'}
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
  heading: { fontSize: 24, fontWeight: 'bold', color: C.text },
  form: { paddingBottom: 40, gap: 12 },
  label: { fontSize: 14, fontWeight: '600', color: C.text, marginTop: 6 },
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
  textArea: { minHeight: 90, paddingTop: 12 },
 
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: C.primary,
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveText: { color: C.surface, fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});
