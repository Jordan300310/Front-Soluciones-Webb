import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CheckoutRequest } from '../../models/venta/CheckoutRequest';
import { CheckoutResponse } from '../../models/venta/CheckoutResponse';
import { Observable } from 'rxjs';
import { ComprobanteDTO } from '../../models/venta/Comprobante.models';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private baseUrl = `${environment.api}/venta/checkout`;
  private ventaUrl = `${environment.api}/api/v1/ventas`;

  constructor(private http: HttpClient) {}

  realizarCheckout(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(this.baseUrl, request);
  }
  getVentaPorId(id: number): Observable<ComprobanteDTO> {
    return this.http.get<ComprobanteDTO>(`${this.ventaUrl}/${id}`);
  }
}
