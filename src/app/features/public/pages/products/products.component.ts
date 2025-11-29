import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoAdminDTO } from '../../../../core/models/admin/producto.models';
import { CartStore } from '../../../../core/store/cart.store';
import { PublicService } from '../../../../core/services/public/public.service';
import { Subject, takeUntil, debounceTime, switchMap } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit, OnDestroy {
  
  productosFiltrados: ProductoAdminDTO[] = [];

  filtroTexto: string = '';
  marcas: string[] = [];
  categorias: string[] = [];
  
  marcasSeleccionadas: { [key: string]: boolean } = {};
  categoriasSeleccionadas: { [key: string]: boolean } = {};
  
  precioMax: number = 1000;
  maxPrecioGlobal: number = 1000;

  loading: boolean = true;
  animatingProducts: { [key: number]: boolean } = {};

  private filtroSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private publicService: PublicService,
    private cartStore: CartStore,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.cargarDatosIniciales();
    this.configurarFiltros();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDatosIniciales() {
    this.loading = true;
    this.publicService.listPublic$().subscribe({
      next: (data) => {
        this.productosFiltrados = data;
        this.extraerFiltrosParaSidebar(data);
        
        this.loading = false; 
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  extraerFiltrosParaSidebar(productos: ProductoAdminDTO[]) {
    const marcasSet = new Set<string>();
    const categoriasSet = new Set<string>();
    let mayorPrecio = 0;

    productos.forEach(p => {
      if (p.marca) marcasSet.add(p.marca);
      if (p.categoria) categoriasSet.add(p.categoria);
      if (p.precio > mayorPrecio) mayorPrecio = p.precio;
    });

    this.marcas = Array.from(marcasSet).sort();
    this.categorias = Array.from(categoriasSet).sort();
    
    if (mayorPrecio > 0) {
        this.maxPrecioGlobal = Math.ceil(mayorPrecio);
        this.precioMax = this.maxPrecioGlobal;
    }
  }

  configurarFiltros() {
    this.filtroSubject.pipe(
      debounceTime(400),
      switchMap(() => {
        this.loading = true;
        this.cdr.detectChanges();

        const marcasArray = Object.keys(this.marcasSeleccionadas).filter(k => this.marcasSeleccionadas[k]);
        const catArray = Object.keys(this.categoriasSeleccionadas).filter(k => this.categoriasSeleccionadas[k]);
        
        const filtros = {
            texto: this.filtroTexto,
            marcas: marcasArray,
            categorias: catArray,
            min: 0, 
            max: this.precioMax
        };

        return this.publicService.filtrarProductos(filtros);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.productosFiltrados = data;
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  aplicarFiltros() {
    this.filtroSubject.next();
  }

  cambioMarca(marca: string, isChecked: boolean) {
    this.marcasSeleccionadas[marca] = isChecked;
    this.aplicarFiltros();
  }

  cambioCategoria(cat: string, isChecked: boolean) {
    this.categoriasSeleccionadas[cat] = isChecked;
    this.aplicarFiltros();
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
  recargarTodo() {
    this.filtroTexto = '';
    this.marcasSeleccionadas = {};     
    this.categoriasSeleccionadas = {};
  
    this.cargarDatosIniciales();
    this.cdr.detectChanges();
  }
}