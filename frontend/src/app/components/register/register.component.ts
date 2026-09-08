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

  constructor(private router: Router) {}

  onRegister(): void {
    if (this.email && this.password) {
      console.log('Registrando usuario con:', this.email);
      localStorage.setItem('token', 'token_registro_ejemplo');
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Por favor, complete todos los campos obligatorios.';
    }
  }
}