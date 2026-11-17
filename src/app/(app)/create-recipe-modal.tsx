import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
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
import type { NewRecipe } from '@/types/recipe';
import * as ImagePicker from 'expo-image-picker';



const UNITS = ['g', 'kg', 'ml', 'L', 'pièce', 'c. à soupe', 'c. à café'];

interface CreateRecipeModalProps {
  visible: boolean;
  userId: string;
  photoUri?: string;
  onOpenCamera: () => void;
  onClose: () => void;
  onSave: (recipe: NewRecipe) => Promise<void> | void;
  onSelectPhoto: (uri: string) => void;
  onRemovePhoto: () => void;
  
}

export default function CreateRecipeModal({
  visible,
  userId,
  photoUri,
  onOpenCamera,
  onClose,
  onSave,
  onSelectPhoto,
  onRemovePhoto
}: CreateRecipeModalProps) {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  const [unit, setUnit] = useState('g');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [placeName, setPlaceName] = useState('');
  const [saving, setSaving] = useState(false);


// suggestions des ingredients 
const suggestions = ingredientInput.trim()
  ? INGREDIENTS.filter((ingredient) =>
      ingredient
        .toLowerCase()
        .includes(ingredientInput.trim().toLowerCase())
    )
      .filter(
        (ingredient) =>
          !ingredients.some(
            (item) =>
              item.split(' - ')[0].toLowerCase() ===
              ingredient.toLowerCase()
          )
      )
      .slice(0, 5)
  : [];

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

const addIngredient = () => {
  const name = ingredientInput.trim();
  const quantity = parseQuantity();

  if (!name) {
    Alert.alert('Erreur', 'Saisis un ingrédient.');
    return;
  }

  if (quantity === null) {
    Alert.alert('Erreur', 'Saisis une quantité valide.');
    return;
  }

  const alreadyExists = ingredients.some(
    (item) =>
      item.split(' - ')[0].toLowerCase() === name.toLowerCase()
  );

  if (alreadyExists) {
    Alert.alert('Erreur', 'Cet ingrédient existe déjà.');
    return;
  }

  // Concaténer nom + quantité + unité
  const newIngredient = `${name} - ${quantity} ${unit}`;

  setIngredients((current) => [...current, newIngredient]);

  // Réinitialiser les champs
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
    setPlaceName('');
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
<View style={{ gap: 12 }}>
  {photoUri && (
    <>
      <Image
        source={{ uri: photoUri }}
        style={styles.photoPreview}
        resizeMode="cover"
      />

      <Pressable
        style={styles.deletePhotoButton}
        onPress={onRemovePhoto}
        disabled={saving}
      >
        <Ionicons
          name="trash-outline"
          size={20}
          color="#D32F2F"
        />
        <Text style={styles.deletePhotoText}>
          Supprimer la photo
        </Text>
      </Pressable>
    </>
  )}

  <View style={styles.photoActions}>
    <Pressable
      style={styles.cameraButton}
      onPress={onOpenCamera}
      disabled={saving}
    >
      <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
      <Text style={styles.cameraButtonText}>Caméra</Text>
    </Pressable>

    <Pressable
      style={styles.galleryButton}
      onPress={chooseFromGallery}
      disabled={saving}
    >
      <Ionicons name="images-outline" size={22} color={C.primary} />
      <Text style={styles.galleryButtonText}>Galerie</Text>
    </Pressable>
  </View>
</View>

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
