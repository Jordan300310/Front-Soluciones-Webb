import { Component } from '@angular/core';
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
export class LandingComponent {
  productos$!: Observable<ProductoAdminDTO[]>;
  filtro: string = '';

  constructor(private productosService: AdminProductosService) {}

  ngOnInit() {
    this.productos$ = this.productosService.listPublic$();
  }
}
