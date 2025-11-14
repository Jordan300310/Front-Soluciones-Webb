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
      envio: this.fb.group({
        direccion: ['', [Validators.required, Validators.minLength(5)]],
        ciudad: ['', [Validators.required]],
        pais: ['', [Validators.required]],
        codigoPostal: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      }),
      pago: this.fb.group({
        numeroTarjeta: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
        fechaExp: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\\/([0-9]{2})$')]],
        cvc: ['', [Validators.required, Validators.pattern('^[0-9]{3}$')]],
      }),
    });
  }

  ngOnInit(): void {}

  // --- GETTERS para acceso fácil en el HTML ---
  get envio() {
    return this.checkoutForm.get('envio') as FormGroup;
  }

  get pago() {
    return this.checkoutForm.get('pago') as FormGroup;
  }

  get envioCtrl() {
    return this.envio.controls;
  }

  get pagoCtrl() {
    return this.pago.controls;
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
        this.errorMessage =
          err.error?.message || err.error || 'Ocurrió un error al procesar el pago.';
        this.isSubmitting = false;
      },
    });
  }

  private formatFecha(value: string, strict = false): { digits: string; formatted: string } {
    let digits = (value || '').replace(/\D/g, '').slice(0, 4);

    if (digits.length === 0) {
      return { digits: '', formatted: '' };
    }

    if (digits.length === 1 && strict) {
      const month = parseInt(digits, 10);
      if (month > 0 && month < 10) {
        digits = '0' + month;
      }
    } else if (digits.length === 2) {
      let month = parseInt(digits, 10);

      if (isNaN(month) || month <= 0) {
        month = 1; // "00" -> "01"
      } else if (month > 12) {
        month = 12; // "13" -> "12"
      }
      digits = (month < 10 ? '0' + month : String(month)) + digits.slice(2);
    }

    let formatted = digits;
    if (formatted.length > 2) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    }

    return { digits, formatted };
  }

  onFechaExpInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const raw = input.value || '';
    const selectionStart = input.selectionStart ?? raw.length;

    const digitsBefore = raw.slice(0, selectionStart).replace(/\D/g, '').length;

    const { formatted } = this.formatFecha(raw, false);

    let newCaret = 0;
    let seen = 0;
    while (newCaret < formatted.length && seen < digitsBefore) {
      if (/\d/.test(formatted[newCaret])) {
        seen++;
      }
      newCaret++;
    }

    if (raw.replace(/\D/g, '').length === 2 && formatted.length === 5 && newCaret === 2) {
      newCaret = 3;
    }

    this.pagoCtrl['fechaExp'].setValue(formatted, { emitEvent: false });

    setTimeout(() => {
      try {
        input.setSelectionRange(newCaret, newCaret);
      } catch (e) {}
    }, 0);
  }

  onFechaExpBlur(event: FocusEvent) {
    const input = event.target as HTMLInputElement;

    const { formatted } = this.formatFecha(input.value, true);

    this.pagoCtrl['fechaExp'].setValue(formatted, { emitEvent: false });
  }
}
