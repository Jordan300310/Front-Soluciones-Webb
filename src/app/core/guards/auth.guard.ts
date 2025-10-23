import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../store/auth.store';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const store  = inject(AuthStore);
  const auth   = inject(AuthService);

  if (!store.isLoggedIn()) await auth.me();
  if (store.isLoggedIn()) return true;

  return router.createUrlTree(['/auth/login']);  
};

