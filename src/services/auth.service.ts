import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // FIX: Explicitly type the injected Router to resolve type inference issues.
  private router: Router = inject(Router);
  isLoggedIn = signal<boolean>(false);

  constructor() {
    // Check for a logged-in state in session storage for persistence across reloads
    const loggedIn = (typeof sessionStorage !== 'undefined') && sessionStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      this.isLoggedIn.set(true);
    }
  }

  login(email: string, pass: string): boolean {
    // Mock login logic for a test user
    if (email === 'test@example.com' && pass === 'password') {
      this.isLoggedIn.set(true);
      if(typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('isLoggedIn', 'true');
      }
      this.router.navigate(['/discover']);
      return true;
    }
    return false;
  }

  logout() {
    this.isLoggedIn.set(false);
    if(typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('isLoggedIn');
    }
    this.router.navigate(['/login']);
  }
}