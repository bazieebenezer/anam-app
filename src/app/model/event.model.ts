export interface Event {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  date: Date;
  location?: string;
  category?: string;
  severity?: 'normal' | 'eleve' | 'urgent';
  imagesUrls?: string[];
  descriptionDetails?: string;
}

export interface ImportantLink {
  title: string;
  url: string;
}
