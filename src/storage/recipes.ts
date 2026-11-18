import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
// Adaptez ces chemins à votre arborescence
import type { NewRecipe, Recipe, RecipeUpdate } from "../types/recipe";
import {
  deletePhotoForRecipe,
  getLocalPhotoUri,
  savePhotoForRecipe,
} from "../utils/photos";
import { auth, db } from "./firebase";

/*
 * Prérequis : ajouter `hasPhoto?: boolean` à l'interface Recipe.
 *
 * Répartition des données :
 *  - Firestore (collection "recipes") : tout sauf la photo, plus un indicateur `hasPhoto`.
 *  - Téléphone : la photo, dans photos/<recipeId>.jpg (voir utils/photos.ts).
 * Recipe.photoUri n'est donc jamais écrit dans Firestore : il est recalculé à chaque lecture.
 */

const recipesRef = collection(db, "recipes");

function requireUid(): string {
  const user = auth.currentUser;
  if (!user) throw new Error("Vous devez être connecté.");
  return user.uid;
}

const toDate = (value: unknown): Date =>
  value instanceof Timestamp ? value.toDate() : new Date();

const isPermissionDenied = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { code?: string }).code === "permission-denied";

function toRecipe(id: string, data: DocumentData): Recipe {
  return {
    id,
    userId: auth.currentUser!.uid,
    title: data.title,
    description: data.description ?? "",
    ingredients: data.ingredients ?? [],
    latitude: data.latitude,
    longitude: data.longitude,
    placeName: data.placeName,
    hasPhoto: data.hasPhoto ?? false,
    photoUri: getLocalPhotoUri(id), // undefined sur un téléphone qui n'a pas la photo
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

/** Recettes de l'utilisateur connecté, de la plus récente à la plus ancienne. */
export async function getRecipes(): Promise<Recipe[]> {
  const uid = requireUid();
  // Le filtre sur userId est obligatoire : les règles de sécurité refusent une requête plus large.
  // Cette requête demande un index composite : Firestore affiche un lien pour le créer au premier appel.
  const q = query(recipesRef, where("userId", "==", uid), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toRecipe(d.id, d.data()));
}

/** Une recette par id, ou null si elle n'existe pas ou n'est pas accessible. */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    const snapshot = await getDoc(doc(db, "recipes", id));
    return snapshot.exists() ? toRecipe(snapshot.id, snapshot.data()) : null;
  } catch (error) {
    // Un id inexistant est refusé par les règles (resource est null) : on le traite comme « introuvable ».
    if (isPermissionDenied(error)) return null;
    throw error;
  }
}

/** Crée la recette dans Firestore et copie sa photo sur le téléphone. */
export async function createRecipe(data: NewRecipe): Promise<Recipe> {
  const uid = requireUid();
  const title = data.title.trim();
  if (!title) throw new Error("Le titre est obligatoire.");

  const { photoUri, ...fields } = data;
  const description = fields.description.trim();
  const ingredients = fields.ingredients;

  const ref = doc(recipesRef); // l'id est généré côté client, avant l'écriture
  const localPhotoUri = photoUri ? await savePhotoForRecipe(ref.id, photoUri) : undefined;

  try {
    await setDoc(ref, {
      ...fields,
      title,
      description,
      ingredients,
      userId: uid,
      isPublic: false,
      hasPhoto: !!localPhotoUri,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    deletePhotoForRecipe(ref.id); // annule la copie locale si l'écriture échoue
    throw error;
  }

  const now = new Date();
  return {
    ...fields,
    id: ref.id,
    userId: uid,
    title,
    description,
    ingredients,
    hasPhoto: !!localPhotoUri,
    photoUri: localPhotoUri,
    createdAt: now,
    updatedAt: now,
  };
}

/** Met à jour une recette. Renvoie null si elle est introuvable. */
export async function updateRecipe(
  id: string,
  changes: RecipeUpdate
): Promise<Recipe | null> {
  const current = await getRecipeById(id);
  if (!current) return null;

  const { photoUri, ...fields } = changes;
  const patch: Record<string, unknown> = {};

  if (fields.title !== undefined) {
    const title = fields.title.trim();
    if (!title) throw new Error("Le titre est obligatoire.");
    patch.title = title;
  }
  if (fields.description !== undefined) patch.description = fields.description.trim();
  if (fields.ingredients !== undefined) patch.ingredients = fields.ingredients;
  if (fields.latitude !== undefined) patch.latitude = fields.latitude;
  if (fields.longitude !== undefined) patch.longitude = fields.longitude;
  if (fields.placeName !== undefined) patch.placeName = fields.placeName;

  let newPhotoUri = current.photoUri;
  if (photoUri === null) {
    deletePhotoForRecipe(id);
    newPhotoUri = undefined;
    patch.hasPhoto = false;
  } else if (photoUri !== undefined && photoUri !== current.photoUri) {
    newPhotoUri = await savePhotoForRecipe(id, photoUri);
    patch.hasPhoto = true;
  }

  await updateDoc(doc(db, "recipes", id), { ...patch, updatedAt: serverTimestamp() });

  return { ...current, ...patch, photoUri: newPhotoUri, updatedAt: new Date() } as Recipe;
}

/** Supprime la recette (Firestore) et sa photo (téléphone). Renvoie false si elle est introuvable. */
export async function deleteRecipe(id: string): Promise<boolean> {
  const existing = await getRecipeById(id);
  if (!existing) return false;
  await deleteDoc(doc(db, "recipes", id));
  deletePhotoForRecipe(id);
  return true;
}