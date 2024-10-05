import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<firebase.User | null>;

  constructor(private afAuth: AngularFireAuth) {
    this.user$ = this.afAuth.authState;
  }

  async signInWithEmail(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return await this.afAuth.signInWithEmailAndPassword(email, password);
  }

  async signUpWithEmail(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return await this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  async signInWithGoogle(): Promise<firebase.auth.UserCredential> {
    return await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  async signOut(): Promise<void> {
    return await this.afAuth.signOut();
  }
}
