import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(private router: Router) {}

  onRegister(): void {
    this.errorMessage = '';

    if (this.email && this.password) {
      this.isLoading = true;
      console.log('Registrando usuario con:', this.email);
      
      // Simulación de proceso de registro
      setTimeout(() => {
        // Corrección: Redirigimos al inicio de sesión para que confirme sus datos
        this.router.navigate(['/login']);
      }, 700);
    } else {
      this.errorMessage = 'Por favor, complete todos los campos obligatorios.';
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}