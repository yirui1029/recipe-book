import { INGREDIENTS } from '@/data/ingredients';
import { getCustomIngredients, saveCustomIngredient } from '@/storage/ingredient-storage';
import { RecipeFormValues } from '@/types/recipeForm';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

export type SetForm = <K extends keyof RecipeFormValues>(key: K, value: RecipeFormValues[K]) => void;

const EMPTY_DRAFT = { name: '', quantity: '', unit: 'g' };

export function useRecipeIngredient(form: RecipeFormValues, setForm: SetForm) {
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  // Brouillon : tout en string, car c'est ce que renvoie un TextInput
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  useEffect(() => {
    getCustomIngredients().then(setCustomIngredients);
  }, []);

  const updateDraft = (key: keyof typeof EMPTY_DRAFT, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const resetDraft = () => setDraft(EMPTY_DRAFT);

  const parseQuantity = (raw: string) => {
    const value = Number(raw.trim().replace(',', '.'));
    return Number.isFinite(value) && value > 0 ? value : null;
  };

  const hasPending = draft.name.trim() !== '' || draft.quantity.trim() !== '';

  const isDuplicate = (name: string) =>
    form.ingredients.some((i) => i.name.toLowerCase() === name.toLowerCase());

  const suggestions = useMemo(() => {
    const search = draft.name.trim().toLowerCase();
    if (!search) return [];
    return [...new Set([...INGREDIENTS, ...customIngredients])]
      .filter((i) => i.toLowerCase().includes(search) && !isDuplicate(i))
      .slice(0, 5);
  }, [draft.name, customIngredients, form.ingredients]);

  async function addIngredient() {
    const name = draft.name.trim();
    const quantity = parseQuantity(draft.quantity);

    if (!name) return Alert.alert('Ingrédient manquant', 'Saisis le nom de l’ingrédient.');
    if (quantity === null) return Alert.alert('Quantité invalide', 'Saisis une quantité supérieure à zéro.');
    if (isDuplicate(name)) return Alert.alert('Ingrédient déjà ajouté', 'Cet ingrédient est déjà dans la liste.');

    await saveCustomIngredient(name);
    setCustomIngredients(await getCustomIngredients());

    setForm('ingredients', [...form.ingredients, { name, quantity, unit: draft.unit }]);
    resetDraft();
  }

  const removeIngredient = (index: number) =>
    setForm('ingredients', form.ingredients.filter((_, i) => i !== index));

  const getIngredientLabel = (index: number): string => {
    const item = form.ingredients[index];
    return item ? `${item.quantity} ${item.unit} — ${item.name}` : '';
  };

  return {
    draft,
    updateDraft,
    resetDraft,
    hasPending,
    suggestions,
    addIngredient,
    removeIngredient,
    getIngredientLabel,
  };
}