import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

/** Solo deja pasar si hay una sesión válida (token existente y no expirado). */
export const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (session.hasValidToken()) {
    return true;
  }

  const hadToken = session.getToken() !== null;
  session.clear();
  return router.createUrlTree(['/login'], hadToken ? { queryParams: { expired: 'true' } } : {});
};

/** Para login y registro: si ya hay sesión, manda directo al dashboard. */
export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  return session.hasValidToken() ? router.createUrlTree(['/dashboard']) : true;
};
