import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/public/pages/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/pages/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['EMPLEADO'] },
    loadComponent: () =>
      import('./features/admin/panel/panel.component').then((m) => m.panelComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'clientes' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/admin/cliente/cliente.component').then((m) => m.ClienteComponent),
      },
      {
        path: 'empleados',
        loadComponent: () =>
          import('./features/admin/empleado/empleado.component').then((m) => m.EmpleadoComponent),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/admin/producto/producto.component').then((m) => m.ProductoComponent),
      },
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./features/admin/proveedor/proveedor.component').then(
            (m) => m.ProveedorComponent
          ),
      },
      {
        path: 'compras',
        loadComponent: () =>
          import('./features/admin/compra/compra.component').then((m) => m.CompraComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
