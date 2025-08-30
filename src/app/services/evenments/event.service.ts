import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, doc, docData } from '@angular/fire/firestore';
import { AnamEvent } from '../../model/event.model';
import { Observable, from } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(private firestore: Firestore, private http: HttpClient) {}

  addEvent(eventData: AnamEvent) {
    const eventsCollection = collection(this.firestore, 'events');
    return from(addDoc(eventsCollection, eventData)).pipe(
      tap(() => {
        this.sendNotification('event', eventData.description).subscribe();
      })
    );
  }

  private sendNotification(type: 'bulletin' | 'event', description: string) {
    const payload = { type, description };
    return this.http.post(environment.apiUrl, payload).pipe(
      catchError(async (err) => {
        console.error('Failed to send notification', err);
        return from(Promise.resolve());
      })
    );
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
