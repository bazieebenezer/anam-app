import { inject, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WeatherBulletin } from 'src/app/model/bulletin.model';

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  bulletins: WeatherBulletin[] = [
    {
      id: 1,
      title: 'Bulletin météo du 26 Juillet 2025',
      date: new Date('2025-07-26'),
      severity: 'urgent',
      description:
        "Ciel très nuageux à couvert sur l'ensemble du territoire avec des orages...",
      imageUrl: './assets/img/publication/bulletin_1.jpg',
      downloadUrl: '#',
      shareUrl: '#',
      descriptionDetails: `

☁️ Le ciel sera très nuageux à couvert sur l'ensemble du territoire national.

⚡ Des orages violents sont attendus avec des éclairs fréquents et des coups de tonnerre intenses.

🌧️ Précipitations importantes prévues avec des cumuls pouvant atteindre 50-80mm en 24h.

💨 Vents forts de 40-60 km/h avec des rafales pouvant dépasser 80 km/h.

⚠️ Risque élevé d'inondations dans les zones urbaines et les bas-fonds.

🌊 Possibilité de débordements des cours d'eau principaux.`,
      conseils: [
        'Évitez de sortir pendant les orages violents',
        'Abritez-vous dans un bâtiment solide',
        "Éloignez-vous des cours d'eau et des zones inondables",
        'Débranchez les appareils électriques sensibles',
        'Gardez une lampe de poche et des piles de rechange',
      ],
      imagesUrls: [
        './assets/img/publication/bulletin_1.jpg',
        './assets/img/publication/bulletin_2.jpg',
        './assets/img/publication/bulletin_3.jpg',
        './assets/img/publication/bulletin_4.jpg',
        './assets/img/publication/bulletin_5.jpg',
      ],
    },
    {
      id: 2,
      title: 'Bulletin météo du 25 Juillet 2025',
      date: new Date('2025-07-25'),
      severity: 'eleve',
      description:
        "Orages isolés attendus dans les régions de l'Est et du Centre-Est...",
      imageUrl: './assets/img/publication/bulletin_2.jpg',
      downloadUrl: '#',
      shareUrl: '#',
      descriptionDetails: `

🌤️ Ciel partiellement nuageux avec des éclaircies dans l'Ouest.

⚡ Orages isolés attendus dans les régions de l'Est et du Centre-Est.

🌡️ Températures élevées : 32-35°C dans l'Est, 28-30°C dans l'Ouest.

💧 Précipitations modérées : 15-25mm localement.

🌬️ Vents modérés de 15-25 km/h avec des rafales orageuses.

🌅 Visibilité réduite temporairement pendant les orages.`,
      conseils: [
        "Surveillez les signes d'approche d'orage",
        'Rentrez les objets sensibles au vent',
        "Préparez un kit d'urgence basique",
        'Évitez les activités en extérieur pendant les orages',
      ],
      imagesUrls: [
        './assets/img/publication/bulletin_2.jpg',
        './assets/img/publication/bulletin_3.jpg',
        './assets/img/publication/bulletin_4.jpg',
        './assets/img/publication/bulletin_5.jpg',
        './assets/img/publication/bulletin_6.jpg',
      ],
    },
    {
      id: 3,
      title: 'Bulletin météo du 24 Juillet 2025',
      date: new Date('2025-07-24'),
      severity: 'eleve',
      description:
        "Risque pluies orageuses dans la région de l'Est, notamment à Diapaga...",
      imageUrl: './assets/img/publication/bulletin_3.jpg',
      downloadUrl: '#',
      shareUrl: '#',
      descriptionDetails: `

🏙️ Risque de pluies orageuses dans la région de l'Est, notamment à Diapaga.

🌩️ Activité électrique modérée à forte attendue.

💦 Précipitations importantes : 30-45mm en 2-3 heures.

🌡️ Températures : 30-33°C avant les orages, 24-26°C après.

🌪️ Micro-rafales possibles dans les zones orageuses.

🌫️ Brouillard matinal dans les vallées.`,
      conseils: [
        'Évitez les déplacements non essentiels à Diapaga',
        'Protégez les cultures sensibles aux fortes pluies',
        "Vérifiez l'état des toitures",
        "Préparez des systèmes d'évacuation d'eau",
      ],
      imagesUrls: [
        './assets/img/publication/bulletin_3.jpg',
        './assets/img/publication/bulletin_4.jpg',
        './assets/img/publication/bulletin_5.jpg',
        './assets/img/publication/bulletin_6.jpg',
        './assets/img/publication/bulletin_7.jpg',
      ],
    },
    {
      id: 4,
      title: 'Bulletin météo du 23 Juillet 2025',
      date: new Date('2025-07-23'),
      severity: 'urgent',
      description:
        'Orages violents attendus dans la région du Sahel, avec des vents forts...',
      imageUrl: './assets/img/publication/bulletin_4.jpg',
      downloadUrl: '#',
      shareUrl: '#',
      descriptionDetails: `
🏜️ Orages violents attendus dans la région du Sahel.

💨 Vents forts de 50-70 km/h avec des rafales jusqu'à 100 km/h.

⚡ Activité électrique très intense avec éclairs fréquents.

🌧️ Pluies torrentielles : 60-90mm en 1-2 heures.

🏠 Risque de dégâts aux habitations légères.

🌾 Menace pour les cultures et le bétail.

🚗 Conditions de circulation très difficiles.`,
      conseils: [
        'Rentrez le bétail dans des abris solides',
        'Renforcez les structures fragiles',
        'Évitez complètement les déplacements',
        "Préparez des abris d'urgence",
        "Gardez les enfants à l'intérieur",
      ],
      imagesUrls: [
        './assets/img/publication/bulletin_4.jpg',
        './assets/img/publication/bulletin_5.jpg',
        './assets/img/publication/bulletin_6.jpg',
        './assets/img/publication/bulletin_7.jpg',
        './assets/img/publication/bulletin_8.jpg',
      ],
    },
    {
      id: 5,
      title: 'Bulletin météo du 22 Juillet 2025',
      date: new Date('2025-07-22'),
      severity: 'eleve',
      description:
        'Très nuageux avec des averses éparses dans les régions du Centre et du Nord...',
      imageUrl: './assets/img/publication/bulletin_5.jpg',
      downloadUrl: '#',
      shareUrl: '#',
      descriptionDetails: `

🌥️ Ciel très nuageux sur les régions du Centre et du Nord.

🌦️ Averses éparses et intermittentes tout au long de la journée.

🌡️ Températures fraîches : 22-25°C dans le Nord, 25-28°C dans le Centre.

💧 Précipitations modérées : 10-20mm par averse.

🌬️ Vents légers à modérés : 10-20 km/h.

🌅 Éclaircies possibles en fin d'après-midi.

🌱 Conditions favorables pour la végétation.`,
      conseils: [
        'Prévoyez un parapluie ou un imperméable',
        'Adaptez vos horaires de sortie',
        'Protégez les documents sensibles',
        "Vérifiez les systèmes d'irrigation",
      ],
      imagesUrls: [
        './assets/img/publication/bulletin_5.jpg',
        './assets/img/publication/bulletin_6.jpg',
        './assets/img/publication/bulletin_7.jpg',
        './assets/img/publication/bulletin_8.jpg',
        './assets/img/publication/bulletin_9.jpg',
      ],
    },
    {
      id: 6,
      title: 'Bulletin météo du 21 Juillet 2025',
      date: new Date('2025-07-21'),
      severity: 'normal',
      description:
        'Pluies abondantes prévues dans les provinces du Kadiogo et du Boulkiemdé...',
      imageUrl: './assets/img/publication/bulletin_6.jpg',
      downloadUrl: '#',
      shareUrl: '#',
      descriptionDetails: `

🏛️ Pluies abondantes prévues dans les provinces du Kadiogo et du Boulkiemdé.

🌊 Risque de ruissellement urbain dans Ouagadougou.

💧 Cumuls de précipitations : 40-60mm en 24h.

🌡️ Températures douces : 23-26°C pendant les pluies.

🌬️ Vents modérés : 15-25 km/h.

🌫️ Brouillard possible en début de matinée.

🌱 Bonnes conditions pour l'agriculture.`,
      conseils: [
        'Évitez les zones de ruissellement urbain',
        'Vérifiez les canalisations',
        "Préparez des réserves d'eau potable",
        "Surveillez les cours d'eau locaux",
      ],
      imagesUrls: [
        './assets/img/publication/bulletin_6.jpg',
        './assets/img/publication/bulletin_7.jpg',
        './assets/img/publication/bulletin_8.jpg',
        './assets/img/publication/bulletin_9.jpg',
        './assets/img/publication/bulletin_10.jpg',
      ],
    },
    {
      id: 7,
      title: 'Bulletin météo du 20 Juillet 2025',
      date: new Date('2025-07-20'),
      severity: 'eleve',
      description: 'Orages forts prévus dans les régions du Sud-Ouest...',
      imageUrl: './assets/img/publication/bulletin_7.jpg',
      downloadUrl: '#',
      shareUrl: '#',
      descriptionDetails: `

🌴 Orages forts prévus dans les régions du Sud-Ouest.

🌩️ Activité électrique intense avec éclairs fréquents.

💨 Vents forts de 35-50 km/h avec rafales orageuses.

🌧️ Pluies intenses : 35-50mm en 1-2 heures.

🌡️ Températures : 29-32°C avant, 24-26°C après les orages.

🌊 Risque de débordements des petits cours d'eau.

🏘️ Possibilité de coupures électriques locales.`,
      conseils: [
        'Évitez les zones forestières pendant les orages',
        'Protégez les installations électriques',
        "Surveillez les petits cours d'eau",
        "Préparez des sources d'éclairage alternatives",
      ],
      imagesUrls: [
        './assets/img/publication/bulletin_7.jpg',
        './assets/img/publication/bulletin_8.jpg',
        './assets/img/publication/bulletin_9.jpg',
        './assets/img/publication/bulletin_10.jpg',
        './assets/img/publication/bulletin_1.jpg',
      ],
    },
    {
      id: 8,
      title: 'Bulletin météo du 19 Juillet 2025',
      date: new Date('2025-07-19'),
      severity: 'normal',
      description:
        "Témpératures élevées suivies d'orages soudains dans la région de l'Est...",
      imageUrl: './assets/img/publication/bulletin_8.jpg',
      downloadUrl: '#',
      shareUrl: '#',
      descriptionDetails: `
☀️ Températures élevées : 35-38°C dans la région de l'Est.

🌩️ Orages soudains en fin d'après-midi et soirée.

⚡ Développement rapide des cellules orageuses.

💧 Pluies intenses mais brèves : 20-30mm en 30-45 minutes.

🌬️ Rafales de vent soudaines : 40-60 km/h.

🌅 Ciel dégagé le matin, nuages d'orage l'après-midi.

🌱 Stress thermique pour la végétation.`,
      conseils: [
        'Évitez les activités physiques intenses en journée',
        "Restez hydraté et à l'ombre",
        'Surveillez le développement des nuages',
        'Préparez-vous aux changements soudains',
      ],
      imagesUrls: [
        './assets/img/publication/bulletin_8.jpg',
        './assets/img/publication/bulletin_9.jpg',
        './assets/img/publication/bulletin_10.jpg',
        './assets/img/publication/bulletin_1.jpg',
        './assets/img/publication/bulletin_2.jpg',
      ],
    },
    {
      id: 9,
      title: 'Bulletin météo du 18 Juillet 2025',
      date: new Date('2025-07-18'),
      severity: 'normal',
      description:
        'Ciel partiellement nuageux avec des averses locales dans les régions...',
      imageUrl: './assets/img/publication/bulletin_9.jpg',
      downloadUrl: '#',
      shareUrl: '#',
      descriptionDetails: `

☁️ Ciel partiellement nuageux sur l'ensemble du territoire.

🌦️ Averses locales et éparses dans différentes régions.

🌡️ Températures agréables : 26-29°C en moyenne.

💧 Précipitations légères : 5-15mm par averse.

🌬️ Vents légers : 8-15 km/h.

🌅 Alternance d'éclaircies et de passages nuageux.

🌿 Conditions météo favorables pour les activités extérieures.`,
      conseils: [
        'Profitez des éclaircies pour les activités extérieures',
        'Gardez un parapluie à portée de main',
        'Planifiez vos sorties selon les averses',
        'Surveillez les prévisions locales',
      ],
      imagesUrls: [
        './assets/img/publication/bulletin_9.jpg',
        './assets/img/publication/bulletin_10.jpg',
        './assets/img/publication/bulletin_1.jpg',
        './assets/img/publication/bulletin_2.jpg',
        './assets/img/publication/bulletin_3.jpg',
      ],
    },
    {
      id: 10,
      title: 'Bulletin météo du 17 Juillet 2025',
      date: new Date('2025-07-17'),
      severity: 'eleve',
      description:
        "Risque de fortes pluies et d'inondations dans les zones urbaines de Banfora et Bobo...",
      imageUrl: './assets/img/publication/bulletin_10.jpg',
      downloadUrl: '#',
      shareUrl: '#',
      descriptionDetails: `

🏙️ Risque de fortes pluies et d'inondations dans les zones urbaines de Banfora et Bobo.

💧 Pluies torrentielles : 70-100mm en 3-4 heures.

🌊 Débordements des réseaux d'assainissement urbain.

🏠 Inondations des sous-sols et rez-de-chaussée.

🚗 Perturbations majeures de la circulation.

⚡ Risque de coupures électriques dans les zones inondées.

🌧️ Possibilité de glissements de terrain en périphérie.`,
      conseils: [
        'Évitez complètement les zones inondables',
        'Surélevez les biens de valeur',
        'Préparez des sacs de sable',
        "Ayez un plan d'évacuation",
        "Gardez des réserves d'eau potable et de nourriture",
      ],
      imagesUrls: [
        './assets/img/publication/bulletin_10.jpg',
        './assets/img/publication/bulletin_1.jpg',
        './assets/img/publication/bulletin_2.jpg',
        './assets/img/publication/bulletin_3.jpg',
        './assets/img/publication/bulletin_4.jpg',
      ],
    },
  ];

  route = inject(ActivatedRoute);

  constructor() {}

  getPublications() {
    return [...this.bulletins];
  }

  bulletin!: WeatherBulletin;

  getPublicationById(id: number): WeatherBulletin | undefined {
    return this.bulletins.find((b) => b.id === id);
  }
}
