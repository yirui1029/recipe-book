
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';


export default function HomeScreen() {

  const [activeTab, setActiveTab] =
  useState<TabName>('Accueil');
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* En-tête */}
        <Text style={styles.title}>Recipe-Book</Text>

        {/* Contenu de l'accueil */}
        <View style={styles.main}>
          <Text style={styles.sectionTitle}>
            Mes recettes
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F0DF',
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#354F43',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  main: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#354F43',
  },
});
