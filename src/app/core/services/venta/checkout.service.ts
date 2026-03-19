import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { CheckoutRequest } from '../../models/venta/CheckoutRequest';
import { CheckoutResponse } from '../../models/venta/CheckoutResponse';
import { ComprobanteDTO } from '../../models/venta/Comprobante.models';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private checkoutUrl = `${environment.api}/api/v1/checkout`;

  constructor(private http: HttpClient) {}

  realizarCheckout(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(this.checkoutUrl, request);
  }

  getResumenPorSessionId(sessionId: string): Observable<ComprobanteDTO> {
    return this.http.get<ComprobanteDTO>(`${this.checkoutUrl}/resumen-session/${sessionId}`);
  }

  getResumenVenta(ventaId: number): Observable<ComprobanteDTO> {
    return this.http.get<ComprobanteDTO>(`${this.checkoutUrl}/resumen/${ventaId}`);
  }

  getVentaPorId(id: number): Observable<ComprobanteDTO> {
    return this.http.get<ComprobanteDTO>(`${environment.api}/api/v1/ventas/${id}`);
  }
}
