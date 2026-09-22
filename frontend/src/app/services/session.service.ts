import { Injectable, computed, signal } from '@angular/core';

export interface SessionUser {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  hasPassword: boolean;
  hasGoogle: boolean;
}

const TOKEN_KEY = 'spendwise.token';
const USER_KEY = 'spendwise.user';

/**
 * Guarda y lee la sesión (token + usuario) en localStorage.
 * No depende de HttpClient, así el interceptor puede usarla sin dependencias circulares.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly _user = signal<SessionUser | null>(this.readUser());

  /** Usuario actual como signal, para usar directamente en las plantillas. */
  readonly user = this._user.asReadonly();
  readonly displayName = computed(() => this._user()?.username ?? 'Usuario');
  readonly initials = computed(() => this.displayName().slice(0, 2).toUpperCase());

  save(token: string, user: SessionUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  updateUser(user: SessionUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** True si hay token y todavía no expiró (se revisa el campo "exp" del JWT). */
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(payloadBase64));
      if (typeof payload.exp !== 'number') return true;
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private readUser(): SessionUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      return null;
    }
  }
}
