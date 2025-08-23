export interface UsefulLink {
  title: string;
  url: string;
}

export interface AnamEvent {
  id?: string;
  title: string;
  description: string;
  images: string[]; // Array of base64 strings
  usefulLinks: UsefulLink[];
  createdAt: any; // Will be a Firebase Timestamp
}

export interface Event {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  date: Date;
  descriptionDetails: string;
  imagesUrls: string[];
  utilsLinks: { title: string; link: string; }[];
}