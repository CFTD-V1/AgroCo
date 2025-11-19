import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.token()) {
    return router.parseUrl('/login');
  }

  const user = await auth.ensureUser();
  if (!user?.is_admin) {
    return router.parseUrl('/');
  }

  return true;
};
