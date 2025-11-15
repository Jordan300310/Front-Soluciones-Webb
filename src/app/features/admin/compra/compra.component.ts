import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, startWith, switchMap } from 'rxjs';
import { AdminCompraService } from '../../../core/services/admin/admin-compra.service';
import { CompraReq } from '../../../core/models/admin/compra.models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compra.component.html'
})
export class CompraComponent implements OnInit {
  private api = inject(AdminCompraService);

  // Lista de compras
  private refresh$ = new Subject<void>();
  data$ = this.refresh$.pipe(
    startWith(void 0),
    switchMap(() => this.api.list$())
  );

  // Combos (proveedores y productos activos)
  proveedores = signal<{ id: number; nombre: string }[]>([]);
  productos   = signal<{ id: number; nombre: string }[]>([]);

  // Formulario
  idProveedor = signal<number | null>(null);
  items = signal<{ idProducto: number | null; cantidad: number | null; costoUnit: number | null; }[]>([
    { idProducto: null, cantidad: null, costoUnit: null }
  ]);
  creando = signal<boolean>(false);

  ngOnInit(): void {
    // cargar combos al inicio
    this.api.proveedoresActivos$().subscribe(p => this.proveedores.set(p));
    this.api.productosActivos$().subscribe(p => this.productos.set(p));

    // refrescar lista de compras inicial
    this.refresh$.next();
  }

  nuevo() {
    this.creando.set(true);
  }

  cancelar() {
    this.creando.set(false);
    this.idProveedor.set(null);
    this.items.set([
      { idProducto: null, cantidad: null, costoUnit: null }
    ]);
  }

  addItem() {
    const arr = this.items().slice();
    arr.push({ idProducto: null, cantidad: null, costoUnit: null });
    this.items.set(arr);
  }

  removeItem(i: number) {
    const arr = this.items().slice();
    arr.splice(i, 1);
    if (arr.length === 0) {
      arr.push({ idProducto: null, cantidad: null, costoUnit: null });
    }
    this.items.set(arr);
  }

  guardar() {
    const proveedor = this.idProveedor();
    if (!proveedor) return;

    const clean = this.items()
      .filter(it => it.idProducto && it.cantidad && it.costoUnit)
      .map(it => ({
        idProducto: Number(it.idProducto),
        cantidad: Number(it.cantidad),
        costoUnit: Number(it.costoUnit)
      }));

    if (clean.length === 0) return;

    const body: CompraReq = {
      idProveedor: Number(proveedor),
      items: clean
    };

    this.api.create$(body).subscribe(() => {
      this.cancelar();
      this.refresh$.next();
    });
  }
}
