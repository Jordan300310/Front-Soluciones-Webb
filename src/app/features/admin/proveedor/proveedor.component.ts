import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, startWith, switchMap } from 'rxjs';
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

  editar(p: Proveedor) {
    this.api.get$(p.id).subscribe(v => this.selected.set(v));
  }

  nuevo() {
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
  }

  guardar() {
    const s = this.selected();
    if (!s) return;

    const body = {
      razonSocial: s.razonSocial,
      ruc: s.ruc,
      cel: s.cel || '',
      email: s.email || '',

    };

    const obs = s.id > 0
      ? this.api.update$(s.id, body)
      : this.api.create$(body);

    obs.subscribe(() => {
      this.cancelar();
      this.refresh$.next();
    });
  }

  eliminar(p: Proveedor) {
    if (!confirm('Eliminar?')) return;
    this.api.delete$(p.id).subscribe(() => this.refresh$.next());
  }
}
