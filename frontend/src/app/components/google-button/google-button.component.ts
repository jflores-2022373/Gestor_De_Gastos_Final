import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { GoogleIdentityService } from '../../services/google-identity.service';

/**
 * Botón oficial de "Iniciar sesión con Google".
 * Emite (credential) con el ID token de Google; el componente padre
 * lo envía al backend, que es quien lo verifica y crea la sesión.
 */
@Component({
  selector: 'app-google-button',
  standalone: true,
  template: `
    <div #container class="google-button-host"></div>
    @if (loadError()) {
      <p class="google-load-error">{{ loadError() }}</p>
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .google-button-host {
      width: 100%;
      min-height: 44px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .google-load-error {
      margin: 6px 0 0;
      text-align: center;
      font-size: 12px;
      color: #ff727a;
    }
  `],
})
export class GoogleButtonComponent implements AfterViewInit {
  /** Texto del botón: "Iniciar sesión con Google" o "Registrarse con Google". */
  readonly text = input<'signin_with' | 'signup_with' | 'continue_with'>('signin_with');

  readonly credential = output<string>();
  readonly failed = output<string>();

  @ViewChild('container', { static: true })
  private container!: ElementRef<HTMLDivElement>;

  private readonly googleIdentity = inject(GoogleIdentityService);
  private readonly zone = inject(NgZone);

  readonly loadError = signal('');

  async ngAfterViewInit(): Promise<void> {
    try {
      const api = await this.googleIdentity.load();

      api.initialize({
        client_id: environment.googleClientId,
        // El callback lo ejecuta Google fuera de Angular; zone.run actualiza la vista
        callback: (response) =>
          this.zone.run(() => {
            if (response.credential) {
              this.credential.emit(response.credential);
            } else {
              this.failed.emit('Google no devolvió las credenciales. Intente de nuevo.');
            }
          }),
        cancel_on_tap_outside: true,
      });

      // Google exige un ancho en píxeles entre 200 y 400
      const available = this.container.nativeElement.clientWidth || 320;
      const width = Math.min(400, Math.max(200, Math.floor(available)));

      api.renderButton(this.container.nativeElement, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        shape: 'rectangular',
        text: this.text(),
        logo_alignment: 'left',
        locale: 'es',
        width,
      });
    } catch {
      this.loadError.set('No se pudo cargar el inicio de sesión con Google. Revise su conexión a internet.');
    }
  }
}
