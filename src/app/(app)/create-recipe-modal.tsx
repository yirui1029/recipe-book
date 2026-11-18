import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, useEffect} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { RecipeColors as C } from '@/constants/theme';
import { INGREDIENTS } from '@/data/ingredients';
import type { NewRecipe, Recipe, RecipeIngredient } from '@/types/recipe';
import { consumePendingPhoto } from '@/utils/photos';
import * as ImagePicker from 'expo-image-picker';
import {
  getCustomIngredients,
  saveCustomIngredient,
} from '@/storage/ingredient-storage';

const UNITS = ['g', 'kg', 'ml', 'L', 'pièce', 'c. à soupe', 'c. à café'];

/**
 * Un seul état pour le contenu de la recette, que l'on crée ou que l'on modifie :
 * seule sa valeur de départ change (vide, ou issue de la recette à modifier).
 */
interface RecipeFormValues {
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  photoUri?: string;
  placeName: string;
}

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
  visible: boolean;
  onClose: () => void;
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
}: CreateRecipeModalProps) {

  // État unique du formulaire (création et modification)
  const [form, setForm] = useState<RecipeFormValues>(() =>
    getInitialValues(isEditing ? recipeToUpdate : undefined)
  );

  // Saisie en cours d'un ingrédient : brouillon temporaire, hors recette
  const [ingredientInput, setIngredientInput] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  const [unit, setUnit] = useState('g');

  // États d'interface
  const [saving, setSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const allIngredients = [
  ...new Set([
    ...INGREDIENTS,
    ...customIngredients,
  ]),
  
  useEffect(() => {
    getCustomIngredients().then(setCustomIngredients);
  }, []);

  const updateForm = <K extends keyof RecipeFormValues>(key: K, value: RecipeFormValues[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  // À chaque ouverture : on repart de zéro (création) ou de la recette à modifier (édition).
  // La réinitialisation se fait à l'ouverture et non à la fermeture, pour ne pas vider
  // le formulaire pendant l'animation de fermeture. Le retour de la caméra ne la déclenche pas,
  // car `visible` reste vrai pendant la prise de photo.
  useEffect(() => {
    if (!visible) return;
    setForm(getInitialValues(isEditing ? recipeToUpdate : undefined));
    setIngredientInput('');
    setQuantityInput('');
    setUnit('g');
    setCameraOpen(false);
    visitedCamera.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, isEditing, recipeToUpdate?.id]);

  const suggestions = ingredientInput.trim()
    ? INGREDIENTS.filter((ingredient) =>
        ingredient.toLowerCase().includes(ingredientInput.trim().toLowerCase())
      )
        .filter(
          (ingredient) =>
            !form.ingredients.some(
              (item) => item!.name.toLowerCase() === ingredient.toLowerCase()
            )
        )
        .slice(0, 5)
    : [];

    //etat pour la liste des ingrédients personnalisée

  // Attendre un véritable passage par la route caméra avant de lire la photo.
  useEffect(() => {
    if (!cameraOpen) return;


    if (visitedCamera.current) {
      const uri = consumePendingPhoto();
      if (uri) updateForm('photoUri', uri);
      visitedCamera.current = false;
      setCameraOpen(false);
    }
  }, [cameraOpen, pathname]);

  // Sélectionner un ingrédient sans l'ajouter tout de suite :
  // l'utilisateur doit encore renseigner quantité et unité.
  const selectIngredient = (ingredient: string) => {
    setIngredientInput(ingredient);
  };


  const parseQuantity = () => {
    const raw = quantityInput.trim().replace(',', '.');
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  };

const addIngredient = async() => {
  const name = ingredientInput.trim();
  const quantity = parseQuantity();

    if (!name) {
      Alert.alert('Ingrédient manquant', 'Saisis le nom de l’ingrédient.');
      return;
    }
    if (quantity === null) {
      Alert.alert('Quantité invalide', 'Saisis une quantité supérieure à zéro.');
      return;
    }
    if (form.ingredients.some((item) => item!.name.toLowerCase() === name.toLowerCase())) {
      Alert.alert('Ingrédient déjà ajouté', 'Cet ingrédient est déjà dans la liste.');
      return;
    }

    // FIXME : cette ligne n'ajoute rien à la liste (comportement d'origine conservé)
    setForm((current) => ({ ...current, ingredients: [...current.ingredients, {name: name, quantity: quantity, unit: unit}] }));
    setIngredientInput('');
    setQuantityInput('');
    setUnit('g');
  };

  const removeIngredient = (index: number) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSave = async () => {
    if (saving) return;

    const cleanTitle = form.title.trim();
    const cleanDescription = form.description.trim();
    const pendingName = ingredientInput.trim();

    if (!cleanTitle || !cleanDescription) {
      Alert.alert('Champs obligatoires', 'Ajoute un titre et une description.');
      return;
    }

    // Si un ingrédient est encore saisi, on demande de cliquer sur +
    // pour éviter de perdre sa quantité.
    if (pendingName || quantityInput.trim()) {
      Alert.alert(
        'Ingrédient en cours',
        'Clique sur + pour ajouter ton ingrédient et sa quantité avant d’enregistrer.'
      );
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
  // choisir une photo dans le telephone de l'utilisateur 
  const chooseFromGallery = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.8,
  });

  if (!result.canceled && result.assets.length > 0) {
    onSelectPhoto(result.assets[0].uri);
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
            {/* Photo : fonctionnalité existante conservée */}
            <Pressable style={styles.photoBox} onPress={openCamera} disabled={saving}>
              {form.photoUri ? (
                <>
                  <Image source={{ uri: form.photoUri }} style={styles.photo} />
                  <View style={styles.photoOverlay}>
                    <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.changePhotoText}>Reprendre une photo</Text>
                  </View>
                </>
              ) : (
                <>
                  <Ionicons name="camera-outline" size={34} color={C.primary} />
                  <Text style={styles.photoLabel}>Prendre une photo</Text>
                </>
              )}
            </Pressable>

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
            <Text style={styles.label}>Ingrédients *</Text>
            <TextInput
              style={styles.input}
              value={ingredientInput}
              onChangeText={setIngredientInput}
              placeholder="Rechercher un ingrédient..."
              placeholderTextColor="#999999"
              editable={!saving}
            />

            {suggestions.length > 0 && (
              <View style={styles.suggestions}>
                {suggestions.map((ingredient) => (
                  <Pressable
                    key={ingredient}
                    style={styles.suggestionItem}
                    onPress={() => selectIngredient(ingredient)}
                    disabled={saving}
                  >
                    <Text style={styles.suggestionText}>{ingredient}</Text>
                    <Ionicons name="checkmark-circle-outline" size={20} color={C.primary} />
                  </Pressable>
                ))}
              </View>
            )}

            {/* NOUVEAU : quantité et unité */}
            <Text style={styles.label}>Quantité et unité *</Text>
            <View style={styles.quantityRow}>
              <TextInput
                style={[styles.input, styles.quantityInput]}
                value={quantityInput}
                onChangeText={setQuantityInput}
                placeholder="Ex. 200"
                placeholderTextColor="#999999"
                keyboardType="decimal-pad"
                editable={!saving}
              />
              <Pressable
                style={[styles.addButton, saving && styles.disabled]}
                onPress={addIngredient}
                disabled={saving}
                accessibilityLabel="Ajouter l'ingrédient avec sa quantité"
              >
                <Ionicons name="add" size={25} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.unitButtons}>
              {UNITS.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setUnit(item)}
                  disabled={saving}
                  style={[styles.unitButton, unit === item && styles.unitButtonActive]}
                >
                  <Text style={[styles.unitText, unit === item && styles.unitTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Ingrédients sélectionnés avec leurs quantités */}
            <View style={styles.chips}>
              {form.ingredients.map((ingredient, index) => (
                <Pressable
                  key={`${ingredient}-${index}`}
                  style={styles.chip}
                  onPress={() => removeIngredient(index)}
                  disabled={saving}
                >
                  {/* FIXME : affiche la saisie en cours, pas la quantité de cet ingrédient (comportement d'origine conservé) */}
                  <Text style={styles.chipText}>
                    {ingredient.quantity} {ingredient.unit} — {ingredient.name}
                  </Text>
                  <Ionicons name="close-circle" size={16} color={C.text} />
                </Pressable>
              ))}
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
  photo: { width: '100%', height: '100%' },
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
  changePhotoText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  photoLabel: { color: C.primary, fontWeight: '600' },
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
  quantityRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  quantityInput: { flex: 1 },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#FFFFFF',
  },
  unitButtonActive: { backgroundColor: C.primary, borderColor: C.primary },
  unitText: { color: C.text, fontSize: 13 },
  unitTextActive: { color: C.surface },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6EDE4',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: { color: C.text, fontSize: 13 },
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
 photoPreview: {
  width: '100%',
  height: 180,
  borderRadius: 16,
},
deletePhotoButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  borderWidth: 1,
  borderColor: '#D32F2F',
  borderRadius: 12,
  paddingVertical: 12,
},
deletePhotoText: {
  color: '#D32F2F',
  fontWeight: '600',
},
photoActions: {
  flexDirection: 'row',
  gap: 10,
},
cameraButton: {
  flex: 1,
  backgroundColor: C.primary,
  borderRadius: 12,
  paddingVertical: 14,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 6,
},
cameraButtonText: {
  color: '#FFFFFF',
  fontWeight: '600',
},
galleryButton: {
  flex: 1,
  borderWidth: 1,
  borderColor: C.primary,
  borderRadius: 12,
  paddingVertical: 14,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 6,
},
galleryButtonText: {
  color: C.primary,
  fontWeight: '600',
},
  suggestionText: { color: C.text, fontSize: 15 },
});