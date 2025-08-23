import { Timestamp } from 'firebase/firestore';

export type BulletinSeverity = 'urgent' | 'eleve' | 'normal';

export interface WeatherBulletin {
  id: string; // L'ID de Firestore est une chaîne
  title: string;
  description: string;
  severity: BulletinSeverity;
  images: string[]; // Un tableau de chaînes Base64
  target: string; // La cible de l'alerte
  endDate: string; // La date de fin en format ISO string
  pdfFile?: any; // Le fichier PDF (optionnel)
  tips: string[]; // Les conseils pratiques
  createdAt: Timestamp; // La date de création de type Timestamp de Firebase
}