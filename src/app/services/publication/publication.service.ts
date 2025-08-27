import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  docData,
  query,
  writeBatch,
  getDocs,
} from '@angular/fire/firestore';
import { WeatherBulletin } from '../../model/bulletin.model';

import { Observable } from 'rxjs';
import { NotificationService } from '../notification.service';

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  constructor(private firestore: Firestore, private notificationService: NotificationService) {}

  async addAlert(alertData: WeatherBulletin) {
    const alertsCollection = collection(this.firestore, 'bulletins');
    const result = await addDoc(alertsCollection, alertData);
    this.notificationService.notifyUsers(alertData.title, 'bulletin', alertData.description).subscribe();
    return result;
  }

  getPublications(): Observable<WeatherBulletin[]> {
    const alertsCollection = collection(this.firestore, 'bulletins');
    const q = query(alertsCollection);
    return collectionData(q, { idField: 'id' }) as Observable<
      WeatherBulletin[]
    >;
  }

  getPublicationById(id: string): Observable<WeatherBulletin> {
    const alertDocument = doc(this.firestore, `bulletins/${id}`);
    return docData(alertDocument, {
      idField: 'id',
    }) as Observable<WeatherBulletin>;
  }

  async deleteExpiredBulletins(): Promise<void> {
    const now = new Date();
    const nowISO = now.toISOString();

    const alertsCollection = collection(this.firestore, 'bulletins');
    const q = query(alertsCollection);
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(this.firestore);
    let expiredCount = 0;

    querySnapshot.forEach((document) => {
      const bulletin = document.data() as WeatherBulletin;
      if (bulletin.endDate && bulletin.endDate <= nowISO) {
        batch.delete(document.ref);
        expiredCount++;
      }
    });

    if (expiredCount > 0) {
      await batch.commit();
    }
  }
}
