import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { getErrorMessage } from '../../utils/http-error-message';
import { GoogleButtonComponent } from '../google-button/google-button.component';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, GoogleButtonComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Campos del formulario (solo cambian cuando el usuario escribe)
  credentials = {
    email: '',
    password: '',
  };

  // Estado que cambia al responder el servidor -> signals (Angular 22 usa OnPush por defecto)
  readonly errorMessage = signal('');
  readonly infoMessage = signal('');
  readonly isLoading = signal(false);
  readonly showPassword = signal(false);

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('expired') === 'true') {
      this.infoMessage.set('Su sesión expiró. Inicie sesión de nuevo.');
    }
  }

  onLogin(): void {
    this.errorMessage.set('');
    this.infoMessage.set('');

    const email = this.credentials.email.trim();
    // La contraseña NO se recorta: los espacios son parte de ella
    const password = this.credentials.password;

    if (!email || !password) {
      this.errorMessage.set('Por favor, complete todos los campos requeridos.');
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      this.errorMessage.set('Ingrese un correo electrónico válido.');
      return;
    }

    this.isLoading.set(true);

    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(getErrorMessage(err, 'No se pudo iniciar sesión. Intente de nuevo.'));
      },
    });
  }

  onGoogleCredential(credential: string): void {
    this.errorMessage.set('');
    this.infoMessage.set('');
    this.isLoading.set(true);

    this.authService.loginWithGoogle(credential).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(getErrorMessage(err, 'No se pudo iniciar sesión con Google.'));
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
