import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { getErrorMessage } from '../../utils/http-error-message';
import { GoogleButtonComponent } from '../google-button/google-button.component';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;
const MIN_PASSWORD_LENGTH = 8;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, GoogleButtonComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly minPasswordLength = MIN_PASSWORD_LENGTH;

  credentials = {
    username: '',
    email: '',
    password: '',
  };

  // Estado que cambia al responder el servidor -> signals (Angular 22 usa OnPush por defecto)
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly showPassword = signal(false);
  readonly isLoading = signal(false);

  onRegister(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const username = this.credentials.username.trim();
    const email = this.credentials.email.trim();
    const password = this.credentials.password;

    if (!username || !email || !password) {
      this.errorMessage.set('Por favor, complete todos los campos requeridos.');
      return;
    }
    if (!USERNAME_REGEX.test(username)) {
      this.errorMessage.set(
        'El usuario debe tener entre 3 y 30 caracteres: letras, números, punto, guion o guion bajo (sin espacios).'
      );
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      this.errorMessage.set('Ingrese un correo electrónico válido.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      this.errorMessage.set(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    this.isLoading.set(true);

    this.authService.register({ username, email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('¡Cuenta creada! Entrando a su panel...');
        setTimeout(() => this.router.navigate(['/dashboard']), 800);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(getErrorMessage(err, 'No se pudo completar el registro. Intente de nuevo.'));
      },
    });
  }

  onGoogleCredential(credential: string): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);

    this.authService.loginWithGoogle(credential).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(getErrorMessage(err, 'No se pudo registrar con Google.'));
      },
    });
  }

  onGoogleError(message: string): void {
    this.errorMessage.set(message);
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
}
