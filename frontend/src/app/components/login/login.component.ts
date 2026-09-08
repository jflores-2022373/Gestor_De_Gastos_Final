import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: ''
  };
  errorMessage: string = '';

  constructor(private router: Router, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.inicializarGoogleButton();
  }

  inicializarGoogleButton(): void {
    google.accounts.id.initialize({
      client_id: '166379704284-ulfiv1j087k9c9bboi4sm1ou7lkr2tjj.apps.googleusercontent.com',
      callback: (resp: any) => this.handleGoogleLogin(resp)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { 
        theme: 'filled_black', 
        size: 'large', 
        shape: 'rectangular', 
        width: '100%',
        text: 'signin_with' 
      }
    );
  }

  handleGoogleLogin(response: any): void {
    this.ngZone.run(() => {
      console.log('Token de Google obtenido:', response.credential);
      localStorage.setItem('token', response.credential);
      this.router.navigate(['/dashboard']);
    });
  }

  onLogin(): void {
    if (this.credentials.email && this.credentials.password) {
      localStorage.setItem('token', 'token_ejemplo');
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Por favor, complete todos los campos.';
    }
  }
}