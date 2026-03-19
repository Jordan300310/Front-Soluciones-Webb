import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartStore } from '../../../../core/store/cart.store';
import { CheckoutService } from '../../../../core/services/venta/checkout.service';
import { ComprobanteDTO } from '../../../../core/models/venta/Comprobante.models';
import { Subscription, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.css',
})
export class CheckoutSuccessComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;
  sessionId: string | null = null;
  comprobante?: ComprobanteDTO;

  retryCount = 0;
  maxRetries = 10;
  private timerSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartStore: CartStore,
    private checkoutService: CheckoutService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (window.location.hostname.includes('ngrok')) {
      const newUrl = window.location.href.replace(window.location.host, 'localhost:4200').replace('https:', 'http:');
      window.location.href = newUrl;
      return;
    }

    this.route.queryParams.subscribe((params) => {
      this.sessionId = params['session_id'];
      if (this.sessionId) {
        this.iniciarProcesoFinal();
      } else {
        this.error = 'No se encontró una sesión de pago válida.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  iniciarProcesoFinal(): void {
    this.cartStore.limpiarCarrito();

    this.timerSubscription = interval(200)
      .pipe(takeWhile(() => this.retryCount < this.maxRetries))
      .subscribe({
        next: () => {
          this.retryCount++;
          this.cdr.detectChanges();
        },
        complete: () => this.cargarBoleta()
      });
  }

  cargarBoleta(): void {
    if (!this.sessionId) return;

    this.checkoutService.getResumenPorSessionId(this.sessionId).subscribe({
      next: (res) => {
        console.log('Respuesta recibida:', res);
        this.comprobante = res;
        this.loading = false;

        this.cdr.detectChanges();

        localStorage.removeItem('lastCheckoutPendienteId');
        localStorage.removeItem('stripeSessionId');
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = 'Pago confirmado. Si la boleta no aparece, refresca la página.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
