# Documentation de la Génération de PDF

Ce document fournit une explication technique détaillée de la fonctionnalité de génération et de téléchargement de PDF pour les bulletins météorologiques au sein de l'application ANAM. Cette fonctionnalité est conçue pour être robuste, multiplateforme (fonctionnant de manière transparente sur le Web, Android et iOS) et offrir une expérience utilisateur fluide.

## 1. Introduction et Objectifs Métier

Dans un monde où l'information doit être à la fois accessible et partageable, la capacité de convertir des données dynamiques en un format portable et standardisé comme le PDF est cruciale. Pour l'ANAM, les bulletins météorologiques sont des communications critiques qui doivent souvent être archivées, imprimées ou partagées en dehors de l'application. La fonctionnalité de génération de PDF répond à plusieurs besoins métier essentiels :

-   **Portabilité et Partage Facilité :** Les utilisateurs peuvent télécharger un bulletin et le partager par e-mail, messagerie instantanée ou sur les réseaux sociaux sous forme de pièce jointe, garantissant que le destinataire reçoit une copie conforme de l'information originale.
-   **Accès Hors Ligne :** Une fois téléchargé, le bulletin est accessible à tout moment, même sans connexion Internet. C'est particulièrement utile pour les professionnels sur le terrain ou les utilisateurs dans des zones à faible connectivité.
-   **Archivage et Conformité :** Les institutions et les particuliers peuvent conserver une trace officielle des bulletins pour référence future ou pour des raisons de conformité réglementaire.
-   **Impression :** Le format PDF est optimisé pour l'impression, permettant aux utilisateurs de produire des copies physiques des bulletins pour les afficher ou les distribuer.

L'objectif technique était de créer une solution côté client pour éviter la charge sur le serveur, garantir une génération rapide et fonctionner de manière cohérente sur toutes les plateformes cibles.

## 2. Architecture et Technologies

La fonctionnalité est architecturée autour d'un service Angular injectable, `PdfGenerationService`, qui centralise toute la logique. Cette approche favorise la séparation des préoccupations, la réutilisabilité du code et facilite les tests unitaires.

### 2.1. Bibliothèques Clés

La solution repose sur un ensemble de bibliothèques JavaScript open-source puissantes :

-   **jsPDF :** Une bibliothèque mature et complète pour la création de documents PDF directement dans le navigateur. Elle offre une API bas niveau pour ajouter du texte, des images, des formes et gérer les pages.
-   **html2canvas :** Un outil indispensable qui permet de "capturer" un élément du DOM HTML et de son contenu (y compris le style CSS) et de le restituer sur un `<canvas>` HTML5. C'est le pont qui permet de convertir notre contenu HTML riche en une image que `jsPDF` peut manipuler.
-   **Capacitor (Core, Filesystem, File Opener) :** La suite d'outils Capacitor est utilisée pour l'intégration native sur les plateformes mobiles.
    -   `@capacitor/core` : Fournit les API de base pour interagir avec les fonctionnalités natives et détecter la plateforme.
    -   `@capacitor/filesystem` : Permet de lire et d'écrire des fichiers sur le système de fichiers natif de l'appareil (Android/iOS).
    -   `@capacitor-community/file-opener` : Un plugin communautaire qui permet de lancer l'application par défaut du système pour ouvrir un type de fichier donné (dans notre cas, un lecteur de PDF).

### 2.2. Le Service `PdfGenerationService`

Ce service est le cœur de la fonctionnalité. En l'injectant dans n'importe quel composant, on peut facilement déclencher la génération d'un PDF.

```typescript
// pdf-generation.service.ts

@Injectable({
  providedIn: 'root',
})
export class PdfGenerationService {
  constructor(private toastController: ToastController) {}

  async generateBulletinPdf(bulletin: WeatherBulletin) {
    // ... logique de génération
  }

  // ... méthodes utilitaires
}
```

L'injection du `ToastController` d'Ionic permet de fournir des retours visuels à l'utilisateur, une pratique essentielle pour les opérations asynchrones qui peuvent prendre quelques secondes.

## 3. Processus de Génération de PDF : Une Plongée en Profondeur

La méthode `generateBulletinPdf` est le point d'entrée. Elle orchestre une série d'étapes asynchrones pour passer d'un objet de données `WeatherBulletin` à un fichier PDF prêt à l'emploi.

### 3.1. Étape 1 : Notification de l'Utilisateur

