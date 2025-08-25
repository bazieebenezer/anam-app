# Documentation de la Génération de PDF

Ce document explique l'implémentation de la fonctionnalité de génération et de téléchargement de PDF pour les bulletins, disponible sur les plateformes mobiles (Android/iOS) et web.

## Vue d'ensemble

La fonctionnalité permet aux utilisateurs de télécharger un bulletin sous forme de fichier PDF. Le PDF est généré dynamiquement côté client et inclut le titre du bulletin, le logo de l'application, les images, la description, les conseils, ainsi que les badges de criticité et de spécialité.

## Bibliothèques utilisées

-   **[jsPDF](https://github.com/parallax/jsPDF)**: Une bibliothèque pour générer des fichiers PDF en JavaScript.
-   **[html2canvas](https://html2canvas.hertzen.com/)**: Utilisée pour capturer un élément HTML et le convertir en une image canvas, qui est ensuite insérée dans le PDF.
-   **[@capacitor-community/file-opener](https://github.com/capacitor-community/file-opener)**: Un plugin Capacitor pour ouvrir des fichiers natifs sur les appareils mobiles.
-   **@capacitor/filesystem**: Un plugin Capacitor pour interagir avec le système de fichiers natif.

## Architecture

La logique de génération de PDF est encapsulée dans un service injectable, `PdfGenerationService`, pour une meilleure réutilisation du code et une meilleure maintenabilité.

### `PdfGenerationService`

Ce service expose une méthode principale :

-   `generateBulletinPdf(bulletin: WeatherBulletin)`: Cette méthode asynchrone prend un objet bulletin en paramètre et orchestre la création et l'ouverture du PDF.

## Processus de génération

1.  **Création d'un template HTML**: Une `div` masquée est créée dynamiquement et contient la structure HTML du PDF. Le contenu du bulletin (titre, images, etc.) est inséré dans ce template.

2.  **Stylisation dynamique**:
    -   La couleur du badge de criticité est déterminée par la méthode `getSeverityColor()`.
        -   `urgent`: rouge (`danger`)
        -   `eleve`: orange (`warning`)
        -   `normal`: vert (`success`)
    -   Les autres styles sont appliqués en ligne pour garantir un rendu cohérent.

3.  **Capture du HTML en Canvas**: `html2canvas` est utilisé pour "photographier" la `div` et la transformer en une image canvas. L'option `useCORS: true` est activée pour permettre le chargement d'images provenant de sources externes (comme Firebase Storage).

4.  **Création du PDF**: Une nouvelle instance de `jsPDF` est créée, et l'image canvas y est ajoutée.

## Implémentation multiplateforme

Le service détecte la plateforme sur laquelle l'application s'exécute pour adapter le comportement de téléchargement.

### Sur le Web

-   **Détection**: `Capacitor.isNativePlatform()` renvoie `false`.
-   **Action**: La méthode `pdf.save(fileName)` de `jsPDF` est appelée. Cela déclenche le téléchargement standard du fichier par le navigateur.

### Sur Mobile (Android/iOS)

-   **Détection**: `Capacitor.isNativePlatform()` renvoie `true`.
-   **Action**:
    1.  Le PDF est encodé en `datauristring`.
    2.  `Capacitor/Filesystem` est utilisé pour écrire le fichier PDF dans le répertoire de cache de l'application.
    3.  `@capacitor-community/file-opener` est utilisé pour ouvrir le fichier PDF enregistré avec le lecteur de PDF natif du système d'exploitation.

## Notifications Utilisateur

Pour améliorer l'expérience utilisateur, des notifications (toasts) sont affichées :

1.  Un message **"Téléchargement..."** s'affiche dès que l'utilisateur clique sur le bouton et reste visible pendant toute la durée de la génération du PDF.
2.  Un message **"Téléchargement terminé"** s'affiche lorsque le processus est terminé avec succès.
3.  Un message d'erreur s'affiche si un problème survient pendant la génération du PDF.

Ces notifications sont gérées par le `ToastController` d'Ionic.
