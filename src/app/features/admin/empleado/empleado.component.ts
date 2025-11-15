import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, startWith, switchMap, firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { AdminEmpleadosService } from '../../../core/services/admin/admin-empleado.service';
import {
  EmpleadoAdminDTO,
  CrearEmpleadoRequest,
  UpdateEmpleadoRequest
} from '../../../core/models/admin/empleado.models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleado.component.html'
})
export class EmpleadoComponent {
  private api = inject(AdminEmpleadosService);
  private cdr = inject(ChangeDetectorRef); 

  private refresh$ = new Subject<void>();
  data$ = this.refresh$.pipe(
    startWith(void 0),
    switchMap(() => this.api.list$())
  );

  selected: (EmpleadoAdminDTO & { password?: string }) | null = null;
  creando = false;
  loading = false;
  error = '';

  // ====== LISTA ======

  editar(e: EmpleadoAdminDTO) {
    this.api.get$(e.idEmpleado).subscribe(v => {
      this.creando = false;
      this.error = '';
      this.selected = { ...v };
      this.cdr.detectChanges(); 
    });
  }

  nuevo() {
    this.creando = true;
    this.error = '';
    this.selected = {
      idEmpleado: 0,
      idUsuario: 0,
      username: '',
      nom: '',
      apat: '',
      amat: '',
      dni: '',
      cel: '',
      email: '',
      fen: '',
      cargo: '',
      sueldo: 0,
      empleadoEstado: true,
      usuarioEstado: true,
      password: ''
    };
    this.cdr.detectChanges();
  }

  cancelar() {
    this.selected = null;
    this.error = '';
    this.loading = false;
    this.cdr.detectChanges();
  }

  eliminar(e: EmpleadoAdminDTO) {
    if (!confirm('Eliminar?')) return;
    this.api.delete$(e.idEmpleado).subscribe(() => {
      this.refresh$.next();
      this.cdr.detectChanges();
    });
  }

  // ====== GUARDAR (CREAR / EDITAR) ======

  async guardar() {
    const s = this.selected;
    if (!s) return;

    this.error = '';

    if (!s.nom || !s.apat || !s.amat || !s.username || (this.creando && !s.password)) {
      this.error = 'Completa todos los campos obligatorios.';
      this.cdr.detectChanges();
      return;
    }

    if (s.dni && !/^\d{8}$/.test(s.dni)) {
      this.error = 'El DNI debe tener 8 dígitos numéricos.';
      this.cdr.detectChanges();
      return;
    }

    if (s.cel && !/^\d{9}$/.test(s.cel)) {
      this.error = 'El celular debe tener 9 dígitos numéricos.';
      this.cdr.detectChanges();
      return;
    }

    if (s.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(s.email)) {
        this.error = 'Ingresa un email válido.';
        this.cdr.detectChanges();
        return;
      }
    }

    if (this.creando && s.password && s.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges(); // 👈 muestra spinner/botón deshabilitado

    try {
      if (this.creando) {
        const body: CrearEmpleadoRequest = {
          nom: s.nom || '',
          apat: s.apat || '',
          amat: s.amat || '',
          dni: s.dni || '',
          cel: s.cel || '',
          email: s.email || '',
          fen: s.fen || '',
          cargo: s.cargo || '',
          sueldo: Number(s.sueldo) || 0,
          username: s.username || '',
          password: s.password || ''
        };
        await firstValueFrom(this.api.create$(body));
      } else {
        const body: UpdateEmpleadoRequest = {
          nom: s.nom || '',
          apat: s.apat || '',
          amat: s.amat || '',
          dni: s.dni || '',
          cel: s.cel || '',
          email: s.email || '',
          fen: s.fen || '',
          cargo: s.cargo || '',
          sueldo: Number(s.sueldo) || 0,
          username: s.username || ''
        };

        await firstValueFrom(this.api.update$(s.idEmpleado, body));
      }

      this.cancelar();
      this.refresh$.next();
      this.cdr.detectChanges();
    } catch (err) {
      const e = err as HttpErrorResponse;

      if (e.status === 409) {
        this.error = 'DNI ya registrado.';
      } else if (e.status === 400) {
        this.error = 'Datos inválidos. Verifica la información ingresada.';
      } else {
        this.error = 'No se pudo guardar el empleado.';
      }

      this.cdr.detectChanges(); 
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
