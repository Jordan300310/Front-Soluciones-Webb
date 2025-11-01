import { CartStore } from './../../../../core/store/cart.store';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  constructor(public CartStore: CartStore, private router: Router) {}

  eliminar(productoId: number) {
    this.CartStore.eliminarProducto(productoId);
  }
  irAPagar() {
    this.router.navigate(['/checkout']);
  }
}
