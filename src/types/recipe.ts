export interface Recipe {
  id: string,
  userId: string,
  title: string,
  description: string,
  ingredients: RecipeIngredient[],
  photoUri?: string,
  latitude?: number,
  longitude?: number,
  placeName?: string,
  createdAt: Date,
  updatedAt: Date,
  hasPhoto: boolean
}

export type RecipeIngredient = {
  name: string
  quantity: number
  unit: string
}

export type NewRecipe = Omit<Recipe, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'hasPhoto'>;

export type RecipeUpdate = Partial<Omit<NewRecipe, 'photoUri'>> & {
  photoUri?: string | null; // une URI pour changer la photo, null pour la supprimer
};