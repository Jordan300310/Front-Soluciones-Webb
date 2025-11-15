import { CartStore } from './../../../../core/store/cart.store';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdminProductosService } from '../../../../core/services/admin/admin-producto.service';
import { ProductoAdminDTO } from '../../../../core/models/admin/producto.models';
import { FiltroPipe } from '../../../../pipes/filtro-pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, FiltroPipe, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  productos$!: Observable<ProductoAdminDTO[]>;
  animatingProducts: { [key: number]: boolean } = {};
  filtro: string = '';

  constructor(private productosService: AdminProductosService, private CartStore: CartStore) {}

  ngOnInit() {
    this.productos$ = this.productosService.listPublic$();
  }
  agregarAlCarrito(producto: ProductoAdminDTO, event?: Event) {
    this.CartStore.agregarProducto(producto);

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
