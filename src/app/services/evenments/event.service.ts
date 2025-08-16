import { Injectable } from '@angular/core';
import { Event } from '../../model/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private events: Event[] = [
    {
      id: 1,
      title: 'Formation sur les Changements Climatiques',
      description:
        "Formation intensive sur les impacts des changements climatiques en Afrique de l'Ouest et les stratégies d'adaptation.",
      imageUrl: './assets/img/event/event_1.jpg',
      date: new Date('2025-08-15'), // Hier
      descriptionDetails: `Cette formation intensive de trois jours aborde les impacts spécifiques des changements climatiques en Afrique de l'Ouest.

Les participants découvriront les dernières recherches sur l'évolution des précipitations, l'augmentation des températures et la fréquence des événements météorologiques extrêmes dans la région.

Le programme inclut des sessions pratiques sur l'élaboration de stratégies d'adaptation locales, l'évaluation de la vulnérabilité des communautés et la mise en place de systèmes de résilience climatique.

Des experts internationaux partageront leurs expériences sur les meilleures pratiques d'adaptation développées dans d'autres régions du monde.

La formation se conclura par l'élaboration de plans d'action concrets que les participants pourront implémenter dans leurs organisations respectives.`,
      imagesUrls: [
        './assets/img/event/event_1.jpg',
        './assets/img/event/event_2.jpg',
        './assets/img/event/event_3.jpg',
        './assets/img/event/event_4.jpg',
        './assets/img/event/event_5.jpg',
      ],
    },
    {
      id: 2,
      title: 'Conférence Internationale Météorologique',
      description:
        'Conférence annuelle réunissant les experts météorologiques de la sous-région pour discuter des innovations technologiques.',
      imageUrl: './assets/img/event/event_2.jpg',
      date: new Date('2025-08-14'), // Il y a 2 jours
      descriptionDetails: `La conférence internationale météorologique de cette année rassemble plus de 200 experts venant de 15 pays d'Afrique de l'Ouest.

L'événement met l'accent sur les innovations technologiques qui révolutionnent la prévision météorologique, notamment l'intelligence artificielle, les satellites de nouvelle génération et les modèles de prévision haute résolution.

Les sessions plénières aborderont les défis spécifiques de la région ouest-africaine, incluant la mousson, les sécheresses récurrentes et les inondations soudaines.

Des démonstrations pratiques de nouveaux équipements et logiciels de prévision seront organisées tout au long de la conférence.

Les participants auront l'opportunité de réseauter et de partager leurs expériences lors de sessions de travail en petits groupes.`,
      imagesUrls: [
        './assets/img/event/event_2.jpg',
        './assets/img/event/event_3.jpg',
        './assets/img/event/event_4.jpg',
        './assets/img/event/event_5.jpg',
        './assets/img/event/event_1.jpg',
      ],
    },
    {
      id: 3,
      title: "Atelier sur les Systèmes d'Alerte Précoce",
      description:
        "Atelier pratique sur la mise en place et l'optimisation des systèmes d'alerte précoce pour les catastrophes naturelles.",
      imageUrl: './assets/img/event/event_3.jpg',
      date: new Date('2025-08-12'), // Il y a 4 jours
      descriptionDetails: `Cet atelier pratique de deux jours se concentre sur la conception et l'implémentation de systèmes d'alerte précoce efficaces.

Les participants apprendront à identifier les indicateurs précoces de différents types de catastrophes naturelles : inondations, sécheresses, tempêtes et vagues de chaleur.

L'atelier inclut des exercices pratiques sur la collecte de données en temps réel, l'analyse des seuils d'alerte et la diffusion des messages d'urgence.

Des experts en communication de crise partageront les meilleures pratiques pour transmettre efficacement les alertes aux populations vulnérables.

Les participants repartiront avec un plan d'action personnalisé pour améliorer les systèmes d'alerte dans leurs régions respectives.`,
      imagesUrls: [
        './assets/img/event/event_3.jpg',
        './assets/img/event/event_4.jpg',
        './assets/img/event/event_5.jpg',
        './assets/img/event/event_1.jpg',
        './assets/img/event/event_2.jpg',
      ],
    },
    {
      id: 4,
      title: 'Séminaire sur la Prévision Numérique',
      description:
        "Séminaire technique sur les modèles de prévision numérique du temps et leur application en Afrique de l'Ouest.",
      imageUrl: './assets/img/event/event_4.jpg',
      date: new Date('2025-08-10'), // Il y a 6 jours
      descriptionDetails: `Ce séminaire technique approfondi explore les modèles de prévision numérique du temps les plus avancés utilisés dans la région.

Les participants découvriront les spécificités des modèles régionaux adaptés aux conditions météorologiques ouest-africaines, incluant la modélisation de la mousson et des systèmes convectifs.

Le séminaire aborde les défis techniques liés à la résolution spatiale, à l'assimilation de données et à la validation des prévisions dans un contexte tropical.

Des sessions pratiques permettront aux participants de manipuler différents modèles et d'interpréter leurs sorties pour améliorer la qualité des prévisions.

L'accent sera mis sur l'utilisation des prévisions numériques pour la gestion des risques climatiques et la prise de décision.`,
      imagesUrls: [
        './assets/img/event/event_4.jpg',
        './assets/img/event/event_5.jpg',
        './assets/img/event/event_1.jpg',
        './assets/img/event/event_2.jpg',
        './assets/img/event/event_3.jpg',
      ],
    },
    {
      id: 5,
      title: 'Réunion des Directeurs des Services Météo',
      description:
        'Réunion stratégique des directeurs des services météorologiques nationaux pour coordonner les actions régionales.',
      imageUrl: './assets/img/event/event_5.jpg',
      date: new Date('2025-08-08'), // Il y a 8 jours
      descriptionDetails: `Cette réunion stratégique annuelle rassemble les directeurs des services météorologiques nationaux de tous les pays d'Afrique de l'Ouest.

L'ordre du jour inclut la coordination des actions régionales, le partage des ressources techniques et l'harmonisation des procédures de prévision.

Les participants discuteront des défis communs tels que le financement des services météorologiques, la formation du personnel et la modernisation des équipements.

Des accords de coopération technique seront signés pour renforcer la collaboration entre les services météorologiques nationaux.

La réunion se conclura par l'adoption d'un plan d'action régional pour l'année à venir, incluant des objectifs spécifiques et des indicateurs de performance.`,
      imagesUrls: [
        './assets/img/event/event_5.jpg',
        './assets/img/event/event_1.jpg',
        './assets/img/event/event_2.jpg',
        './assets/img/event/event_3.jpg',
        './assets/img/event/event_4.jpg',
      ],
    },
    {
      id: 6,
      title: 'Formation sur les Technologies Satellitaires',
      description:
        "Formation spécialisée sur l'utilisation des données satellitaires pour la surveillance météorologique.",
      imageUrl: './assets/img/event/event_1.jpg',
      date: new Date('2025-08-05'), // Il y a 11 jours
      descriptionDetails: `Cette formation spécialisée de cinq jours explore l'utilisation avancée des données satellitaires pour la surveillance météorologique.

Les participants apprendront à interpréter les images satellitaires multispectrales, à analyser les données de température de surface et à détecter les phénomènes météorologiques complexes.

Le programme inclut des sessions pratiques sur l'utilisation de logiciels spécialisés pour le traitement des données satellitaires et l'extraction d'informations météorologiques pertinentes.

Des experts internationaux présenteront les dernières innovations en matière de satellites météorologiques et leurs applications pour la prévision du temps.

La formation se terminera par un projet pratique où les participants devront analyser un événement météorologique en utilisant les techniques apprises.`,
      imagesUrls: [
        './assets/img/event/event_1.jpg',
        './assets/img/event/event_2.jpg',
        './assets/img/event/event_3.jpg',
        './assets/img/event/event_4.jpg',
        './assets/img/event/event_5.jpg',
      ],
    },
    {
      id: 7,
      title: "Colloque sur l'Hydrométéorologie",
      description:
        "Colloque scientifique sur l'hydrométéorologie et la gestion des ressources en eau en contexte de changement climatique.",
      imageUrl: './assets/img/event/event_2.jpg',
      date: new Date('2024-07-30'), // Il y a 17 jours
      descriptionDetails: `Ce colloque scientifique de trois jours réunit chercheurs, praticiens et décideurs pour discuter des enjeux de l'hydrométéorologie en Afrique de l'Ouest.

Les sessions scientifiques présenteront les dernières recherches sur l'impact du changement climatique sur le cycle hydrologique et la disponibilité des ressources en eau.

Le colloque abordera les défis spécifiques de la région, incluant la variabilité des précipitations, l'évapotranspiration et la recharge des nappes phréatiques.

Des études de cas pratiques illustreront comment les données hydrométéorologiques peuvent être utilisées pour la gestion intégrée des ressources en eau.

Les participants contribueront à l'élaboration de recommandations pour améliorer la surveillance hydrométéorologique et la prise de décision dans le secteur de l'eau.`,
      imagesUrls: [
        './assets/img/event/event_2.jpg',
        './assets/img/event/event_3.jpg',
        './assets/img/event/event_4.jpg',
        './assets/img/event/event_5.jpg',
        './assets/img/event/event_1.jpg',
      ],
    },
    {
      id: 8,
      title: 'Workshop sur les Données Climatiques',
      description:
        "Workshop pratique sur la collecte, le traitement et l'analyse des données climatiques historiques.",
      imageUrl: './assets/img/event/event_3.jpg',
      date: new Date('2024-07-25'), // Il y a 22 jours
      descriptionDetails: `Ce workshop pratique de quatre jours se concentre sur la gestion complète des données climatiques, de leur collecte à leur analyse.

Les participants apprendront les bonnes pratiques pour la collecte, le stockage et la qualité des données climatiques historiques et en temps réel.

Le workshop inclut des sessions techniques sur le traitement des données manquantes, la détection d'anomalies et l'homogénéisation des séries temporelles.

Des exercices pratiques permettront aux participants de manipuler des outils d'analyse statistique et de visualisation des données climatiques.

L'accent sera mis sur l'utilisation des données climatiques pour l'identification des tendances, la détection des changements climatiques et la planification de l'adaptation.`,
      imagesUrls: [
        './assets/img/event/event_3.jpg',
        './assets/img/event/event_4.jpg',
        './assets/img/event/event_5.jpg',
        './assets/img/event/event_1.jpg',
        './assets/img/event/event_2.jpg',
      ],
    },
  ];

  constructor() {}

  getEvents(): Event[] {
    return this.events;
  }

  getEventById(id: number): Event | undefined {
    return this.events.find((event) => event.id === id);
  }

  getEventsByDateFilter(filter: string): Event[] {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    switch (filter) {
      case 'recents':
        // Événements des 2 derniers jours
        return this.events.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate >= twoDaysAgo;
        });
      case '2jours':
        // Événements entre 2 jours et 1 semaine
        return this.events.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate >= oneWeekAgo && eventDate < twoDaysAgo;
        });
      case 'plus_anciens':
        // Événements de plus d'une semaine
        return this.events.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate < oneWeekAgo;
        });
      default:
        return this.events;
    }
  }
}
