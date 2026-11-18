import { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { RecipeColors as C } from '@/constants/theme';

type Props = {
  children: ReactNode;
};

export default function BotanicalBackground({
  children,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Illustration sur toute la page */}
      <Image
        source={require('@/assets/images/decorations/botanical-background.png')}
        style={styles.background}
        resizeMode="cover"
      />

      {/* Contenu de la page */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    position: 'relative',
  },

  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.75,
  },

  content: {
    flex: 1,
  },
});