import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CheckoutService } from '../../../../core/services/venta/checkout.service';
import { CartStore } from '../../../../core/store/cart.store';

@Component({
    selector: 'app-checkout-success',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './checkout-success.component.html',
    styleUrl: './checkout-success.component.css',
})
export class CheckoutSuccessComponent implements OnInit {
    loading = true;
    error: string | null = null;
    paymentId: string | null = null;
    status: string | null = null;
    preferenceId: string | null = null;
    retryCount = 0;
    maxRetries = 5;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private checkoutService: CheckoutService,
        private cartStore: CartStore
    ) { }

    ngOnInit(): void {
        if (window.location.hostname.includes('ngrok')) {
            const newUrl = window.location.href.replace(window.location.host, 'localhost:4200').replace('https:', 'http:');
            window.location.href = newUrl;
            return; // Detener ejecución para que redirija
        }
        // Leer parámetros de Mercado Pago
        this.route.queryParams.subscribe((params) => {
            this.paymentId = params['payment_id'];
            this.status = params['status'];
            this.preferenceId = params['preference_id'];

            if (this.status === 'approved') {
                // Esperar un poco para que el webhook procese
                setTimeout(() => {
                    this.buscarVenta();
                }, 2000);
            } else {
                this.error = 'El pago no fue aprobado.';
                this.loading = false;
            }
        });
    }

    buscarVenta(): void {
        const checkoutPendienteId = localStorage.getItem('lastCheckoutPendienteId');

        if (!checkoutPendienteId) {
            this.error = 'No se encontró información del checkout.';
            this.loading = false;
            return;
        }

        // Intentar obtener la venta
        // Nota: Necesitamos un endpoint que busque por checkoutPendienteId
        // Por ahora, usaremos un enfoque de polling simple
        this.pollForVenta(parseInt(checkoutPendienteId));
    }

    pollForVenta(checkoutPendienteId: number): void {
        // Implementar polling con retry
        // Como no tenemos un endpoint específico para buscar por checkoutPendienteId,
        // asumiremos que el backend crea la venta con el ID secuencial
        // Esta es una simplificación - en producción necesitarías un endpoint específico

        this.retryCount++;

        if (this.retryCount > this.maxRetries) {
            this.error =
                'No se pudo obtener el comprobante. Por favor, revisa tu historial de compras.';
            this.loading = false;
            return;
        }

        // Esperar antes de reintentar
        setTimeout(() => {
            // Aquí deberías llamar a un endpoint que busque la venta por checkoutPendienteId
            // Por ahora, simplemente redirigimos después de un tiempo
            // En una implementación real, necesitarías:
            // this.checkoutService.buscarVentaPorCheckoutId(checkoutPendienteId).subscribe(...)

            // Simulación: después de algunos reintentos, asumimos que la venta fue creada
            if (this.retryCount >= 3) {
                // Limpiar carrito y datos temporales
                this.cartStore.limpiarCarrito();
                localStorage.removeItem('lastPreferenceId');
                localStorage.removeItem('lastCheckoutPendienteId');

                // Redirigir a una página de confirmación genérica
                // En producción, deberías tener el ventaId del backend
                this.router.navigate(['/perfil']); // O a historial de compras
            } else {
                this.pollForVenta(checkoutPendienteId);
            }
        }, 2000);
    }
}
