import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, docData, query } from '@angular/fire/firestore';
import { WeatherBulletin } from '../../model/bulletin.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {

  constructor(private firestore: Firestore) { }

  addAlert(alertData: WeatherBulletin) {
    const alertsCollection = collection(this.firestore, 'bulletins');
    return addDoc(alertsCollection, alertData);
  }

  getPublications(): Observable<WeatherBulletin[]> {
    const alertsCollection = collection(this.firestore, 'bulletins');
    const q = query(alertsCollection);
    return collectionData(q, { idField: 'id' }) as Observable<WeatherBulletin[]>;
  }

  getPublicationById(id: string): Observable<WeatherBulletin> {
    const alertDocument = doc(this.firestore, `bulletins/${id}`);
    return docData(alertDocument, { idField: 'id' }) as Observable<WeatherBulletin>;
  }
}
