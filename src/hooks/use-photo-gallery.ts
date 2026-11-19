import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const usePhotoGallery = () => {
    // choisir une photo dans le telephone de l'utilisateur 
  const chooseFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets.length > 0) return result.assets[0].uri
    } catch (error) {
      console.error('Erreur galerie :', error);
      Alert.alert('Erreur', "Impossible d'ouvrir la galerie.");
    }
  };
  return { chooseFromGallery };
}