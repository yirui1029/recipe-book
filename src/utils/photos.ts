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

/** Fichiers photo d'une recette : <id>-<timestamp>.jpg (et l'ancien format <id>.jpg). */
function findPhotoFiles(recipeId: string): File[] {
  const directory = getPhotosDirectory();
  return directory
    .list()
    .filter(
      (entry): entry is File =>
        entry instanceof File &&
        (entry.name.startsWith(`${recipeId}-`) || entry.name === `${recipeId}.jpg`)
    )
    // les timestamps ont la même longueur : le tri par nom donne le plus récent en dernier
    .sort((a, b) => (a.name < b.name ? -1 : 1));
}

/** URI de la photo locale d'une recette, ou undefined si ce téléphone n'en a pas. */
export function getLocalPhotoUri(recipeId: string): string | undefined {
  try {
    const files = findPhotoFiles(recipeId);
    return files.length ? files[files.length - 1].uri : undefined;
  } catch {
    return undefined;
  }
}

/** Copie une photo vers un nouveau fichier unique, puis supprime les anciennes. */
export async function savePhotoForRecipe(
  recipeId: string,
  sourceUri: string
): Promise<string> {
  const existing = findPhotoFiles(recipeId);
  if (existing.some((f) => f.uri === sourceUri)) return sourceUri; // déjà la bonne photo

  const source = new File(sourceUri);
  if (!source.exists) {
    throw new Error("La photo source est introuvable.");
  }

  const destination = new File(getPhotosDirectory(), `${recipeId}-${Date.now()}.jpg`);
  await source.copy(destination);

  // On supprime les anciennes versions seulement après la copie réussie
  existing.forEach((f) => {
    try { f.delete(); } catch { /* ignoré */ }
  });
  try { source.delete(); } catch { /* le cache sera vidé par le système */ }

  return destination.uri;
}

/** Supprime toutes les photos locales d'une recette. */
export function deletePhotoForRecipe(recipeId: string): void {
  try {
    findPhotoFiles(recipeId).forEach((f) => f.delete());
  } catch (error) {
    console.warn("Suppression de la photo impossible :", error);
  }
}