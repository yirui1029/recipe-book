import RecipeButton from '@/components/ui/recipe-button';
import { RecipeColors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

export default function RecipesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes recettes</Text>

      <Text style={styles.subtitle}>
        Retrouve toutes tes recettes préférées ici.
      </Text>

      <View style={styles.card}>
        <Text style={styles.emoji}>🍲</Text>

        <Text style={styles.cardTitle}>
          Aucune recette pour le moment
        </Text>

        <Text style={styles.description}>
          Commence par ajouter ta première recette !
        </Text>

        <RecipeButton
          title="Ajouter une recette"
          variant="primary"
          onPress={() => {}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RecipeColors.background,
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: RecipeColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: RecipeColors.text,
    marginBottom: 32,
  },
  card: {
    backgroundColor: RecipeColors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: RecipeColors.border,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  emoji: {
    fontSize: 48,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: RecipeColors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: RecipeColors.text,
    textAlign: 'center',
  },
});
