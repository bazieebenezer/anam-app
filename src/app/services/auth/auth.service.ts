import { Capacitor } from '@capacitor/core';
import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, authState, User, signInWithRedirect } from '@angular/fire/auth';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { doc, getDoc, Firestore, setDoc, updateDoc, collection, query, where, collectionData } from '@angular/fire/firestore';
import { FcmService } from '../fcm/fcm.service'; // Import FcmService

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin?: boolean;
  isInstitution?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUser$: Observable<AppUser | null>;

  constructor(private auth: Auth, private firestore: Firestore, private fcmService: FcmService) {
    this.currentUser$ = authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          return from(getDoc(userDocRef)).pipe(
            map(docSnap => {
              if (docSnap.exists()) {
                const appUser = { uid: docSnap.id, ...docSnap.data() } as AppUser;
                // If the user is an institution, subscribe to their topic
                if (appUser.isInstitution) {
                  console.log(`User is an institution. Subscribing to topic: institution_${appUser.uid}`);
                  this.fcmService.subscribeToTopic(`institution_${appUser.uid}`);
                }
                return appUser;
              } else {
                return null;
              }
            })
          );
        } else {
          return of(null);
        }
      })
    );
  }

  loginWithEmailAndPassword(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(credential => {
        this.updateUserData(credential.user);
      })
    );
  }

    loginWithGoogle() {
    const platform = Capacitor.getPlatform();

    if (platform === 'web') {
      // For web, use redirect which is better for mobile browsers and avoids popups
      return from(signInWithRedirect(this.auth, new GoogleAuthProvider()));
    } else {
      // For native, popup is generally fine
      return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
        tap(credential => {
          this.updateUserData(credential.user);
        })
      );
    }
  }

  createUserWithEmailAndPassword(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(credential => {
        this.updateUserData(credential.user, true);
      })
    );
  }

  async logout() {
    const user = this.auth.currentUser;
    if (user) {
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const appUser = { uid: docSnap.id, ...docSnap.data() } as AppUser;
        // If the user is an institution, unsubscribe from their topic
        if (appUser.isInstitution) {
          console.log(`User is an institution. Unsubscribing from topic: institution_${appUser.uid}`);
          this.fcmService.unsubscribeFromTopic(`institution_${appUser.uid}`);
        }
      }
    }
    return from(this.auth.signOut());
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
    if (isNewUser) {
      const data: AppUser = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        isAdmin: false,
        isInstitution: false
      };
      return setDoc(userDocRef, data);
    } else {
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        const data: AppUser = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          isAdmin: false,
        isInstitution: false
        };
        return setDoc(userDocRef, data);
      }
    }
  }
}