La première action est de notifier à l'utilisateur que le processus a commencé. Une opération qui implique le rendu d'images et la manipulation de fichiers peut ne pas être instantanée. Un retour visuel immédiat est donc crucial pour l'expérience utilisateur.

```typescript
const toast = await this.toastController.create({
  message: 'Téléchargement...',
  duration: null, // Reste affiché jusqu'à ce qu'on le ferme manuellement
});
await toast.present();
```

### 3.2. Étape 2 : Création Dynamique du Template HTML

La stratégie centrale consiste à créer un template HTML invisible qui représente fidèlement le contenu du PDF. Cet élément est ajouté temporairement au DOM, stylisé, puis utilisé par `html2canvas`.

```typescript
const pdfContent = document.createElement('div');
pdfContent.style.position = 'absolute';
pdfContent.style.left = '-9999px'; // On le cache en dehors de l'écran
pdfContent.style.width = '800px'; // Une largeur fixe pour un rendu prévisible
// ... autres styles

pdfContent.innerHTML = `
  // ... structure HTML détaillée
`;

document.body.appendChild(pdfContent);
```

La structure `innerHTML` est soigneusement conçue pour inclure :
-   Le logo de l'ANAM.
-   Le titre du bulletin.
-   Les badges de criticité et de spécialité, avec des couleurs déterminées dynamiquement.
-   Les images du bulletin.
-   La description formatée.
-   La liste des conseils pratiques.

**Gestion des Images Cross-Origin :** Les images sont souvent hébergées sur des services de stockage (comme Firebase Storage), ce qui signifie qu'elles proviennent d'une origine différente de celle de l'application. Pour que `html2canvas` puisse les charger, il est impératif d'ajouter l'attribut `crossorigin="anonymous"` aux balises `<img>`.

### 3.3. Étape 3 : Capture du HTML avec `html2canvas`

Une fois le template HTML prêt et ajouté au DOM, `html2canvas` entre en jeu pour le convertir en une image sur un élément `<canvas>`.

```typescript
const canvas = await html2canvas(pdfContent, {
  useCORS: true, // Essentiel pour les images externes
  scale: 2,      // Augmente la résolution pour une meilleure qualité
});
```

-   `useCORS: true` : Cette option instruit `html2canvas` pour tenter de charger les images en respectant les règles CORS. Cela ne fonctionne que si le serveur d'images (ex: Firebase Storage) est configuré pour envoyer les en-têtes `Access-Control-Allow-Origin` appropriés.
-   `scale: 2` : Cette option double la résolution de la capture. Le résultat est une image plus nette dans le PDF final, évitant un aspect pixélisé, surtout sur les écrans à haute densité de pixels.

### 3.4. Étape 4 : Création du PDF et Pagination Manuelle

C'est l'étape la plus complexe. Le canvas généré est souvent beaucoup plus haut qu'une seule page de PDF. Il faut donc le "découper" et le répartir sur plusieurs pages.

```typescript
const imgData = canvas.toDataURL('image/png');
const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimètres, format A4

const pdfWidth = pdf.internal.pageSize.getWidth();
const pdfHeight = pdf.internal.pageSize.getHeight();

const imgProps = pdf.getImageProperties(imgData);
const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

let heightLeft = imgHeight;
let position = 0;

// Ajoute la première "tranche" de l'image
pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
heightLeft -= pdfHeight;

// Boucle pour ajouter les pages suivantes si nécessaire
while (heightLeft > 0) {
  position = heightLeft - imgHeight;
  pdf.addPage();
  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
  heightLeft -= pdfHeight;
}
```

**Explication de la logique :**
1.  On initialise un PDF au format A4.
2.  On calcule les dimensions que l'image du canvas occupera dans le PDF tout en conservant son ratio.
3.  On ajoute l'image une première fois sur la première page. L'image est positionnée à `y=0`.
4.  On calcule la hauteur restante de l'image qui n'est pas visible (`heightLeft`).
5.  Tant qu'il reste de la hauteur à afficher (`while (heightLeft > 0)`), on :
    a. Calcule la nouvelle position verticale. C'est une valeur négative qui "remonte" l'image pour que la tranche suivante apparaisse en haut de la nouvelle page.
    b. Ajoute une nouvelle page blanche (`pdf.addPage()`).
    c. Ajoute à nouveau la *même* image sur cette nouvelle page, mais avec la position verticale ajustée. `jsPDF` se charge de ne dessiner que la partie de l'image qui tombe dans les limites de la page.
    d. On décrémente la hauteur restante.

