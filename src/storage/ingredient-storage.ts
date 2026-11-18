import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'recipe_book_custom_ingredients';

export async function getCustomIngredients(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lecture ingrédients :', error);
    return [];
  }
}

export async function saveCustomIngredient(
  ingredient: string
): Promise<void> {
  const name = ingredient.trim();

  if (!name) return;

  const ingredients = await getCustomIngredients();

  const exists = ingredients.some(
    (item) => item.toLowerCase() === name.toLowerCase()
  );

  if (exists) return;

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...ingredients, name])
  );
}