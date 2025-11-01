import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ComprobanteDTO } from '../../../../core/models/venta/Comprobante.models';
import { CheckoutService } from '../../../../core/services/venta/checkout.service';

@Component({
  selector: 'app-compra-exitosa',
  imports: [CommonModule, RouterLink],
  templateUrl: './compra-exitosa.component.html',
  styleUrl: './compra-exitosa.component.css',
})
export class CompraExitosaComponent implements OnInit {
  venta$!: Observable<ComprobanteDTO>;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private checkoutService: CheckoutService) {}

  ngOnInit(): void {
    const ventaId = this.route.snapshot.paramMap.get('id');

    if (ventaId) {
      this.venta$ = this.checkoutService.getVentaPorId(Number(ventaId));
    } else {
      this.error = 'No se proporcionó un ID de venta.';
    }
  }
}
