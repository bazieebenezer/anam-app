import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, doc, docData } from '@angular/fire/firestore';
import { AnamEvent } from '../../model/event.model';
<<<<<<< HEAD
import { Observable, from } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
=======
import { Observable } from 'rxjs';
import { NotificationService } from '../notification.service';
>>>>>>> e013242c9996f7dd6a84b79804b07119f29f84d5

@Injectable({
  providedIn: 'root',
})
export class EventService {
<<<<<<< HEAD
  constructor(private firestore: Firestore, private http: HttpClient) {}
=======
  constructor(private firestore: Firestore, private notificationService: NotificationService) {}
>>>>>>> e013242c9996f7dd6a84b79804b07119f29f84d5

  async addEvent(eventData: AnamEvent) {
    const eventsCollection = collection(this.firestore, 'events');
<<<<<<< HEAD
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
=======
    const result = await addDoc(eventsCollection, eventData);
    this.notificationService.notifyUsers(eventData.title, 'événement', eventData.description).subscribe();
    return result;
>>>>>>> e013242c9996f7dd6a84b79804b07119f29f84d5
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
