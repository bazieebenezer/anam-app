import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, doc, docData } from '@angular/fire/firestore';
import { AnamEvent } from '../../model/event.model';
import { Observable } from 'rxjs';
import { NotificationService } from '../notification.service';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(private firestore: Firestore, private notificationService: NotificationService) {}

  async addEvent(eventData: AnamEvent) {
    const eventsCollection = collection(this.firestore, 'events');
    const result = await addDoc(eventsCollection, eventData);
    this.notificationService.sendPushNotification({
      title: eventData.title,
      description: eventData.description,
      recipientId: 'all' // Events are sent to everyone
    }).subscribe();
    
    return result;
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
