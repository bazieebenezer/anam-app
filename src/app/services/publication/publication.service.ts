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
<<<<<<< HEAD
import { Observable, from } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
=======

import { Observable } from 'rxjs';
import { NotificationService } from '../notification.service';
>>>>>>> e013242c9996f7dd6a84b79804b07119f29f84d5

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
<<<<<<< HEAD
  constructor(private firestore: Firestore, private http: HttpClient) {}
=======
  constructor(private firestore: Firestore, private notificationService: NotificationService) {}
>>>>>>> e013242c9996f7dd6a84b79804b07119f29f84d5

  async addAlert(alertData: WeatherBulletin) {
    const alertsCollection = collection(this.firestore, 'bulletins');
<<<<<<< HEAD
    // Convert the promise returned by addDoc to an observable
    return from(addDoc(alertsCollection, alertData)).pipe(
      tap(() => {
        // This code runs on success. We trigger the notification but don't wait for it.
        this.sendNotification('bulletin', alertData.description).subscribe();
      })
    );
  }

  private sendNotification(type: 'bulletin' | 'event', description: string) {
    const payload = { type, description };
    return this.http.post(environment.apiUrl, payload).pipe(
      catchError(async (err) => {
        console.error('Failed to send notification', err);
        // Return a resolved promise or some default value so the stream doesn't break
        return from(Promise.resolve());
      })
    );
=======
    const result = await addDoc(alertsCollection, alertData);
    this.notificationService.notifyUsers(alertData.title, 'bulletin', alertData.description).subscribe();
    return result;
>>>>>>> e013242c9996f7dd6a84b79804b07119f29f84d5
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
