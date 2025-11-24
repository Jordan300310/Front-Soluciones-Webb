import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartStore } from '../../../../core/store/cart.store';
import { CheckoutService } from '../../../../core/services/venta/checkout.service';
import { Router } from '@angular/router';
import { VentaItemRequest } from '../../../../core/models/venta/VentaItemRequest';
import { CheckoutRequest } from '../../../../core/models/venta/CheckoutRequest';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  errorMessage: string | null = null;
  isSubmitting = false;

  constructor(
    public cartStore: CartStore,
    private fb: FormBuilder,
    private checkoutService: CheckoutService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      ciudad: ['', [Validators.required]],
      pais: ['', [Validators.required]],
      codigoPostal: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
    });
  }

  ngOnInit(): void { }

  // --- GETTERS para acceso fácil en el HTML ---
  get formCtrl() {
    return this.checkoutForm.controls;
  }

  onSubmit() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos requeridos correctamente.';
      return;
    }

    if (this.cartStore.items().length === 0) {
      this.errorMessage = 'Tu carrito está vacío.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const formValues = this.checkoutForm.value;

    const itemsRequest: VentaItemRequest[] = this.cartStore.items().map((item) => ({
      productoId: item.producto.id,
      cantidad: item.cantidad,
    }));

    const request: CheckoutRequest = {
      items: itemsRequest,
      direccion: formValues.direccion,
      ciudad: formValues.ciudad,
      pais: formValues.pais,
      codigoPostal: formValues.codigoPostal,
    };

    this.checkoutService.realizarCheckout(request).subscribe({
      next: (response) => {
        // Guardar datos para recuperar después del pago
        localStorage.setItem('lastPreferenceId', response.preferenceId);
        localStorage.setItem('lastCheckoutPendienteId', response.checkoutPendienteId.toString());

        // Redirigir a Mercado Pago
        window.location.href = response.initPoint;
      },
      error: (err) => {
        this.errorMessage =
          err.error?.message || err.error || 'Ocurrió un error al procesar el pago.';
        this.isSubmitting = false;
      },
    });
  }
}
