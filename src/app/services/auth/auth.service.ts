import { Capacitor } from '@capacitor/core';
import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, authState, User, signInWithRedirect } from '@angular/fire/auth';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { doc, getDoc, Firestore, setDoc, updateDoc, collection, query, where, collectionData } from '@angular/fire/firestore';
import { FcmService } from '../fcm/fcm.service';

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin?: boolean;
  isInstitution?: boolean;
  institutionId?: string; // Maintenu pour d'autres usages potentiels
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUser$: Observable<AppUser | null>;
  private institutionTopic: string | null = null;

  constructor(private auth: Auth, private firestore: Firestore, private fcmService: FcmService) {
    // S'abonner au topic général dès l'initialisation du service
    this.fcmService.subscribeToTopic('newPosts');

    this.currentUser$ = authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          return from(getDoc(userDocRef)).pipe(
            map(docSnap => {
              if (docSnap.exists()) {
                const appUser = { uid: docSnap.id, ...docSnap.data() } as AppUser;
                this.handleInstitutionSubscription(appUser);
                return appUser;
              } else {
                const newUser: AppUser = { uid: user.uid, email: user.email || '' };
                setDoc(userDocRef, newUser, { merge: true });
                this.handleInstitutionSubscription(newUser);
                return newUser;
              }
            })
          );
        } else {
          this.unsubscribeFromInstitutionTopic();
          return of(null);
        }
      })
    );
  }

  /**
   * Gère l'abonnement spécifique pour les comptes de type institution.
   */
  private async handleInstitutionSubscription(user: AppUser) {
    const newTopic = user.isInstitution ? `institution_${user.uid}` : null;

    if (this.institutionTopic !== newTopic) {
      if (this.institutionTopic) {
        this.fcmService.unsubscribeFromTopic(this.institutionTopic);
      }
      if (newTopic) {
        this.fcmService.subscribeToTopic(newTopic);
      }
      this.institutionTopic = newTopic;
    }
  }

  /**
   * Se désabonne uniquement du topic de l'institution.
   */
  private async unsubscribeFromInstitutionTopic() {
    if (this.institutionTopic) {
      this.fcmService.unsubscribeFromTopic(this.institutionTopic);
      this.institutionTopic = null;
    }
  }

  loginWithEmailAndPassword(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  loginWithGoogle() {
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      return from(signInWithRedirect(this.auth, new GoogleAuthProvider()));
    } else {
      return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
        tap(credential => { this.updateUserData(credential.user); })
      );
    }
  }

  createUserWithEmailAndPassword(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(credential => { this.updateUserData(credential.user, true); })
    );
  }

  async logout() {
    // Se désabonner uniquement du topic de l'institution, pas de 'newPosts'
    await this.unsubscribeFromInstitutionTopic();
    return this.auth.signOut();
  }

  setUserAsAdmin() {
    const user = this.auth.currentUser;
    if (user) {
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      return from(updateDoc(userDocRef, { isAdmin: true }));
    }
    return of(null);
  }

  setUserAsInstitution() {
    const user = this.auth.currentUser;
    if (user) {
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      return from(setDoc(userDocRef, { isInstitution: true }, { merge: true }));
    }
    return of(null);
  }

  getInstitutionUsers(): Observable<AppUser[]> {
    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where('isInstitution', '==', true));
    return collectionData(q, { idField: 'uid' }) as Observable<AppUser[]>;
  }

  private async updateUserData(user: User, isNewUser: boolean = false) {
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    const docSnap = await getDoc(userDocRef);

    if (isNewUser || !docSnap.exists()) {
      const data: AppUser = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        isAdmin: false,
        isInstitution: false
      };
      return setDoc(userDocRef, data, { merge: true });
    }
    return;
  }
}

