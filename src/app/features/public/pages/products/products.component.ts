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

  constructor(private productosService: AdminProductosService, private cartStore: CartStore) {}

  ngOnInit() {
    this.productos$ = this.productosService.listPublic$();
  }

  agregarAlCarrito(producto: ProductoAdminDTO) {
    this.cartStore.agregarProducto(producto);
  }
}
