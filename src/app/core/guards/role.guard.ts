import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const auth   = inject(AuthService);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/auth/login']);
  }

  const needed: string[] = route.data?.['roles'] ?? [];
  const roles = auth.getRoles();
  const ok = needed.length === 0 || needed.some(r => roles.includes(r));
  return ok ? true : router.createUrlTree(['/']);
};
