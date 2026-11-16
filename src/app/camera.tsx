import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { deletePhoto, persistPhoto, setPendingPhoto } from "../utils/photos";

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  // 1. Permission en cours de chargement
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  // 2. Permission non accordée : message clair, sans crash
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          L'accès à la caméra est nécessaire pour photographier vos plats.
        </Text>
        {permission.canAskAgain ? (
          <Button title="Autoriser la caméra" onPress={requestPermission} />
        ) : (
          <Button title="Ouvrir les réglages" onPress={() => Linking.openSettings()} />
        )}
        <Button title="Annuler" onPress={() => router.back()} />
      </View>
    );
  }

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
    deletePhoto(previewUri); // évite de laisser un fichier orphelin
    setPreviewUri(null);
    setCameraReady(false);
  };

  const usePhoto = async () => {
    if (!previewUri || busy) return;
    setBusy(true);
    try {
      const savedUri = await persistPhoto(previewUri);
      setPendingPhoto(savedUri);
      router.back();
    } catch {
      Alert.alert("Erreur", "Impossible d'enregistrer la photo.");
      setBusy(false);
    }
  };

  const cancel = () => {
    deletePhoto(previewUri);
    router.back();
  };

  return (
    <View style={styles.container}>
      {previewUri ? (
        <Image source={{ uri: previewUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          onCameraReady={() => setCameraReady(true)}
        />
      )}

      <View style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}>
        {previewUri ? (
          <>
            <Button title="Reprendre" onPress={retake} disabled={busy} />
            <Button title="Utiliser" onPress={usePhoto} disabled={busy} />
          </>
        ) : (
          <>
            <Button title="Annuler" onPress={cancel} />
            <Pressable
              onPress={takePicture}
              disabled={!cameraReady || busy}
              style={[styles.shutter, (!cameraReady || busy) && styles.shutterDisabled]}
            />
            <View style={styles.spacer} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  message: { textAlign: "center", fontSize: 16 },
  controls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.5)",
  },
  shutterDisabled: { opacity: 0.4 },
  spacer: { width: 72 },
});