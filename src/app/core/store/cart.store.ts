import { computed, effect, Injectable, signal } from '@angular/core';
import { CartItem } from '../models/cart.models';
import { ProductoAdminDTO } from '../models/admin/producto.models';

const CART_STORAGE_KEY = 'mi_carrito';

@Injectable({
  providedIn: 'root',
})
export class CartStore {
  readonly items = signal<CartItem[]>(this.loadCartFromStorage());

  readonly subtotal = computed(() => {
    return this.items().reduce((acc, item) => {
      return acc + item.producto.precio * item.cantidad;
    }, 0);
  });

  readonly totalItems = computed(() => {
    return this.items().reduce((acc, item) => acc + item.cantidad, 0);
  });

  private storageEffect = effect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items()));
  });

  private loadCartFromStorage(): CartItem[] {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
  }

  agregarProducto(producto: ProductoAdminDTO) {
    const itemExistente = this.items().find((item) => item.producto.id === producto.id);
    if (itemExistente) {
      this.items.set(
        this.items().map((item) =>
          item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      );
    } else {
      this.items.set([...this.items(), { producto: producto, cantidad: 1 }]);
    }
  }

  eliminarProducto(productoId: number) {
    this.items.set(this.items().filter((item) => item.producto.id !== productoId));
  }

  limpiarCarrito() {
    this.items.set([]);
  }
}
