
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { usePathname, useRouter } from 'expo-router';

import { RecipeColors } from '@/constants/theme';

type Tab = {
  name: string;
  route: '/' | '/recipes' | '/profile';
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const tabs: Tab[] = [
  {
    name: 'Accueil',
    route: '/',
    icon: 'home-outline',
  },
  {
    name: 'Recettes',
    route: '/recipes',
    icon: 'book-outline',
  },
  {
    name: 'Profil',
    route: '/profile',
    icon: 'person-outline',
  },
];

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = pathname === tab.route;

        return (
          <Pressable
            key={tab.name}
            onPress={() => router.replace(tab.route)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[
              styles.tab,
              active && styles.activeTab,
            ]}
          >
            <Ionicons
              name={tab.icon}
              size={23}
              color={
                active
                  ? RecipeColors.surface
                  : RecipeColors.text
              }
            />

            <Text
              style={[
                styles.label,
                active && styles.activeLabel,
              ]}
            >
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: RecipeColors.surface,
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: RecipeColors.border,
    gap: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },
  tab: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    gap: 3,
  },
  activeTab: {
    backgroundColor: RecipeColors.primary,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: RecipeColors.text,
  },
  activeLabel: {
    color: RecipeColors.surface,
  },
});
