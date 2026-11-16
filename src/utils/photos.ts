import { Directory, File, Paths } from "expo-file-system";

/**
 * Principe : la photo d'une recette est un fichier local nommé d'après l'id de la recette
 * (photos/<recipeId>.jpg). Aucun chemin n'est stocké dans Firestore : l'URI est reconstruit
 * à la lecture, ce qui évite aussi le problème des chemins absolus qui changent sur iOS.
 */

function getPhotosDirectory(): Directory {
  const directory = new Directory(Paths.document, "photos");
  if (!directory.exists) {
    directory.create();
  }
  return directory;
}

function photoFile(recipeId: string): File {
  return new File(getPhotosDirectory(), `${recipeId}.jpg`);
}

/** URI de la photo locale d'une recette, ou undefined si ce téléphone n'en a pas. */
export function getLocalPhotoUri(recipeId: string): string | undefined {
  try {
    const file = photoFile(recipeId);
    return file.exists ? file.uri : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Copie une photo (par exemple le fichier temporaire de la caméra) vers photos/<recipeId>.jpg.
 * Remplace la photo existante s'il y en a une, puis supprime le fichier source.
 */
export async function savePhotoForRecipe(
  recipeId: string,
  sourceUri: string
): Promise<string> {
  const destination = photoFile(recipeId);
  if (sourceUri === destination.uri) return destination.uri; // déjà la bonne photo

  const source = new File(sourceUri);
  if (!source.exists) {
    throw new Error("La photo source est introuvable.");
  }
  if (destination.exists) {
    destination.delete();
  }

  // "await" est sans effet si copy() est synchrone dans votre version du SDK
  await source.copy(destination);

  try {
    source.delete();
  } catch {
    /* le cache sera vidé par le système */
  }
  return destination.uri;
}

/** Supprime la photo locale d'une recette. */
export function deletePhotoForRecipe(recipeId: string): void {
  try {
    const file = photoFile(recipeId);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn("Suppression de la photo impossible :", error);
  }
}

/** Supprime un fichier temporaire (par exemple « Reprendre » dans l'écran caméra). */
export function deletePhoto(uri?: string | null): void {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn("Suppression de la photo impossible :", error);
  }
}

/**
 * Passe-plat entre l'écran caméra et le formulaire : la caméra y dépose l'URI temporaire,
 * le formulaire le récupère au retour sur son écran, sans perdre ce qui a été saisi.
 */
let pendingPhotoUri: string | null = null;

export function setPendingPhoto(uri: string): void {
  pendingPhotoUri = uri;
}

export function consumePendingPhoto(): string | null {
  const uri = pendingPhotoUri;
  pendingPhotoUri = null;
  return uri;
}