Plan de développement : app de recettes (4 jours, équipe de 2)
16 nov. 2026 · @Mathis
Ce qui change
En 4 jours à deux, on garde le cycle complet (créer, lister, voir, modifier, supprimer) avec photo et lieu, et on coupe tout le reste.
• Périmètre : cycle complet avec photo (expo-camera) et localisation (expo-location). Partage et recherche par proximité restent pour la v2.
• Persistance : expo-sqlite ou AsyncStorage, au choix. Avec 4 jours, AsyncStorage (une clé JSON avec le tableau des recettes) est plus rapide à mettre en place et suffisant pour la v1. Isolez tout derrière un module storage/recipes.ts pour pouvoir migrer ensuite.
• Parallélisation : les deux personnes travaillent sur des blocs indépendants dès l'après-midi du jour 1.
Répartition
Chaque personne possède un bloc indépendant, ce qui limite les conflits Git.
Rôle
Responsabilités
Personne A (données et écrans de lecture)
Stockage, liste, détail, édition, suppression
Personne B (capteurs et saisie)
Caméra, formulaire, ingrédients, localisation
Contrat à fixer ensemble le jour 1
Ce contrat, écrit avant de se séparer, évite les conflits d'intégration.
• Type Recipe : id, title, description, ingredients: string[], photoUri?, latitude?, longitude?, placeName?, createdAt, updatedAt.
• Signatures du stockage : getRecipes(), getRecipeById(id), createRecipe(data), updateRecipe(id, data), deleteRecipe(id).
• Routes : /, /recipe/new, /recipe/[id], /recipe/edit/[id], /camera.
• Propriété des fichiers : une seule personne par fichier, sauf _layout.tsx qui est figé dès l'étape 0.
• Git : une branche par personne, de petits merges sur main en fin de demi-journée.
Étape 0 : socle commun (jour 1, matin, à deux)
Objectif : un projet qui tourne sur les deux téléphones, avec le contrat commun poussé sur main.
Tâches
• Projet avec le template Expo Router (TypeScript), installation de expo-camera, expo-location, expo-file-system (et expo-sqlite si choisi).
• Permissions dans app.json.
• _layout.tsx avec le Stack, écrans squelettes vides pour toutes les routes, type Recipe, signatures du stockage (même avec des fonctions vides).
Points de validation
[ ] L'app tourne sur les deux téléphones via Expo Go (ou development build) et npx expo-doctor est propre.
[ ] On navigue entre tous les écrans squelettes, retour arrière compris.
[ ] [id] est lu avec useLocalSearchParams.
[ ] Le contrat (type, signatures, routes) est écrit dans le README et poussé sur main.
Étape 1 : deux chantiers indépendants (jour 1, après-midi)
A livre le stockage, B livre la caméra, puis on fusionne et on fait une démo de 10 minutes.
A : stockage
Implémenter le CRUD complet avec gestion des erreurs (recette inexistante, lecture impossible).
[ ] Une recette créée par code survit à la fermeture complète de l'app.
[ ] Chaque fonction du CRUD est testée (même avec un bouton de debug temporaire).
[ ] Un id inconnu renvoie null ou une erreur gérée, sans crash.
B : caméra
• Écran camera.tsx : permission (useCameraPermissions), CameraView, bouton de capture, aperçu "Reprendre / Utiliser".
• Copie de la photo vers documentDirectory (l'URI de la caméra est temporaire).
• Renvoi de l'URI à l'écran appelant.
Points de validation
[ ] Permission acceptée : la photo se prend et s'affiche dans l'aperçu.
[ ] Permission refusée : message clair et lien vers les réglages, sans crash.
[ ] Le fichier copié existe toujours après redémarrage de l'app.
[ ] Testé sur un vrai téléphone.
Synchro de fin de jour : merge des deux branches, démo rapide de 10 minutes.
Étape 2 : lecture et saisie (jour 2)
Jalon de fin de jour : le parcours créer → liste → détail fonctionne sur un téléphone.
A : liste et détail
• FlatList avec RecipeCard (vignette, titre, date), tri par plus récent, état vide, rechargement avec useFocusEffect.
• Écran détail : photo, titre, description, ingrédients, lieu, date, gestion d'un id invalide.
Points de validation
[ ] Avec 30 à 50 recettes de test, le défilement est fluide.
[ ] Une recette créée apparaît au retour sur la liste sans relancer l'app.
[ ] L'état vide s'affiche, un appui sur une carte ouvre le bon détail.
[ ] Un id inexistant affiche un message au lieu de planter.
B : formulaire de création
• Composant RecipeForm réutilisable (il servira aussi à l'édition, donc à penser dès maintenant avec des initialValues).
• Titre obligatoire, description multiligne, ingrédients (saisie plus bouton "Ajouter", suppression), bouton photo qui ouvre la caméra.
• Gestion du clavier, validation, enregistrement via le CRUD.
Points de validation
[ ] Impossible d'enregistrer sans titre, avec un message clair.
[ ] Ajout et suppression d'ingrédients fonctionnent, les lignes vides sont ignorées.
[ ] Le clavier ne masque jamais le champ en cours de saisie.
[ ] Une recette avec photo s'enregistre et réapparaît correctement dans la liste d'A.
[ ] Une recette sans photo reste enregistrable.
Synchro de fin de jour : parcours complet créer → liste → détail sur un téléphone.
Étape 3 : cycle de vie et localisation (jour 3)
À la fin du jour 3, c'est le feature freeze : plus aucune nouvelle fonctionnalité ensuite.
A : modification et suppression
• Écran d'édition qui réutilise RecipeForm avec les valeurs initiales.
• Suppression avec confirmation (Alert), qui supprime aussi le fichier photo.
• Si la photo est changée à l'édition, suppression de l'ancien fichier.
Points de validation
[ ] Une modification est visible immédiatement dans la liste et le détail.
[ ] La suppression retire la recette et le fichier image du stockage.
[ ] Création et édition utilisent le même composant, sans code dupliqué.
B : localisation
• Permission foreground uniquement, getCurrentPositionAsync avec indicateur de chargement et timeout.
• Un hook useCurrentLocation intégré au formulaire, avec une option pour désactiver la localisation sur une recette.
• Affichage du lieu dans le détail (coordonnées, ou nom du lieu si le géocodage inverse est gardé).
Points de validation
[ ] Permission accordée : latitude et longitude sont enregistrées en nombres.
[ ] Permission refusée ou GPS coupé : la recette s'enregistre quand même, sans lieu.
[ ] L'interface ne se bloque pas pendant la récupération de la position.
[ ] Aucune demande de permission en arrière-plan.
Synchro de fin de jour : feature freeze.
Étape 4 : intégration, tests et livraison (jour 4)
Matin, à deux
• Parcours complet : créer avec photo et lieu, retrouver, modifier, supprimer.
• Tests croisés : chacun teste le code de l'autre sur son propre téléphone.
• Tous les cas de permissions refusées, texte très long, liste vide, redémarrage complet.
• Correction des bugs trouvés, par priorité.
Après-midi
• Finitions visuelles (couleurs, espacements, icône, splash screen).
• États de chargement et d'erreur partout.
• README : fonctionnalités, installation, choix techniques, pistes v2.
• Buffer pour les imprévus : ne le comblez pas avec de nouvelles fonctionnalités.
Checklist finale de validation
[ ] Le parcours complet fonctionne sans erreur sur au moins un Android et/ou un iOS.
[ ] Les données et les photos survivent à un redémarrage complet.
[ ] Toutes les permissions refusées sont gérées proprement.
[ ] Aucun warning bloquant dans la console.
[ ] Le README est à jour et main est propre.
Coupes pour tenir en 4 jours
Ces éléments sont retirés de la v1 pour protéger le cycle créer, lire, modifier, supprimer.
• Retirés : géocodage inverse (on affiche les coordonnées ou "Lieu enregistré"), bascule caméra avant/arrière, pull-to-refresh, build EAS, carte react-native-maps, recherche par proximité et partage.
• Ordre de sacrifice si retard : finitions visuelles poussées, puis suppression des photos orphelines (à noter dans le README comme dette connue), puis localisation.
• Jamais sacrifiés : le cycle créer / lire / modifier / supprimer et la persistance des photos.
Points de vigilance
• Les risques techniques principaux sont la caméra et la localisation (permissions, vrai appareil), d'où leur lancement dès le jour 1 pour la caméra et le jour 3 pour la localisation, avec la marge du jour 4.
• Le plus gros risque d'équipe est l'intégration tardive : les synchros de fin de journée sont là pour ça, ne les sautez pas.
• Si l'un des deux finit en avance, l'aider à tester l'autre bloc vaut mieux que commencer une fonctionnalité hors périmètre.
Tickets
Un ticket par livrable, avec son responsable et ses critères d'acceptation (repris des points de validation).
#
Étape
Jour
Titre
Responsable
Critères d'acceptation
1
0
J1 matin
Initialiser le projet Expo Router (TypeScript)
A + B
App lancée sur les deux téléphones ; npx expo-doctor propre ; permissions configurées dans app.json
2
0
J1 matin
Figer le contrat et créer les écrans squelettes
A + B
Navigation et retour arrière OK ; [id] lu avec useLocalSearchParams ; type, signatures et routes dans le README sur main
3
1
J1 après-midi
Module de stockage CRUD
A
Recette persistée après fermeture complète ; chaque fonction testée ; id inconnu géré sans crash
4
1
J1 après-midi
Écran caméra avec copie permanente de la photo
B
Photo prise et prévisualisée ; permission refusée gérée avec lien vers les réglages ; fichier toujours présent après redémarrage ; testé sur vrai téléphone
5
2
J2
Liste des recettes (FlatList, RecipeCard, état vide)
A
Défilement fluide avec 30 à 50 recettes ; nouvelle recette visible au retour sans relancer ; tri par plus récent ; état vide affiché
6
2
J2
Écran détail d'une recette
A
Photo, titre, description, ingrédients, lieu et date affichés ; id inexistant géré avec un message
7
2
J2
Composant RecipeForm de création (ingrédients, photo)
B
Titre obligatoire avec message clair ; ajout/suppression d'ingrédients, lignes vides ignorées ; clavier jamais masquant ; enregistrable avec ou sans photo
8
3
J3
Modification d'une recette via RecipeForm
A
Modification visible immédiatement dans la liste et le détail ; même composant que la création, sans code dupliqué
9
3
J3
Suppression avec confirmation et nettoyage des photos
A
Confirmation via Alert ; recette et fichier image supprimés ; ancien fichier supprimé si la photo est changée
10
3
J3
Localisation (hook useCurrentLocation, affichage du lieu)
B
Latitude et longitude stockées en nombres ; refus de permission ou GPS coupé sans blocage de l'enregistrement ; timeout géré ; option de désactivation ; pas de permission en arrière-plan
11
4
J4 matin
Tests croisés et correction des bugs
A + B
Parcours complet créer → modifier → supprimer OK ; permissions refusées, texte long, liste vide et redémarrage testés
12
4
J4 après-midi
Finitions visuelles et états de chargement/erreur
A + B
Couleurs, icône et splash screen cohérents ; états de chargement et d'erreur présents partout
13
4
J4 après-midi
README et livraison
A + B
README à jour (fonctionnalités, installation, choix techniques, pistes v2) ; main propre ; aucun warning bloquant