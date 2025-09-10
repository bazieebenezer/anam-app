# Guide pour Changer l'icône de l'Application

Ce document explique la procédure pour changer l'icône de l'application pour les plateformes Android et iOS dans ce projet Capacitor.

## 1. Prérequis

### Outil de Génération
Le projet utilise l'outil `@capacitor/assets` pour générer les différentes tailles d'icônes et d'écrans de démarrage à partir d'un unique fichier source.

Assurez-vous que cet outil est installé dans les dépendances de développement. Si ce n'est pas le cas, installez-le avec la commande suivante :
```bash
npm install @capacitor/assets --save-dev
```

### Fichier d'Icône Source
Vous devez disposer d'un fichier d'icône de haute qualité.
-   **Format** : PNG ou SVG
-   **Dimensions recommandées** : 1024x1024 pixels
-   **Nom du fichier** : `icon.png` (ou `logo.png`)

## 2. Structure de Dossiers Requise

L'outil `@capacitor/assets` s'attend à une structure de dossiers spécifique pour fonctionner correctement en mode simple.

Vous devez avoir un dossier `assets` **à la racine de votre projet** (au même niveau que `src`, `android`, `ios`, etc.). C'est dans ce dossier que vous devez placer votre fichier d'icône source.

```
anam-app/
├── assets/
│   └── icon.png   <-- Votre icône 1024x1024px
├── src/
├── android/
├── ios/
└── ...
```

**Note importante :** Ne confondez pas ce dossier `assets` racine avec le dossier `src/assets` qui contient les ressources utilisées à l'intérieur de l'application (images, polices, etc.). Pour la génération de l'icône de l'application, le dossier `assets` à la racine est requis.

## 3. Étapes pour Changer l'Icône

1.  **Préparez votre icône** : Assurez-vous que votre fichier `icon.png` respecte les prérequis ci-dessus.

2.  **Placez l'icône** :
    -   Si le dossier `assets` n'existe pas à la racine du projet, créez-le.
    -   Copiez votre fichier `icon.png` dans ce dossier `assets` racine.

3.  **Générez les ressources** : Ouvrez un terminal à la racine du projet et exécutez la commande suivante :

    ```bash
    npx @capacitor/assets generate
    ```

L'outil va automatiquement détecter votre `assets/icon.png` et générer toutes les icônes et écrans de démarrage nécessaires, en les plaçant aux bons endroits dans les projets `android` et `ios`.

## 4. Dépannage

-   **Erreurs d'options non reconnues** : L'outil `@capacitor/assets` peut avoir un comportement inattendu si vous essayez de spécifier des chemins d'accès via des arguments comme `--icon-path` ou `--asset-path`. La méthode la plus fiable est de respecter la structure de dossiers décrite ci-dessus et de lancer la commande sans arguments supplémentaires.
-   **L'icône n'est pas mise à jour** : Vérifiez que vous avez bien placé votre icône dans le dossier `assets` à la racine du projet, et non dans `src/assets`.
