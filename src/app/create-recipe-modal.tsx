import React, { useEffect, useRef, useState } from 'react';
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
import { usePathname, useRouter } from 'expo-router';

import { RecipeColors as C } from '@/constants/theme';
import type { Ingredient, NewRecipe } from '@/types/recipe';
import { consumePendingPhoto} from '@/utils/photos';
import { INGREDIENTS } from '@/data/ingredients';



const UNITS = ['g', 'kg', 'ml', 'L', 'pièce', 'c. à soupe', 'c. à café'];

interface CreateRecipeModalProps {
  visible: boolean;
  userId: string;
  onClose: () => void;
  onSave: (recipe: NewRecipe) => Promise<void> | void;
}

export default function CreateRecipeModal({
  visible,
  userId,
  onClose,
  onSave,
}: CreateRecipeModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const visitedCamera = useRef(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  const [unit, setUnit] = useState('g');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [photoUri, setPhotoUri] = useState<string>();
  const [placeName, setPlaceName] = useState('');
  const [saving, setSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const suggestions = ingredientInput.trim()
    ? INGREDIENTS.filter((ingredient) =>
        ingredient.toLowerCase().includes(ingredientInput.trim().toLowerCase())
      )
        .filter(
          (ingredient) =>
            !ingredients.some(
              (item) => item.name.toLowerCase() === ingredient.toLowerCase()
            )
        )
        .slice(0, 5)
    : [];

  // Sélectionner un ingrédient sans l'ajouter tout de suite :
  // l'utilisateur doit encore renseigner quantité et unité.
  const selectIngredient = (ingredient: string) => {
    setIngredientInput(ingredient);
  };


  // Attendre un véritable passage par la route caméra avant de lire la photo.
  useEffect(() => {
    if (!cameraOpen) return;

    if (pathname === '/camera') {
      visitedCamera.current = true;
      return;
    }

    if (visitedCamera.current) {
      const uri = consumePendingPhoto();
      if (uri) setPhotoUri(uri);
      visitedCamera.current = false;
      setCameraOpen(false);
    }
  }, [cameraOpen, pathname]);

  const openCamera = () => {
    if (saving) return;
    visitedCamera.current = false;
    setCameraOpen(true);
    router.push('/camera');
  };

  const parseQuantity = () => {
    const raw = quantityInput.trim().replace(',', '.');
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  };

  const addIngredient = () => {
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
    if (ingredients.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      Alert.alert('Ingrédient déjà ajouté', 'Cet ingrédient est déjà dans la liste.');
      return;
    }

    setIngredients((current) => [...current, { name, quantity, unit }]);
    setIngredientInput('');
    setQuantityInput('');
    setUnit('g');
  };

  const removeIngredient = (index: number) => {
    setIngredients((current) => current.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setIngredientInput('');
    setQuantityInput('');
    setUnit('g');
    setIngredients([]);
    setPhotoUri(undefined);
    setPlaceName('');
    setCameraOpen(false);
    visitedCamera.current = false;
  };

  const handleClose = () => {
    if (saving) return;
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (saving) return;

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const pendingName = ingredientInput.trim();
    const quantity = parseQuantity();

    if (!cleanTitle || !cleanDescription) {
      Alert.alert('Champs obligatoires', 'Ajoute un titre et une description.');
      return;
    }

    if (!userId.trim()) {
      Alert.alert('Utilisateur manquant', 'Impossible de déterminer l’utilisateur.');
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

    if (ingredients.length === 0) {
      Alert.alert('Champs obligatoires', 'Ajoute au moins un ingrédient.');
      return;
    }

    const newRecipe: NewRecipe = {
      userId: userId.trim(),
      title: cleanTitle,
      description: cleanDescription,
      ingredients,
      ...(photoUri ? { photoUri } : {}),
      ...(placeName.trim() ? { placeName: placeName.trim() } : {}),
    };

    try {
      setSaving(true);
      await onSave(newRecipe);
      resetForm();
      onClose();
    } catch {
      Alert.alert('Erreur', "Impossible d'enregistrer la recette.");
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
          <View style={styles.header}>
            <Text style={styles.heading}>Nouvelle recette</Text>
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
              {photoUri ? (
                <>
                  <Image source={{ uri: photoUri }} style={styles.photo} />
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
              value={title}
              onChangeText={setTitle}
              placeholder="Ex. Poulet Kung Pao"
              placeholderTextColor="#999999"
              editable={!saving}
            />

            <Text style={styles.label}>Description *</Text>
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
              {ingredients.map((ingredient, index) => (
                <Pressable
                  key={`${ingredient.name}-${index}`}
                  style={styles.chip}
                  onPress={() => removeIngredient(index)}
                  disabled={saving}
                >
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
              value={placeName}
              onChangeText={setPlaceName}
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
                <Text style={styles.saveText}>Enregistrer la recette</Text>
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
  suggestionText: { color: C.text, fontSize: 15 },
});
