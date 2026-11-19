import { deletePhoto } from "@/utils/photos";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Alert } from "react-native";

type Options = {
  onPhoto: (uri: string) => void;
  onCancel: () => void;
};

export function useCamera({ onPhoto, onCancel }: Options) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | undefined>();

  const takePicture = async () => {
    if (!cameraRef.current || !cameraReady || busy) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) setPreviewUri(photo.uri);
    } catch {
      Alert.alert("Erreur", "Impossible de prendre la photo. Réessayez.");
    } finally {
      setBusy(false);
    }
  };

  const retake = () => {
    deletePhoto(previewUri);
    setPreviewUri(undefined);
    setCameraReady(false);
  };

  const usePhoto = () => {
    if (!previewUri || busy) return;
    onPhoto(previewUri);
  };

  const cancel = () => {
    deletePhoto(previewUri);
    onCancel();
  };

  return {
    cameraRef, permission, requestPermission,
    cameraReady, setCameraReady, busy,
    previewUri, cancel, takePicture, retake, usePhoto,
  };
}