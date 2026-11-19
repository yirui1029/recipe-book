import { RecipeColors as C, disabled } from '@/constants/theme';
import { UNITS } from "@/constants/units";
import { SetForm, useRecipeIngredient } from "@/hooks/use-recipe-ingredient";
import { RecipeFormValues } from "@/types/recipeForm";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";


export default function IngredientEditor({ form, updateForm, saving }: { form: RecipeFormValues; updateForm: SetForm; saving: boolean }) {

  const {
      draft, updateDraft,
      suggestions, addIngredient, removeIngredient, getIngredientLabel,
    } = useRecipeIngredient(form, updateForm);

  return (
    <>
      <Text style={styles.label}>Ingrédients *</Text>
      <TextInput
        style={styles.input}
        value={draft.name}
        onChangeText={(value) => updateDraft('name', value)}
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
              onPress={() => updateDraft('name', ingredient)}
              disabled={saving}
            >
            <Text style={styles.suggestionText}>{ingredient}</Text>
            <Ionicons name="checkmark-circle-outline" size={20} color={C.primary} />
            </Pressable>
        ))}
        </View>
      )}
        <Text style={styles.label}>Quantité et unité *</Text>
            <View style={styles.quantityRow}>
              <TextInput
                style={[styles.input, styles.quantityInput]}
                value={draft.quantity}
                onChangeText={(value) => updateDraft('quantity', value)}
                placeholder="Ex. 200"
                placeholderTextColor="#999999"
                keyboardType="decimal-pad"
                editable={!saving}
              />
              <Pressable
                style={[styles.addButton, saving && disabled]}
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
                  onPress={() => updateDraft('unit', item)}
                  disabled={saving}
                  style={[styles.unitButton, draft.unit === item && styles.unitButtonActive]}
                >
                  <Text style={[styles.unitText, draft.unit === item && styles.unitTextActive]}>
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
                    {getIngredientLabel(index)}
                  </Text>
                  <Ionicons name="close-circle" size={16} color={C.text} />
                </Pressable>
              ))}
            </View>
          </>
  )}

  const styles = StyleSheet.create({
    suggestionText: { color: C.text, fontSize: 15 },
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
    quantityRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    quantityInput: { flex: 1 },
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
    addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  })