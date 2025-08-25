# Fonctionnalité de Partage (Version Finale)

Ce document décrit l'implémentation finale et stable de la fonctionnalité de partage pour les bulletins et les événements de l'application ANAM. La version décrite ici est le résultat de plusieurs itérations visant à trouver le meilleur compromis entre richesse fonctionnelle et fiabilité technique sur les différentes plateformes.

## 1. Objectif

L'objectif est de permettre aux utilisateurs de partager des éléments de manière fiable, en s'adaptant aux contraintes techniques de chaque plateforme (mobile native et web).

## 2. Implémentation Technique

La logique est centralisée dans le service `src/app/services/share.service.ts`.

### Méthode Principale
- `shareItem({ title, description, images })` : Cette méthode orchestre le partage en détectant la plateforme.

### Méthode de Repli
- `shareFallback(title, description)` : Une méthode simplifiée utilisée pour le partage sur le web et comme solution de secours en cas d'erreur sur la plateforme native.

## 3. Logique par Plateforme

Le comportement de partage est différent sur mobile et sur web pour garantir la meilleure expérience possible en fonction des limitations de chaque environnement.

### a) Plateformes Natives (iOS & Android)

Sur mobile, l'implémentation privilégie un partage riche incluant une image.

- **Comportement** : Partage du **titre**, de la **description** et de la **première image** de l'élément.
- **Processus** :
  1.  Le service utilise le plugin `@capacitor/share`.
  2.  Seulement la première image du tableau `images` est prise en compte pour assurer un temps de téléchargement rapide et une meilleure compatibilité.
  3.  L'image est téléchargée et sauvegardée dans le cache de l'appareil via `@capacitor/filesystem` pour obtenir une URI locale.
  4.  `Share.share()` est appelée avec le `title`, le `text` et le chemin (`files`) de l'image locale.
  5.  En cas d'échec (par exemple, si le téléchargement de l'image échoue), le système se rabat sur la méthode `shareFallback` pour partager uniquement le texte.

### b) Plateforme Web (et solution de secours)

Sur le web, les contraintes de sécurité des navigateurs sont très strictes et empêchent un partage fiable des images sans potentiellement bloquer l'action de l'utilisateur.

- **Contrainte technique clé** : L'API de partage web (`navigator.share`) doit être appelée immédiatement après un geste de l'utilisateur (un clic). Les opérations asynchrones longues, comme le téléchargement d'images, peuvent dépasser ce court délai, provoquant une erreur `NotAllowedError`.

- **Comportement Final** : Pour garantir une fiabilité de 100% sur tous les navigateurs, le partage sur le web envoie **uniquement le titre et la description**.
- **Processus** :
  1.  La méthode `shareFallback` est appelée.
  2.  Elle appelle `Share.share()` en ne fournissant que les paramètres `title` et `text`.
  3.  Toute la logique complexe de téléchargement d'images a été supprimée de ce cas d'usage pour éviter les erreurs et garantir que le message texte soit toujours partagé avec succès.

## 4. Intégration dans les Pages

L'intégration dans `HomePage` et `EventsPage` reste la même :
1.  Le bouton "Partager" sur une carte ouvre une modale.
2.  Le bouton dans la modale appelle la méthode `shareItem` du service, en passant la liste complète des images (`images: item.images`), même si seul le service de partage décide ensuite lesquelles utiliser en fonction de la plateforme.
