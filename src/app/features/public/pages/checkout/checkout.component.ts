import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { CartStore } from '../../../../core/store/cart.store';
import { CheckoutService } from '../../../../core/services/venta/checkout.service';
import { UbicacionService } from '../../../../core/services/venta/ubicacion.service';
import { CheckoutRequest } from '../../../../core/models/venta/CheckoutRequest';
import { LeafletModule } from '@bluehalo/ngx-leaflet';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LeafletModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  lat: number = -12.0464;
  lng: number = -77.0428;
  errorMessage: string | null = null;
  isSubmitting = false;
  userEmail: string = 'jordan.estudiante@upn.pe';

  departamentos: any[] = [];
  provincias: any[] = [];
  distritos: any[] = [];

  private map!: L.Map;

  constructor(
    public cartStore: CartStore,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private checkoutService: CheckoutService,
    private ubicacionService: UbicacionService,
    private http: HttpClient,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      departamento: ['', [Validators.required]],
      ciudad: ['', [Validators.required]], // Representa Provincia
      distrito: ['', [Validators.required]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      referencia: ['', [Validators.required]],
      pais: ['Perú', [Validators.required]],
      codigoPostal: ['', [Validators.required, Validators.pattern('^[0-9]{5,6}$')]],
      emailOption: ['principal'],
      emailAlternativo: ['', [Validators.email]]
    });

    // Validación dinámica del email alternativo
    this.checkoutForm.get('emailOption')?.valueChanges.subscribe(value => {
      const emailAltControl = this.checkoutForm.get('emailAlternativo');
      if (value === 'otro') {
        emailAltControl?.setValidators([Validators.required, Validators.email]);
      } else {
        emailAltControl?.clearValidators();
      }
      emailAltControl?.updateValueAndValidity();
    });
  }

  options: L.MapOptions = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      })
    ],
    zoom: 13,
    center: L.latLng(this.lat, this.lng)
  };

  mainMarker: L.Marker = L.marker([this.lat, this.lng], {
    draggable: true,
    icon: L.icon({
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
    })
  });

  ngOnInit(): void {
    if (this.cartStore.items().length === 0) {
      this.router.navigate(['/']);
    }

    this.ubicacionService.getDepartamentos().subscribe(data => {
      this.departamentos = data;
      this.cdr.detectChanges();
    });

    this.mainMarker.on('dragend', () => {
      const position = this.mainMarker.getLatLng();
      this.lat = position.lat;
      this.lng = position.lng;
      this.cdr.detectChanges();
    });
  }

  onMapReady(map: L.Map) {
    this.map = map;
    this.mainMarker.addTo(this.map);
  }

  get formCtrl() {
    return this.checkoutForm.controls;
  }

  onDepartamentoChange(event: any) {
    const depId = event.target.value;
    this.provincias = [];
    this.distritos = [];
    this.checkoutForm.patchValue({ ciudad: '', distrito: '' });

    if (depId) {
      this.ubicacionService.getProvincias(depId).subscribe(data => {
        this.provincias = data;
        this.cdr.detectChanges();
      });
    }
  }

  onProvinciaChange(event: any) {
    const provId = event.target.value;
    this.distritos = [];
    this.checkoutForm.patchValue({ distrito: '' });

    if (provId) {
      this.ubicacionService.getDistritos(provId).subscribe(data => {
        this.distritos = data;
        this.cdr.detectChanges();
      });
    }
  }

  onDistritoChange(event: any) {
    const distritoNombre = event.target.options[event.target.selectedIndex].text;
    const provinciaNombre = this.provincias.find(p => p.id === this.checkoutForm.get('ciudad')?.value)?.nombre;
    const departamentoNombre = this.departamentos.find(d => d.id === this.checkoutForm.get('departamento')?.value)?.nombre;

    if (distritoNombre && provinciaNombre) {
      const query = `${distritoNombre}, ${provinciaNombre}, ${departamentoNombre}, Peru`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

      this.http.get<any[]>(url).subscribe(res => {
        if (res && res.length > 0) {
          this.lat = parseFloat(res[0].lat);
          this.lng = parseFloat(res[0].lon);
          this.map.flyTo([this.lat, this.lng], 16);
          this.mainMarker.setLatLng([this.lat, this.lng]);
          this.cdr.detectChanges();
        }
      });
    }
  }

  onSubmit() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    this.isSubmitting = true;
    const formValues = this.checkoutForm.value;

    const depNombre = this.departamentos.find(d => d.id === formValues.departamento)?.nombre || '';
    const provNombre = this.provincias.find(p => p.id === formValues.ciudad)?.nombre || '';
    const emailFinal = formValues.emailOption === 'principal' ? this.userEmail : formValues.emailAlternativo;

    const request: CheckoutRequest = {
      items: this.cartStore.items().map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad
      })),
      pais: formValues.pais,
      departamento: depNombre,
      ciudad: provNombre,
      distrito: formValues.distrito,
      direccion: formValues.direccion,
      referencia: formValues.referencia,
      latitud: this.lat,
      longitud: this.lng,
      codigoPostal: formValues.codigoPostal,
      emailEnvioComprobante: emailFinal
    };

    this.checkoutService.realizarCheckout(request).subscribe({
      next: (response) => {
        if (response.checkoutUrl) {
          window.location.href = response.checkoutUrl;
        }
      },
      error: (err) => {
        this.errorMessage = 'Error al procesar el pago.';
        this.isSubmitting = false;
      }
    });
  }
}
