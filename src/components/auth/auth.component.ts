import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule]
})
export class AuthComponent {
  private authService = inject(AuthService);

  authMode = signal<'login' | 'register'>('login');
  email = signal('');
  password = signal('');
  error = signal<string | null>(null);

  toggleMode() {
    this.authMode.update(mode => mode === 'login' ? 'register' : 'login');
    this.error.set(null);
  }

  onSubmit() {
    this.error.set(null);
    // For this environment, bypass credential check and log in directly.
    const success = this.authService.login('test@example.com', 'password');
    if (!success) {
      this.error.set('Automatic login failed. Please check the mock credentials.');
    }
  }
}
