import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { SessionService } from './session.service';

// En estas rutas un 401 significa "datos incorrectos", no "sesión expirada"
const PUBLIC_AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/google'];

/**
 * - Agrega "Authorization: Bearer <token>" solo a las peticiones hacia nuestra API.
 * - Si la API responde 401 (sesión vencida o inválida), cierra la sesión y manda al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const router = inject(Router);

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const isPublicAuth = PUBLIC_AUTH_ROUTES.some((path) => req.url.endsWith(path));
  const token = session.getToken();

  const request =
    isApiRequest && token && !isPublicAuth
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isApiRequest && !isPublicAuth) {
        session.clear();
        router.navigate(['/login'], { queryParams: { expired: 'true' } });
      }
      return throwError(() => error);
    })
  );
};
