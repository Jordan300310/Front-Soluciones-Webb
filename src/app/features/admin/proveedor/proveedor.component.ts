import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, startWith, switchMap, firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { AdminProveedoresService } from '../../../core/services/admin/admin-proveedor.service';
import { Proveedor } from '../../../core/models/admin/proveedor.models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedor.component.html'
})
export class ProveedorComponent {
  private api = inject(AdminProveedoresService);

  private refresh$ = new Subject<void>();
  data$ = this.refresh$.pipe(
    startWith(void 0),
    switchMap(() => this.api.list$())
  );

  selected = signal<Proveedor | null>(null);

  loading = signal<boolean>(false);
  error   = signal<string | null>(null);

  private isValidRuc(ruc: string): boolean {
    if (!/^\d{11}$/.test(ruc)) return false;

    const nums = ruc.split('').map(d => Number(d));
    const factors = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]; 
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += nums[i] * factors[i];
    }
    const remainder = sum % 11;
    const check = 11 - remainder;
    const dv = check === 10 ? 0 : (check === 11 ? 1 : check);
    return dv === nums[10];
  }

  editar(p: Proveedor) {
    this.api.get$(p.id).subscribe(v => {
      this.error.set(null);
      this.selected.set(v);
    });
  }

  nuevo() {
    this.error.set(null);
    this.selected.set({
      id: 0,
      razonSocial: '',
      ruc: '',
      cel: '',
      email: '',
      estado: true
    });
  }

  cancelar() {
    this.selected.set(null);
    this.error.set(null);
    this.loading.set(false);
  }

  async guardar() {
    const s = this.selected();
    if (!s) return;

    this.error.set(null);

    if (!s.razonSocial || !s.ruc) {
      this.error.set('Razón social y RUC son obligatorios.');
      return;
    }

    if (!this.isValidRuc(s.ruc)) {
      this.error.set('RUC inválido. Verifica el número ingresado.');
      return;
    }

    if (s.cel && !/^\d{9}$/.test(s.cel)) {
      this.error.set('El celular debe tener 9 dígitos numéricos.');
      return;
    }

    if (s.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(s.email)) {
        this.error.set('Ingresa un email válido.');
        return;
      }
    }

    this.loading.set(true);

    try {
      const body = {
        razonSocial: s.razonSocial,
        ruc: s.ruc,
        cel: s.cel || '',
        email: s.email || ''
      };

      if (s.id > 0) {
        await firstValueFrom(this.api.update$(s.id, body));
      } else {
        await firstValueFrom(this.api.create$(body));
      }

      this.cancelar();
      this.refresh$.next();
    } catch (err) {
      const e = err as HttpErrorResponse;

      if (e.status === 409) {
        this.error.set('RUC ya registrado para otro proveedor.');
      } else if (e.status === 400) {
        this.error.set('Datos inválidos. Verifica la información ingresada.');
      } else {
        this.error.set('No se pudo guardar el proveedor.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  eliminar(p: Proveedor) {
    if (!confirm('¿Eliminar proveedor?')) return;
    this.api.delete$(p.id).subscribe(() => this.refresh$.next());
  }
}
