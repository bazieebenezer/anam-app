import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, authState, User } from '@angular/fire/auth';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { doc, getDoc, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUser$: Observable<AppUser | null>;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.currentUser$ = authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          return from(getDoc(userDocRef)).pipe(
            map(docSnap => {
              if (docSnap.exists()) {
                return { uid: docSnap.id, ...docSnap.data() } as AppUser;
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
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  loginWithGoogle() {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      tap(credential => {
        this.updateUserData(credential.user);
      })
    );
  }

  createUserWithEmailAndPassword(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(credential => {
        this.updateUserData(credential.user, true);
      })
    );
  }

  logout() {
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

  private async updateUserData(user: User, isNewUser: boolean = false) {
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    if (isNewUser) {
      const data: AppUser = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        isAdmin: false
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
          isAdmin: false
        };
        return setDoc(userDocRef, data);
      }
    }
  }
}
