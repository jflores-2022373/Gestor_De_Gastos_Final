import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  credentials = {
    username: '',
    email: '',
    password: ''
  };

  errorMessage: string = '';
  successMessage: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const username = this.credentials.username.trim();
    const email = this.credentials.email.trim();
    const password = this.credentials.password.trim();

    if (!username || !email || !password) {
      this.errorMessage = 'Por favor, complete todos los campos requeridos.';
      return;
    }

    this.isLoading = true;
    this.authService.register({ username, email, password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = '¡Registro exitoso! Redirigiendo al login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error en el registro:', err);
        this.errorMessage = err.error?.message || 'No se pudo completar el registro. Intente con otro usuario o correo.';
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}