# Guide de Débogage - Téléchargement d'Images

## Problème : Le bouton de téléchargement ne fonctionne pas dans l'émulateur

### Étapes de Débogage

#### 1. Vérifier les Logs de la Console

1. **Ouvrir les outils de développement** dans l'émulateur :

   - Appuyez sur `F12` ou `Ctrl+Shift+I`
   - Ou allez dans le menu de l'émulateur → Developer → Developer Tools

2. **Aller dans l'onglet Console** et chercher les messages suivants quand vous cliquez sur le bouton :

```
Bouton de téléchargement cliqué
État de téléchargement mis à true
Début du téléchargement: {imageUrl: "...", fileName: "..."}
Informations de la plateforme: {...}
Détection émulateur: {userAgent: "...", isEmulator: true/false}
```

#### 2. Vérifier les Erreurs

Si vous voyez des erreurs dans la console, notez-les. Les erreurs courantes sont :

- **Erreur CORS** : L'image ne peut pas être récupérée depuis le serveur
- **Erreur de permissions** : Problème avec les permissions Capacitor
- **Erreur de réseau** : Problème de connexion

#### 3. Tester avec une Image Locale

Pour éliminer les problèmes de CORS, testez avec une image locale :

1. Placez une image de test dans `src/assets/img/test.jpg`
2. Modifiez temporairement l'URL dans votre composant pour utiliser cette image locale
3. Testez le téléchargement

#### 4. Vérifier la Configuration Capacitor

Assurez-vous que les plugins sont bien installés :

```bash
npx cap ls
```

Vous devriez voir :

- `@capacitor/camera`
- `@capacitor/device`

#### 5. Tester sur un Appareil Physique

Si possible, testez sur un vrai appareil Android/iOS pour voir si le problème est spécifique à l'émulateur.

### Solutions Possibles

#### Solution 1 : Problème de CORS

Si l'image vient d'un serveur externe, ajoutez des en-têtes CORS appropriés.

#### Solution 2 : Problème d'Émulateur

Les émulateurs ont des limitations. Utilisez un appareil physique pour tester.

#### Solution 3 : Problème de Permissions

Vérifiez que les permissions sont bien configurées dans `AndroidManifest.xml`.

#### Solution 4 : Problème de Build

Reconstruisez l'application :

```bash
npm run build
npx cap sync
npx cap run android
```

### Test Rapide

Pour tester rapidement si le problème vient du service ou du composant :

1. **Modifiez temporairement le composant** pour afficher un toast simple :

```typescript
async downloadImage() {
  console.log('Bouton cliqué');
  const toast = await this.toastController.create({
    message: 'Bouton cliqué !',
    duration: 2000
  });
  await toast.present();
}
```

2. **Testez** : Si le toast s'affiche, le problème vient du service. Sinon, c'est un problème de clic.

### Logs Attendus

Voici ce que vous devriez voir dans la console lors d'un téléchargement réussi :

```
Bouton de téléchargement cliqué
État de téléchargement mis à true
Nom de fichier généré: bulletin_meteo.jpg
URL de l'image: https://example.com/image.jpg
Début du téléchargement: {imageUrl: "...", fileName: "..."}
Informations de la plateforme: {platform: "android", ...}
Détection émulateur: {userAgent: "...", isEmulator: true}
Utilisation du téléchargement web/émulateur
Téléchargement web: {imageUrl: "...", fileName: "..."}
Récupération de l'image depuis: ...
Blob créé: {size: 12345, type: "image/jpeg"}
Blob URL créée: blob:...
Lien de téléchargement créé: {href: "blob:...", download: "..."}
Téléchargement déclenché
Téléchargement web terminé
Affichage du toast: {message: "Image téléchargée avec succès", color: "success"}
État de téléchargement remis à false
```

### Contact

Si le problème persiste, partagez les logs de la console pour un diagnostic plus précis.
