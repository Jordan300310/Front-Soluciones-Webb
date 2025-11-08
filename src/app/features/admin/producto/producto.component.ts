import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, startWith, switchMap } from 'rxjs';
import { AdminProductosService } from '../../../core/services/admin/admin-producto.service';
import { ProductoAdminDTO } from '../../../core/models/admin/producto.models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.component.html'
})
export class ProductoComponent {
  private api = inject(AdminProductosService);

  private refresh$ = new Subject<void>();
  data$ = this.refresh$.pipe(
    startWith(void 0),
    switchMap(() => this.api.list$())
  );

  selected = signal<ProductoAdminDTO | null>(null);

  editar(p: ProductoAdminDTO) {
    this.api.get$(p.id).subscribe(v => this.selected.set(v));
  }

  nuevo() {
    this.selected.set({
      id: 0,
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      marca: '',
      categoria: '',
      idProveedor: null,
      proveedorNombre: null,
      imagenUrl: '',
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
      nombre: s.nombre,
      descripcion: s.descripcion || '',
      precio: Number(s.precio) || 0,
      stock: Number(s.stock) || 0,
      marca: s.marca || '',
      categoria: s.categoria || '',
      idProveedor: s.idProveedor ?? null,
      imagenUrl: s.imagenUrl || ''
    };

    const obs = s.id > 0 ? this.api.update$(s.id, body) : this.api.create$(body);
    obs.subscribe(() => {
      this.cancelar();
      this.refresh$.next();
    });
  }

  eliminar(p: ProductoAdminDTO) {
    if (!confirm('Eliminar?')) return;
    this.api.delete$(p.id).subscribe(() => this.refresh$.next());
  }
}
