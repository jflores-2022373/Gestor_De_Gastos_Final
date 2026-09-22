import { HttpErrorResponse } from '@angular/common/http';

/** Obtiene un mensaje legible para el usuario a partir de un error HTTP. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifique que el backend esté encendido.';
    }
    const message = error.error?.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  return fallback;
}
