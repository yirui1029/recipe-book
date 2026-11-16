import { Directory, File, Paths } from "expo-file-system";

/** Dossier permanent des photos (dans le stockage de l'app, pas dans le cache). */
function getPhotosDirectory(): Directory {
  const directory = new Directory(Paths.document, "photos");
  if (!directory.exists) {
    directory.create();
  }
  return directory;
}

/**
 * Copie une photo temporaire (cache de la caméra) vers le dossier permanent
 * et renvoie son nouvel URI, à stocker dans Recipe.photoUri.
 */
export async function persistPhoto(tempUri: string): Promise<string> {
  const source = new File(tempUri);
  const extension = tempUri.split("?")[0].split(".").pop() || "jpg";
  const destination = new File(getPhotosDirectory(), `${Date.now()}.${extension}`);

  await source.copy(destination);

  // Nettoyage du fichier temporaire (non bloquant si ça échoue)
  try {
    source.delete();
  } catch {
    /* le cache sera vidé par le système */
  }
  return destination.uri;
}

/** Supprime un fichier photo (à appeler quand on remplace ou supprime une recette). */
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
 * Passe-plat entre l'écran caméra et le formulaire : la caméra y dépose l'URI,
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