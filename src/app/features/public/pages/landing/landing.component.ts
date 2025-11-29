import { CartStore } from './../../../../core/store/cart.store';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AdminProductosService } from '../../../../core/services/admin/admin-producto.service';
import { ProductoAdminDTO } from '../../../../core/models/admin/producto.models'; 
import { RouterLink } from '@angular/router';
import { PublicService } from '../../../../core/services/public/public.service';
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  productos$!: Observable<ProductoAdminDTO[]>;
  animatingProducts: { [key: number]: boolean } = {};
  
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    private publicService: PublicService,
    private CartStore: CartStore
  ) {}

  ngOnInit() {
    this.productos$ = this.publicService.getTop5MasVendidos();
  }

  scroll(offset: number) {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollLeft += offset;
    }
  }

  agregarAlCarrito(producto: ProductoAdminDTO, event?: Event) {
    if (!producto.stock || producto.stock <= 0) {
      alert('Este producto no tiene stock disponible.');
      return;
    }

    this.CartStore.agregarProducto(producto);
    if (event && event.currentTarget) {
      const btn = event.currentTarget as HTMLElement;
      btn.classList.add('animating');
      setTimeout(() => btn.classList.remove('animating'), 600);
      return;
    }

    this.animatingProducts[producto.id!] = true;
    setTimeout(() => {
      this.animatingProducts[producto.id!] = false;
    }, 600);
  }
}