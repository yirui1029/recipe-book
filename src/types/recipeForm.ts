import { RecipeIngredient } from "./recipe";

/**
 * Un seul état pour le contenu de la recette, que l'on crée ou que l'on modifie :
 * seule sa valeur de départ change (vide, ou issue de la recette à modifier).
 */
export interface RecipeFormValues {
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  photoUri?: string;
  placeName: string;
}