import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { RecipeColors as C } from '@/constants/theme';

export default function CookingLoader() {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/decorations/cooking-loader.gif')}
        style={styles.animation}
        contentFit="contain"
        autoplay
      />

      <Text style={styles.message}>
        On prépare ton carnet de recettes...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.background,
    padding: 24,
  },

  animation: {
    width: 240,
    height: 240,
  },

  message: {
    marginTop: 16,
    fontSize: 15,
    fontStyle: 'italic',
    color: C.primary,
    textAlign: 'center',
  },
});