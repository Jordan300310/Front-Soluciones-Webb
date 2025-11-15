import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, startWith, switchMap } from 'rxjs';
import { AdminProductosService } from '../../../core/services/admin/admin-producto.service';
import { ProductoAdminDTO } from '../../../core/models/admin/producto.models';
import { AdminProveedoresService } from '../../../core/services/admin/admin-proveedor.service';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './producto.component.html'
})
export class ProductoComponent implements OnInit {
  private api = inject(AdminProductosService);
  private proveedoresApi = inject(AdminProveedoresService);

  private refresh$ = new Subject<void>();
  data$ = this.refresh$.pipe(
    startWith(void 0),
    switchMap(() => this.api.list$())
  );

  proveedores = signal<{ id: number; nombre: string }[]>([]);

  selected = signal<ProductoAdminDTO | null>(null);

  ngOnInit(): void {
    this.proveedoresApi.proveedoresActivos$().subscribe(p => this.proveedores.set(p));

    this.refresh$.next();
  }

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

    const obs = s.id > 0
      ? this.api.update$(s.id, body)
      : this.api.create$(body);

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
