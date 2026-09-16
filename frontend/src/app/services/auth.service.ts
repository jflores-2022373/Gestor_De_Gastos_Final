import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email?: string; username?: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, { headers }).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          if (response.role) {
            localStorage.setItem('role', response.role);
          }
          const identifier = credentials.email || credentials.username || response.email || response.username || 'usuario_default';
          localStorage.setItem('userEmail', identifier);
        }
      })
    );
  }

  register(userData: { email?: string; username?: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}/register`, userData, { headers });
  }

  logout(expired: boolean = false): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    
    if (expired) {
      this.router.navigate(['/login'], { queryParams: { expired: 'true' } });
    } else {
      this.router.navigate(['/login']);
    }
  }

  getUserEmail(): string {
    return localStorage.getItem('userEmail') || 'guest';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}