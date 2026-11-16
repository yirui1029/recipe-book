import AsyncStorage from "@react-native-async-storage/async-storage";
// Adaptez ce chemin à l'endroit où vous avez placé l'interface Recipe
import type { NewRecipe, Recipe, RecipeUpdate, StoredRecipe } from "../types/recipe";

const STORAGE_KEY = "recipes";

const toStored = (recipe: Recipe): StoredRecipe => ({
  ...recipe,
  createdAt: recipe.createdAt.toISOString(),
  updatedAt: recipe.updatedAt.toISOString(),
});

const fromStored = (stored: StoredRecipe): Recipe => ({
  ...stored,
  createdAt: new Date(stored.createdAt),
  updatedAt: new Date(stored.updatedAt),
});

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const cleanIngredients = (ingredients: string[]): string[] =>
  ingredients.map((i) => i.trim()).filter((i) => i.length > 0);

/**
 * File d'attente : AsyncStorage ne gère pas les écritures concurrentes.
 * Sans elle, deux enregistrements rapprochés peuvent s'écraser (lecture, modification, écriture).
 */
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task);
  queue = result.catch(() => undefined);
  return result;
}

async function readAll(): Promise<StoredRecipe[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // On lève une erreur plutôt que de renvoyer [] : sinon la prochaine écriture effacerait les données.
    throw new Error("Les données des recettes sont corrompues.");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("Format des données des recettes invalide.");
  }
  return parsed as StoredRecipe[];
}

async function writeAll(recipes: StoredRecipe[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

/** Toutes les recettes, de la plus récente à la plus ancienne. */
export async function getRecipes(): Promise<Recipe[]> {
  const stored = await readAll();
  return stored
    .map(fromStored)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/** Une recette par id, ou null si elle n'existe pas. */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const stored = await readAll();
  const found = stored.find((r) => r.id === id);
  return found ? fromStored(found) : null;
}

/** Sauvegarde une nouvelle recette et la renvoie avec son id et ses dates. */
export function createRecipe(data: NewRecipe): Promise<Recipe> {
  const title = data.title.trim();
  if (!title) {
    return Promise.reject(new Error("Le titre est obligatoire."));
  }

  return enqueue(async () => {
    const now = new Date();
    const recipe: Recipe = {
      ...data,
      id: generateId(),
      title,
      description: data.description.trim(),
      ingredients: cleanIngredients(data.ingredients),
      createdAt: now,
      updatedAt: now,
    };
    const stored = await readAll();
    await writeAll([...stored, toStored(recipe)]);
    return recipe;
  });
}

/** Met à jour une recette. Renvoie null si l'id est inconnu. */
export function updateRecipe(
  id: string,
  changes: RecipeUpdate
): Promise<Recipe | null> {
  return enqueue(async () => {
    const stored = await readAll();
    const index = stored.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const current = fromStored(stored[index]);
    const updated: Recipe = {
      ...current,
      ...changes,
      title: changes.title !== undefined ? changes.title.trim() : current.title,
      ingredients:
        changes.ingredients !== undefined
          ? cleanIngredients(changes.ingredients)
          : current.ingredients,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date(),
    };
    if (!updated.title) throw new Error("Le titre est obligatoire.");

    stored[index] = toStored(updated);
    await writeAll(stored);
    return updated;
  });
}

/** Supprime une recette. Renvoie false si l'id est inconnu. */
export function deleteRecipe(id: string): Promise<boolean> {
  return enqueue(async () => {
    const stored = await readAll();
    const remaining = stored.filter((r) => r.id !== id);
    if (remaining.length === stored.length) return false;
    await writeAll(remaining);
    return true;
  });
}