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
  lat = -12.0464;
  lng = -77.0428;
  errorMessage: string | null = null;
  isSubmitting = false;
  userEmail = 'jordan.estudiante@upn.pe';

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
      departamento: ['', Validators.required],
      ciudad: ['', Validators.required],
      distrito: ['', Validators.required],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      referencia: ['', Validators.required],
      pais: ['Perú', Validators.required],
      codigoPostal: ['', [Validators.required, Validators.pattern('^[0-9]{5,6}$')]],
      emailOption: ['principal'],
      emailAlternativo: ['', Validators.email]
    });

    this.checkoutForm.get('emailOption')?.valueChanges.subscribe(v => {
      const c = this.checkoutForm.get('emailAlternativo');
      v === 'otro' ? c?.setValidators([Validators.required, Validators.email]) : c?.clearValidators();
      c?.updateValueAndValidity();
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
    if (!this.cartStore.items().length) this.router.navigate(['/']);

    this.ubicacionService.getDepartamentos().subscribe(d => {
      this.departamentos = d;
      this.cdr.detectChanges();
    });

    this.mainMarker.on('dragend', () => {
      const p = this.mainMarker.getLatLng();
      this.lat = p.lat;
      this.lng = p.lng;
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

  onDepartamentoChange(e: any) {
    const id = e.target.value;
    this.provincias = [];
    this.distritos = [];
    this.checkoutForm.patchValue({ ciudad: '', distrito: '' });

    if (id) {
      this.ubicacionService.getProvincias(id).subscribe(d => {
        this.provincias = d;
        this.cdr.detectChanges();
      });
    }
  }

  onProvinciaChange(e: any) {
    const id = e.target.value;
    this.distritos = [];
    this.checkoutForm.patchValue({ distrito: '' });

    if (id) {
      this.ubicacionService.getDistritos(id).subscribe(d => {
        this.distritos = d;
        this.cdr.detectChanges();
      });
    }
  }

  onDistritoChange(e: any) {
    const distrito = e.target.options[e.target.selectedIndex].text;
    const provincia = this.provincias.find(p => p.id === this.checkoutForm.get('ciudad')?.value)?.nombre;
    const departamento = this.departamentos.find(d => d.id === this.checkoutForm.get('departamento')?.value)?.nombre;

    if (distrito && provincia) {
      const q = `${distrito}, ${provincia}, ${departamento}, Peru`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;

      this.http.get<any[]>(url).subscribe(r => {
        if (r?.length) {
          this.lat = +r[0].lat;
          this.lng = +r[0].lon;
          this.map.flyTo([this.lat, this.lng], 16);
          this.mainMarker.setLatLng([this.lat, this.lng]);
          this.cdr.detectChanges();
        }
      });
    }
  }

  onMouseMove(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const mx = (x - r.width / 2) / 25;
    const my = (y - r.height / 2) / 25;
    el.style.transform = `translate(${mx}px, ${my}px) scale(1.02)`;
  }

  onMouseLeave(e: MouseEvent) {
    (e.currentTarget as HTMLElement).style.transform = '';
  }

  onSubmit() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.errorMessage = 'Completa los campos requeridos';
      return;
    }

    this.isSubmitting = true;
    const v = this.checkoutForm.value;

    const dep = this.departamentos.find(d => d.id === v.departamento)?.nombre || '';
    const prov = this.provincias.find(p => p.id === v.ciudad)?.nombre || '';
    const email = v.emailOption === 'principal' ? this.userEmail : v.emailAlternativo;

    const req: CheckoutRequest = {
      items: this.cartStore.items().map(i => ({ productoId: i.producto.id, cantidad: i.cantidad })),
      pais: v.pais,
      departamento: dep,
      ciudad: prov,
      distrito: v.distrito,
      direccion: v.direccion,
      referencia: v.referencia,
      latitud: this.lat,
      longitud: this.lng,
      codigoPostal: v.codigoPostal,
      emailEnvioComprobante: email
    };

    this.checkoutService.realizarCheckout(req).subscribe({
      next: r => r.checkoutUrl && (window.location.href = r.checkoutUrl),
      error: () => {
        this.errorMessage = 'Error al procesar pago';
        this.isSubmitting = false;
      }
    });
  }
}
