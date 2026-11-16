
import { Slot } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavigation from '@/components/ui/bottom-navigation';
import { RecipeColors } from '@/constants/theme';

export default function AppTabs() {
  return (
    <SafeAreaView
      style={styles.container}
      edges={['bottom']}
    >
      <View style={styles.content}>
        <Slot />
      </View>

      <View style={styles.navigation}>
        <BottomNavigation />
      </View>
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
