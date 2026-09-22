import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { SessionService, SessionUser } from './session.service';

interface SessionResponse {
  message: string;
  token: string;
  user: SessionUser;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  readonly user = this.session.user;

  login(email: string, password: string): Observable<SessionResponse> {
    return this.http
      .post<SessionResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap((res) => this.session.save(res.token, res.user)));
  }

  /** Registra la cuenta y deja la sesión iniciada de una vez. */
  register(data: RegisterData): Observable<SessionResponse> {
    return this.http
      .post(`${this.apiUrl}/register`, data)
      .pipe(switchMap(() => this.login(data.email, data.password)));
  }

  /** Envía al backend el "credential" que entrega Google para que lo verifique. */
  loginWithGoogle(credential: string): Observable<SessionResponse> {
    return this.http
      .post<SessionResponse>(`${this.apiUrl}/google`, { credential })
      .pipe(tap((res) => this.session.save(res.token, res.user)));
  }

  /** Actualiza los datos del usuario desde el servidor. */
  refreshUser(): Observable<{ user: SessionUser }> {
    return this.http
      .get<{ user: SessionUser }>(`${this.apiUrl}/me`)
      .pipe(tap((res) => this.session.updateUser(res.user)));
  }

  isLoggedIn(): boolean {
    return this.session.hasValidToken();
  }

  logout(expired = false): void {
    this.session.clear();
    // Evita que Google vuelva a iniciar sesión automáticamente con la misma cuenta
    const g = (window as { google?: { accounts?: { id?: { disableAutoSelect(): void } } } }).google;
    g?.accounts?.id?.disableAutoSelect();

    this.router.navigate(['/login'], expired ? { queryParams: { expired: 'true' } } : {});
  }
}
