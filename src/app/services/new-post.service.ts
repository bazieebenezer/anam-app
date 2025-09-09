import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, combineLatest, from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { PublicationService } from './publication/publication.service';
import { EventService } from './evenments/event.service';
import { WeatherBulletin } from '../model/bulletin.model';
import { AnamEvent } from '../model/event.model';
import { AuthService, AppUser } from './auth/auth.service';

// Union type for posts
export type Post = (WeatherBulletin & { type: 'bulletin' }) | (AnamEvent & { type: 'event' });

const SEEN_POSTS_KEY = 'seen_posts';

@Injectable({
  providedIn: 'root'
})
export class NewPostService {

  private seenPosts = new BehaviorSubject<string[]>([]);

  constructor(
    private storage: Storage,
    private publicationService: PublicationService,
    private eventService: EventService,
    private authService: AuthService
  ) {
    this.initStorage();
  }

  async initStorage() {
    await this.storage.create();
    const seenPosts = await this.storage.get(SEEN_POSTS_KEY);
    this.seenPosts.next(seenPosts || []);
  }

  getNewPosts() {
    const bulletins$ = this.publicationService.getPublications().pipe(
      map(bulletins => bulletins.map(b => ({ ...b, type: 'bulletin' } as Post)))
    );

    const events$ = this.eventService.getEventsFromFirebase().pipe(
      map(events => events.map(e => ({ ...e, type: 'event' } as Post)))
    );

    return combineLatest([
      bulletins$,
      events$,
      this.seenPosts,
      this.authService.currentUser$
    ]).pipe(
      map(([bulletins, events, seen, currentUser]) => {
        const allPosts = [...bulletins, ...events];

        const filteredPosts = allPosts.filter(post => {
          if (post.type === 'bulletin' && post.targetInstitutionId) {
            // This is a targeted bulletin
            return currentUser?.uid === post.targetInstitutionId;
          }
          // This is a general post (event or bulletin)
          return true;
        });

        // Filter out seen posts
        const newPosts = filteredPosts.filter(post => post.id && !seen.includes(post.id));
        
        // Sort by creation date, newest first
        return newPosts.sort((a, b) => {
          const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return dateB - dateA;
        });
      })
    );
  }

  getNewPostsCount() {
    return this.getNewPosts().pipe(
      map(posts => posts.length)
    );
  }

  markPostAsSeen(postId: string) {
    const currentSeen = this.seenPosts.value;
    if (!currentSeen.includes(postId)) {
      const newSeen = [...currentSeen, postId];
      this.seenPosts.next(newSeen);
      return from(this.storage.set(SEEN_POSTS_KEY, newSeen));
    }
    return from(Promise.resolve());
  }
}