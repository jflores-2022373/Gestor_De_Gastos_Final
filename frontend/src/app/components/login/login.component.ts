import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Asegúrate de importar tu servicio auth

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('googleButton', { static: false })
  googleButton!: ElementRef<HTMLDivElement>;

  credentials = {
    email: '',
    password: ''
  };

  errorMessage: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  private readonly GOOGLE_CLIENT_ID = '166379704284-ulfiv1j087k9c9bboi4sm1ou7lkr2tjj.apps.googleusercontent.com';

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private authService: AuthService // Inyectamos el servicio de autenticación
  ) {}

  ngAfterViewInit(): void {
    this.inicializarGoogleButton();
  }

  private inicializarGoogleButton(): void {
    if (typeof google === 'undefined' || !google.accounts?.id || !this.googleButton) {
      return;
    }

    google.accounts.id.initialize({
      client_id: this.GOOGLE_CLIENT_ID,
      callback: (response: any) => this.handleGoogleLogin(response)
    });

    google.accounts.id.renderButton(
      this.googleButton.nativeElement,
      {
        theme: 'filled_black',
        size: 'large',
        shape: 'rectangular',
        width: '100%',
        text: 'signin_with'
      }
    );
  }

  private handleGoogleLogin(response: any): void {
    this.ngZone.run(() => {
      if (!response?.credential) {
        this.errorMessage = 'No se pudo iniciar sesión con Google.';
        return;
      }

      // 1. Guardar el token de Google
      localStorage.setItem('token', response.credential);

      // 2. Decodificar el JWT de Google para extraer el correo real
      try {
        const payloadBase64 = response.credential.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        if (decodedPayload.email) {
          localStorage.setItem('userEmail', decodedPayload.email);
        }
      } catch (err) {
        console.error('Error al extraer el email del token de Google', err);
        localStorage.setItem('userEmail', 'usuario.google@spendwise.com');
      }

      this.router.navigate(['/dashboard']);
    });
  }

  onLogin(): void {
    this.errorMessage = '';

    const email = this.credentials.email.trim();
    const password = this.credentials.password.trim();

    if (!email || !password) {
      this.errorMessage = 'Por favor, complete todos los campos requeridos.';
      return;
    }

    if (!this.validarEmail(email)) {
      this.errorMessage = 'Ingrese un correo electrónico válido.';
      return;
    }

    this.isLoading = true;

    // Conexión real con el backend mediante AuthService
    this.authService.login({ email, password }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        // Guardar token real y correo devueltos por el backend
        const tokenReal = res.token || res.accessToken;
        if (tokenReal) {
          localStorage.setItem('token', tokenReal);
        }
        localStorage.setItem('userEmail', email);

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error en el login:', err);
        this.errorMessage = err.error?.message || 'Credenciales incorrectas o error en el servidor.';
      }
    });
  }

  private validarEmail(email: string): boolean {
    const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return patron.test(email);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}