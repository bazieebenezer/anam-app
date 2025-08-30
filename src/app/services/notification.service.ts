import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private emailServerUrl = environment.emailServerUrl;

  constructor(private http: HttpClient) { }

  notifyUsers(title: string, type: 'bulletin' | 'événement', description?: string): Observable<any> {
    const body: any = { postTitle: title, postType: type };
    if (description) {
      body.description = description;
    }
    return this.http.post(`${this.emailServerUrl}/send-notifications`, body);
  }
}
