export interface Recipe {
  id: string,
  title: string,
  description: string,
  ingredients: string[],
  photoUri?: string,
  latitude?: number,
  longitude?: number,
  placeName?: string,
  createdAt: Date,
  updatedAt: Date
}

/** Données saisies par l'utilisateur : l'id et les dates sont générés ici. */
export type NewRecipe = Omit<Recipe, "id" | "createdAt" | "updatedAt">;
export type RecipeUpdate = Partial<NewRecipe>;

/** Format réellement stocké : JSON ne gère pas les Date, on les stocke en ISO. */
export type StoredRecipe = Omit<Recipe, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};