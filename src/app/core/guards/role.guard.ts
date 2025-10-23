import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../store/auth.store';

export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const store  = inject(AuthStore);

  if (!store.isLoggedIn()) {
    return router.createUrlTree(['/auth/login']); 
  }

  const needed: string[] = route.data?.['roles'] ?? [];
  const roles = store.roles();
  const ok = needed.length === 0 || needed.some(r => roles.includes(r));
  if (ok) return true;

  return router.createUrlTree(['/']);     
};