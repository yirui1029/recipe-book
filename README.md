Recipe Book

Application mobile de recettes personnelles développée avec **React Native**, **Expo**.

 Présentation du projet

Recipe Book permet aux utilisateurs de créer et de conserver leurs recettes personnelles.

L'application permettra notamment de :

* Ajouter une recette avec son nom, sa description et ses ingrédients.
* Prendre une photo d'un plat ou choisir une photo dans la galerie.
* Consulter la liste des recettes enregistrées.
* Afficher le détail d'une recette.
* Retrouver ses recettes facilement.

## 🛠️ Technologies utilisées

* React Native
* Expo
* Expo Router
* Expo Camera
* Expo Image Picker



### Convention des commits

* `feat:` nouvelle fonctionnalité
* `fix:` correction d'un bug
* `refactor:` amélioration du code
* `docs:` documentation
* `test:` tests

## 👥 Équipe

Projet réalisé en binôme par :

* Yirui
* Mathis

## 🎯 Objectif

Créer une application mobile fonctionnelle permettant de gérer ses recettes personnelles, dans le cadre d'un projet de formation React Native et Expo.

## Commandes utiles

eas build:configure                                   # crée eas.json
eas build --profile development --platform android    # build de dev
eas build --profile preview --platform android        # APK de test
eas build --profile production --platform all         # build de production
eas build --profile preview --platform android --non-interactive   # sans questions
eas build --profile development --platform android --local        # build sur votre machine

eas submit --platform android            # envoyer sur le Play Store
eas submit --platform ios                # envoyer sur App Store Connect
eas submit --platform all --latest       # soumettre le dernier build

npx expo install expo-updates   # prérequis
eas update:configure            # configuration initiale
eas update --branch preview --message "Correction du formulaire"   # publier une mise à jour
eas update:list                 # lister les mises à jour
eas channel:list                # lister les canaux

npx expo start                  # serveur de dev (Expo Go)
npx expo start --dev-client     # serveur de dev pour un build de développement
npx expo start -c               # vider le cache
npx expo install <paquet>       # installer un paquet compatible avec votre SDK
npx expo-doctor                 # diagnostiquer le projet
npx expo prebuild               # générer les dossiers natifs (android/ios)