import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { AuthStore } from '../../../../core/store/auth.store';
import { LoginRequest } from '../../../../core/models/auth/LoginRequest';  



@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private store = inject(AuthStore);
  private router = inject(Router);

  username = '';
  password = '';
  loading = false;
  error = '';

  async onSubmit() {
    this.error = '';
    this.loading = true;
    try {
      const body: LoginRequest = { username: this.username, password: this.password };
      const resp = await this.auth.login(body);
      const roles = resp.roles ?? this.store.roles();
      if (roles.includes('EMPLEADO')) this.router.navigate(['/admin/clientes']);
      else this.router.navigate(['/']); 
    } catch (e: any) {
      this.error = e?.error?.message || 'No se pudo iniciar sesión';
    } finally {
      this.loading = false;
    }
  }
}
