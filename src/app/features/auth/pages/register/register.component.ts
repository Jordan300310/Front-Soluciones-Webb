import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { RegisterRequest } from '../../../../core/models/auth/RegisterRequest';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
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
    this.error = '';

    if (!this.f.nombres || !this.f.apat || !this.f.dni || !this.f.email || !this.f.username || !this.f.password) {
      this.error = 'Completa todos los campos obligatorios.';
      return;
    }

    if (!/^\d{8}$/.test(this.f.dni)) {
      this.error = 'El DNI debe tener 8 dígitos numéricos.';
      return;
    }

    if (this.f.cel && !/^\d{9}$/.test(this.f.cel)) {
      this.error = 'El celular debe tener 9 dígitos numéricos.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.f.email)) {
      this.error = 'Ingresa un email válido.';
      return;
    }

    if (this.f.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    // --------- LLAMADA AL BACK ---------
    this.loading = true;
    try {
      await this.auth.register(this.f);
      this.router.navigate(['/auth/login']);
    } catch (err) {
      const e = err as HttpErrorResponse;

      if (e.error && typeof e.error === 'object' && 'message' in e.error) {
        // Mensajes del backend: "Username ya registrado", "DNI ya registrado", etc.
        this.error = (e.error as any).message;
      } else if (e.error && typeof e.error === 'string') {
        this.error = e.error;
      } else {
        this.error = 'No se pudo registrar';
      }
    } finally {
      this.loading = false;
    }
  }
}
