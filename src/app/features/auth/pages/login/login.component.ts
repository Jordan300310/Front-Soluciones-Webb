import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';   // 👈 importa RouterModule
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { LoginRequest } from '../../../../core/models/auth/LoginRequest';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],     // 👈 agrega RouterModule aquí
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  username = '';
  password = '';
  loading = false;
  error = '';

  async onSubmit() {
    this.error = '';

    if (!this.username || !this.password) {
      this.error = 'Username y contraseña son requeridos.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    try {
      const body: LoginRequest = { username: this.username, password: this.password };
      const resp = await this.auth.login(body);
      const roles = resp.roles ?? [];

      if (roles.includes('EMPLEADO')) {
        this.router.navigate(['/admin/clientes']);
      } else {
        this.router.navigate(['/']);
      }
    } catch (err) {
      const e = err as HttpErrorResponse;

      if (e.status === 0) {
        this.error = 'No se pudo conectar con el servidor. Inténtalo más tarde.';
      } else if (e.status === 401) {
        this.error = (e.error && (e.error as any).message)
          ? (e.error as any).message
          : 'Credenciales inválidas. Verifica tu usuario o contraseña.';
      } else if (e.error && typeof e.error === 'object' && 'message' in e.error) {
        this.error = (e.error as any).message;
      } else if (e.error && typeof e.error === 'string') {
        this.error = e.error;
      } else {
        this.error = 'No se pudo iniciar sesión. Inténtalo nuevamente.';
      }

      this.cdr.detectChanges();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
