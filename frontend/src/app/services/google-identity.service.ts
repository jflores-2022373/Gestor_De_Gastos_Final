import { Injectable } from '@angular/core';

const SCRIPT_URL = 'https://accounts.google.com/gsi/client';

/** Tipos mínimos de la librería Google Identity Services que usamos. */
export interface GoogleCredentialResponse {
  credential?: string;
}

export interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_button?: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

/**
 * Carga el script de Google una sola vez y avisa cuando está listo.
 * Evita el error de "google is not defined" cuando el componente se muestra
 * antes de que el script termine de descargarse.
 */
@Injectable({ providedIn: 'root' })
export class GoogleIdentityService {
  private loading?: Promise<GoogleAccountsId>;

  load(): Promise<GoogleAccountsId> {
    const ready = window.google?.accounts?.id;
    if (ready) return Promise.resolve(ready);

    if (!this.loading) {
      this.loading = new Promise<GoogleAccountsId>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = SCRIPT_URL;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          const api = window.google?.accounts?.id;
          if (api) {
            resolve(api);
          } else {
            reject(new Error('La librería de Google no se inicializó'));
          }
        };
        script.onerror = () => {
          this.loading = undefined; // permite reintentar
          reject(new Error('No se pudo cargar el script de Google'));
        };
        document.head.appendChild(script);
      });
    }

    return this.loading;
  }
}
