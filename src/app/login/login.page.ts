import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
// import { Auth, GoogleAuthProvider, signInWithRedirect } from '@angular/fire/auth';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async signIn() {
    try {
      await this.authService.signInWithEmail(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error) {
      await this.signUp()
    }
  }

  async signUp() {
    try {
      await this.authService.signUpWithEmail(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error during sign up', error);
    }
  }

  async signInWithGoogle() {
    try {
      await this.authService.signInWithGoogle();
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error during Google sign in', error);
    }
  }
  ngOnInit() {
    console.log('login page initialized');
  }

}
