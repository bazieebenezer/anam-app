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
