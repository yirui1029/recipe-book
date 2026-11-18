import { Slot, usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavigation from '@/components/ui/bottom-navigation';
import CreateRecipeModal from '@/app/(app)/create-recipe-modal';
import { RecipeColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthProvider';
import { consumePendingPhoto } from '@/utils/photos';
import type { NewRecipe } from '@/types/recipe';

export default function AppTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [photoUri, setPhotoUri] = useState<string>();

  const returningFromCamera = useRef(false);

  const openCamera = () => {
    returningFromCamera.current = true;
    setModalVisible(false);
    router.push('/camera');
  };

  useEffect(() => {
    if (pathname !== '/recipes') return;
    if (!returningFromCamera.current) return;

    returningFromCamera.current = false;

    const uri = consumePendingPhoto();

    if (uri) {
      setPhotoUri(uri);
    }

    // Même si l'utilisateur annule la photo,
    // on retrouve son formulaire.
    setModalVisible(true);
  }, [pathname]);

  const handleSaveRecipe = async (recipe: NewRecipe) => {
    console.log('Nouvelle recette :', recipe);

    // Ici, tu pourras appeler ton service Firebase.
    Alert.alert('Succès', 'Le formulaire a été validé.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Slot />
      </View>

      <View style={styles.navigation}>
        <BottomNavigation />
      </View>

      <CreateRecipeModal
        visible={modalVisible}
        userId={user?.uid ?? ''}
        photoUri={photoUri}
        onOpenCamera={openCamera}
        onClose={() => {
          setModalVisible(false);
          setPhotoUri(undefined);
        }}
        onSave={handleSaveRecipe}
        onSelectPhoto={setPhotoUri}
        onRemovePhoto={() => setPhotoUri(undefined)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RecipeColors.background,
  },
  content: {
    flex: 1,
  },
  navigation: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: RecipeColors.background,
  },
});