Cette technique de pagination manuelle est robuste et garantit que l'intégralité du contenu est rendue, quelle que soit sa longueur.

### 3.5. Étape 5 : Sauvegarde ou Ouverture du Fichier (Multiplateforme)

La dernière étape consiste à fournir le PDF à l'utilisateur. Le comportement diffère radicalement entre le web et le mobile.

```typescript
// Nettoyage du DOM
document.body.removeChild(pdfContent);
await toast.dismiss(); // On ferme le toast "Téléchargement..."

if (Capacitor.isNativePlatform()) {
  // Logique Mobile
  // ...
} else {
  // Logique Web
  pdf.save(fileName);
}
```

#### Logique pour le Web :

C'est le cas le plus simple. L'appel à `pdf.save('bulletin.pdf')` déclenche la fonctionnalité de téléchargement standard du navigateur. L'utilisateur voit apparaître une boîte de dialogue pour enregistrer le fichier.

#### Logique pour Mobile (Android/iOS) :

Sur un appareil natif, on ne peut pas simplement "télécharger" un fichier. Il faut l'enregistrer dans le système de fichiers de l'application, puis demander au système d'exploitation de l'ouvrir avec une application appropriée.

1.  **Conversion en Base64 :** Le PDF est d'abord converti en une chaîne de caractères Base64. `jsPDF` fournit une méthode pour cela, mais il faut en extraire les données brutes.

    ```typescript
    const pdfData = pdf.output('datauristring').split(',')[1];
    ```

2.  **Écriture sur le Système de Fichiers :** Le plugin `@capacitor/filesystem` est utilisé pour écrire ces données dans un fichier.

    ```typescript
    const path = `pdf/${fileName}`;
    await Filesystem.writeFile({
      path,
      data: pdfData,
      directory: Directory.Cache, // On utilise le répertoire de cache
    });
    ```
    Le `Directory.Cache` est choisi car c'est un emplacement pour les fichiers temporaires que le système peut nettoyer si nécessaire. C'est approprié pour un fichier que l'utilisateur consulte mais n'a pas besoin de stocker de manière permanente dans l'application.

3.  **Ouverture du Fichier Natif :** Une fois le fichier écrit, on obtient son URI natif. Le plugin `@capacitor-community/file-opener` utilise cet URI pour lancer une intention (sur Android) ou une action (sur iOS) pour ouvrir le fichier.

    ```typescript
    const { uri } = await Filesystem.getUri({
      path,
      directory: Directory.Cache,
    });

    await FileOpener.open({
      filePath: uri,
      contentType: 'application/pdf',
    });
    ```
    Le système d'exploitation présente alors à l'utilisateur une liste de lecteurs PDF installés pour afficher le fichier.

### 3.6. Étape 6 : Finalisation et Gestion des Erreurs

Que le processus réussisse ou échoue, il est essentiel de nettoyer et de notifier l'utilisateur.

-   **Nettoyage :** La `div` temporaire est retirée du DOM. Le toast "Téléchargement..." est fermé.
-   **Notification de Succès/Erreur :** Un nouveau toast est affiché pour informer l'utilisateur du résultat final ("Téléchargement terminé" ou "Erreur lors de la génération").

```typescript
// Dans le bloc `finally` ou après la réussite
await this.presentToast('Téléchargement terminé', 'success');

// Dans le bloc `catch`
await this.presentToast('Erreur lors de la génération du PDF.', 'danger');
```

## 4. Conclusion et Améliorations Futures

La fonctionnalité de génération de PDF est un exemple puissant de la manière dont les technologies web modernes peuvent être combinées pour créer des expériences riches et natives sur plusieurs plateformes. En encapsulant la logique dans un service et en gérant soigneusement les aspects asynchrones et multiplateformes, la solution est à la fois robuste, maintenable et conviviale.

**Améliorations Possibles :**
-   **Génération Côté Serveur :** Pour des PDF extrêmement complexes ou pour décharger complètement le client, une solution côté serveur (ex: avec Puppeteer sur Node.js) pourrait être envisagée.
-   **Personnalisation par l'Utilisateur :** On pourrait permettre à l'utilisateur de choisir les sections à inclure dans le PDF.
-   **Optimisation des Performances :** Pour des bulletins très longs avec de nombreuses images haute résolution, des optimisations supplémentaires sur la compression d'image avant l'intégration dans le PDF pourraient être explorées.