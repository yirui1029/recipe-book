import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const useLocation = () => {

  // Récupérer la localisation actuelle de l'utilisateur
  const getCurrentLocation = async () => {
    try {
      // Demander la permission
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Autorisez la localisation pour enregistrer le lieu de la recette.'
        );
        return;
      }

      // Récupérer les coordonnées GPS
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      // Récupérer le nom du lieu
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = addresses[0];

      const placeName = address
        ? [address.city, address.region, address.country]
            .filter(Boolean)
            .join(', ')
        : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      return {
        latitude,
        longitude,
        placeName,
      };

    } catch (error) {
      console.error('Erreur localisation :', error);

      Alert.alert(
        'Erreur',
        'Impossible de récupérer votre localisation.'
      );
    }
  };

  return { getCurrentLocation };
};