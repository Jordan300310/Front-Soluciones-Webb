import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { RegisterRequest } from '../../../../core/models/auth/RegisterRequest';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  f: RegisterRequest = {
    nombres:'', apat:'', amat:'', dni:'', cel:'', email:'', fen:'', username:'', password:''
  };
  loading = false;
  error = '';

  async onSubmit() {
    this.loading = true; this.error = '';
    try {
      await this.auth.register(this.f);
      this.router.navigate(['/auth/login']);
    } catch (e: any) {
      this.error = e?.error?.message || 'No se pudo registrar';
    } finally {
      this.loading = false;
    }
  }
}
