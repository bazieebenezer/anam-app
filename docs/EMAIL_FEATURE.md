
# Documentation de la fonctionnalité d'envoi d'e-mails

## Introduction

Cette documentation décrit la mise en place et le fonctionnement de la fonctionnalité d'envoi d'e-mails pour l'application ANAM. Cette fonctionnalité est essentielle pour notifier les utilisateurs lors de la création de nouveaux posts.

## Architecture

L'architecture de la fonctionnalité d'envoi d'e-mails repose sur les services suivants :

- **Vercel Serverless Function** : Une fonction sans serveur déployée sur Vercel est utilisée pour gérer la logique d'envoi d'e-mails.
- **Resend** : Un service tiers d'envoi d'e-mails qui simplifie l'envoi d'e-mails transactionnels.
- **Nodemailer** : Une bibliothèque Node.js pour l'envoi d'e-mails, utilisée ici pour interagir avec Resend.
- **Firebase Admin SDK** : Utilisé pour accéder à la base de données Firebase et récupérer les informations nécessaires à l'envoi des e-mails.

Le processus global est le suivant :

1. Un nouvel article est créé dans l'application ANAM.
2. Une fonction Firebase (ou un autre mécanisme) déclenche la fonction sans serveur Vercel.
3. La fonction sans serveur récupère les informations de l'utilisateur et du nouvel article à partir de Firebase.
4. La fonction sans serveur utilise Nodemailer et Resend pour envoyer un e-mail de notification à l'utilisateur.

## Dépendances

Les dépendances suivantes sont nécessaires pour le bon fonctionnement de la fonctionnalité d'envoi d'e-mails.

### Dépendances principales (client)

- `@angular/fire` : Pour l'intégration avec Firebase.
- `firebase` : La bibliothèque principale de Firebase.

### Dépendances du serveur (Vercel)

- `firebase-admin` : Pour accéder à Firebase depuis un environnement de serveur.
- `nodemailer` : Pour l'envoi d'e-mails.
- `resend` : Pour l'intégration avec le service Resend.

### Installation

Pour installer les dépendances du serveur, naviguez vers le répertoire `vercel-email-server` et exécutez la commande suivante :

```bash
npm install
```

## Configuration

La configuration de la fonctionnalité d'envoi d'e-mails nécessite la configuration de variables d'environnement pour Resend et Firebase.

### Variables d'environnement

Créez un fichier `.env` à la racine du répertoire `vercel-email-server` et ajoutez les variables d'environnement suivantes :

```
RESEND_API_KEY=VOTRE_CLE_API_RESEND
FIREBASE_SERVICE_ACCOUNT_KEY=VOTRE_CLE_DE_COMPTE_DE_SERVICE_FIREBASE
```

- `RESEND_API_KEY` : Votre clé API Resend. Vous pouvez l'obtenir depuis votre tableau de bord Resend.
- `FIREBASE_SERVICE_ACCOUNT_KEY` : Votre clé de compte de service Firebase au format JSON. Vous pouvez la générer depuis la console Firebase > Paramètres du projet > Comptes de service.

## Implémentation

Le cœur de la fonctionnalité d'envoi d'e-mails se trouve dans le fichier `vercel-email-server/api/send-notifications.js`.

### Logique du fichier `send-notifications.js`

Le fichier `send-notifications.js` contient la logique suivante :

1. **Initialisation de Firebase Admin** : Le SDK Firebase Admin est initialisé avec la clé de compte de service pour permettre l'accès à la base de données Firebase.
2. **Initialisation de Nodemailer et Resend** : Nodemailer est configuré pour utiliser Resend comme transporteur d'e-mails.
3. **Logique de la fonction sans serveur** : La fonction sans serveur est exportée et contient la logique principale pour l'envoi d'e-mails.
    - Elle récupère les données du nouvel article et de l'utilisateur depuis la requête.
    - Elle se connecte à la base de données Firebase pour récupérer des informations supplémentaires si nécessaire.
    - Elle construit l'e-mail de notification avec le contenu approprié.
    - Elle utilise Nodemailer pour envoyer l'e-mail via Resend.

### Exemple de code

Voici un exemple simplifié de la logique du fichier `send-notifications.js` :

```javascript
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Initialiser Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Initialiser Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Exporter la fonction sans serveur
module.exports = async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { userId, postId } = req.body;

    // Récupérer les informations de l'utilisateur et du post depuis Firebase
    // ...

    // Envoyer l'e-mail de notification
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'user@example.com',
      subject: 'Nouveau post sur ANAM',
      html: `<p>Un nouveau post a été publié sur ANAM.</p>`
    });

    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending email');
  }
};
```

## Déploiement

Pour déployer la fonction sans serveur sur Vercel, vous pouvez utiliser le CLI de Vercel.

1. **Installer le CLI de Vercel** :

```bash
npm install -g vercel
```

2. **Déployer** :

```bash
vercel
```

Suivez les instructions pour déployer le projet.

## Usage

La fonctionnalité d'envoi d'e-mails est déclenchée automatiquement lorsqu'un nouvel article est créé dans l'application. Le mécanisme de déclenchement (par exemple, une fonction Firebase) doit être configuré pour appeler l'URL de la fonction sans serveur Vercel avec les données nécessaires (ID de l'utilisateur, ID du post, etc.).
