import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdminProductosService } from '../../../../core/services/admin/admin-producto.service';
import { ProductoAdminDTO } from '../../../../core/models/admin/producto.models';
import { FiltroPipe } from '../../../../pipes/filtro-pipe';
import { CartStore } from '../../../../core/store/cart.store';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, FiltroPipe],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  productos$!: Observable<ProductoAdminDTO[]>;
  filtro: string = '';
  animatingProducts: { [key: number]: boolean } = {};

  constructor(
    private productosService: AdminProductosService,
    private cartStore: CartStore
  ) {}

  ngOnInit() {
    this.productos$ = this.productosService.listPublic$();
  }

  agregarAlCarrito(producto: ProductoAdminDTO, event?: Event) {
    if (!producto.stock || producto.stock <= 0) {
      alert('Este producto no tiene stock disponible.');
      return;
    }

    this.cartStore.agregarProducto(producto);

    if (event && event.currentTarget) {
      const btn = event.currentTarget as HTMLElement;
      btn.classList.add('animating');
      setTimeout(() => btn.classList.remove('animating'), 600);
      return;
    }

    this.animatingProducts[producto.id] = true;
    setTimeout(() => {
      this.animatingProducts[producto.id] = false;
    }, 600);
  }
}
