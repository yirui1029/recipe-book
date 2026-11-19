import { RecipeColors as C } from '@/constants/theme';
import { usePhotoGallery } from "@/hooks/use-photo-gallery";
import { RecipeFormValues } from "@/types/recipeForm";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";


export default function RecipePhotoPicker({
  form,
  updateForm,
  saving,
  onOpenCamera
}: {
  form: RecipeFormValues;
  updateForm: <K extends keyof RecipeFormValues>(key: K, value: RecipeFormValues[K]) => void;
  onOpenCamera: () => void;
  saving: boolean;
}) {
  const { chooseFromGallery } = usePhotoGallery();

  const handleGalleryPress = async () => {
    const uri = await chooseFromGallery();
    updateForm('photoUri', uri);
  }

  return (
  <>
  {form.photoUri && (
    <>
      <Image
        source={{ uri: form.photoUri }}
        style={styles.photoPreview}
        resizeMode="cover"
      />

      <Pressable
        style={styles.deletePhotoButton}
        onPress={() => updateForm('photoUri', undefined)}
        disabled={saving}
      >
        <Ionicons
          name="trash-outline"
          size={20}
          color="#D32F2F"
        />
        <Text style={styles.deletePhotoText}>
          Supprimer la photo
        </Text>
      </Pressable>
    </>
  )}

  <View style={styles.photoActions}>
    <Pressable
      style={styles.cameraButton}
      onPress={onOpenCamera}
      disabled={saving}
    >
      <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
      <Text style={styles.cameraButtonText}>Caméra</Text>
    </Pressable>

    <Pressable
      style={styles.galleryButton}
      onPress={handleGalleryPress}
      disabled={saving}
    >
      <Ionicons name="images-outline" size={22} color={C.primary} />
      <Text style={styles.galleryButtonText}>Galerie</Text>
    </Pressable>
  </View> 
  </>
  )}
  const styles = StyleSheet.create({
    photoBox: {
        height: 150,
        backgroundColor: C.background,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: C.border,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        gap: 8,
      },
      photo: { width: '100%', height: '100%' },
      photoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        gap: 8,
      },
      changePhotoText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
      photoLabel: { color: C.primary, fontWeight: '600' },
      photoPreview: {
        width: '100%',
        height: 180,
        borderRadius: 16,
      },
      deletePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#D32F2F',
        borderRadius: 12,
        paddingVertical: 12,
      },
      deletePhotoText: {
        color: '#D32F2F',
        fontWeight: '600',
      },
      photoActions: {
        flexDirection: 'row',
        gap: 10,
      },
      cameraButton: {
        flex: 1,
        backgroundColor: C.primary,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
      },
      cameraButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
      },
      galleryButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: C.primary,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
      },
      galleryButtonText: {
        color: C.primary,
        fontWeight: '600',
      },
  })