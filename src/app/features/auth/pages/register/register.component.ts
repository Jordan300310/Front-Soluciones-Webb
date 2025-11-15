import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../../core/services/auth/auth.service';
import { RegisterRequest } from '../../../../core/models/auth/RegisterRequest';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private cdr    = inject(ChangeDetectorRef);   

  f: RegisterRequest = {
    nombres: '',
    apat: '',
    amat: '',
    dni: '',
    cel: '',
    email: '',
    fen: '',
    username: '',
    password: ''
  };

  loading = false;
  error = '';

  async onSubmit() {
    if (this.loading) return;

    this.error = '';

    // ====== VALIDACIONES FRONT ======
    if (!this.f.nombres || !this.f.apat || !this.f.amat || !this.f.username || !this.f.password) {
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

    this.loading = true;
    this.cdr.detectChanges();   // 👈 fuerza que aparezca “Procesando…”

    try {
      await this.auth.register(this.f);   // 409 cae al catch
      await this.router.navigate(['/auth/login']);
    } catch (err) {
      const e = err as HttpErrorResponse;

      if (e.status === 409) {
        const msgBackend =
          e.error && typeof e.error === 'object' && 'message' in e.error
            ? (e.error as any).message
            : null;
        this.error = msgBackend || 'DNI o email ya registrado.';
      } else if (e.status === 400) {
        const msgBackend =
          e.error && typeof e.error === 'object' && 'message' in e.error
            ? (e.error as any).message
            : null;
        this.error = msgBackend || 'Datos inválidos. Verifica la información.';
      } else {
        this.error = 'No se pudo registrar.';
      }

      this.cdr.detectChanges(); // 👈 fuerza que se vea el mensaje rojo
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // 👈 fuerza que desaparezca “Procesando…”
    }
  }
}
