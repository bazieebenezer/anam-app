export type BulletinSeverity = 'urgent' | 'eleve' | 'normal';

export interface WeatherBulletin {
  id: number;
  title: string;
  date: Date;
  severity: BulletinSeverity;
  description: string;
  imageUrl: string;
  downloadUrl?: string;
  shareUrl?: string;
  descriptionDetails?: string;
  conseils?: string[];
  imagesUrls?: string[];
}
