import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartStore } from '../../../../core/store/cart.store';
import { AuthStore } from '../../../../core/store/auth.store';
import { CheckoutService } from '../../../../core/services/venta/checkout.service';
import { Router } from '@angular/router';
import { VentaItemRequest } from '../../../../core/models/venta/VentaItemRequest';
import { CheckoutRequest } from '../../../../core/models/venta/CheckoutRequest';

@Component({
  selector: 'app-checkout',
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
    private authStore: AuthStore,
    private fb: FormBuilder,
    private checkoutService: CheckoutService,
    private router: Router
  ) {
    // 2. Crea el formulario reactivo
    this.checkoutForm = this.fb.group({
      envio: this.fb.group({
        direccion: ['', Validators.required],
        ciudad: ['', Validators.required],
        pais: ['', Validators.required],
        codigoPostal: ['', Validators.required],
      }),
      //Pago simulado
      pago: this.fb.group({
        numeroTarjeta: ['', [Validators.required]],
        fechaExp: ['', [Validators.required]], // MM/YY
        cvc: ['', Validators.required],
      }),
    });
  }
  //[Validators.required, Validators.pattern(/^\d{3}$/)]
  ngOnInit(): void {
    //const user = this.authStore.user();
  }

  /**
   * Se ejecuta al enviar el formulario
   */
  onSubmit() {
    if (this.checkoutForm.invalid || this.cartStore.items().length === 0) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const formValues = this.checkoutForm.value.envio;

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
        this.cartStore.limpiarCarrito();

        this.router.navigate(['/compra-exitosa', response.ventaId]);
      },
      error: (err) => {
        this.errorMessage = err.error || 'Ocurrió un error al procesar el pago.';
        this.isSubmitting = false;
      },
    });
  }
}
