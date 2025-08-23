import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, doc, docData } from '@angular/fire/firestore';
import { AnamEvent } from '../../model/event.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(private firestore: Firestore) {}

  addEvent(eventData: AnamEvent) {
    const eventsCollection = collection(this.firestore, 'events');
    return addDoc(eventsCollection, eventData);
  }

  getEventsFromFirebase(): Observable<AnamEvent[]> {
    const eventsCollection = collection(this.firestore, 'events');
    const q = query(eventsCollection);
    return collectionData(q, { idField: 'id' }) as Observable<AnamEvent[]>;
  }

  getEventById(id: string): Observable<AnamEvent> {
    const eventDocument = doc(this.firestore, `events/${id}`);
    return docData(eventDocument, { idField: 'id' }) as Observable<AnamEvent>;
  }
}
