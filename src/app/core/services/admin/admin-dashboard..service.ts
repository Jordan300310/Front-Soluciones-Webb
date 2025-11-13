import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TopProducto {
  productoId: number;
  nombre: string;
  cantidadVendida: number;
  totalVenta: number;
}

export interface DashboardResponse {
  // El backend puede omitir campos o devolver null, así que los marcamos opcionales
  ventasMes?: number | null;
  gananciasMes?: number | null;
  topProductos?: TopProducto[] | null;
}

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  // Usar URL completa del backend para evitar que el dev-server (localhost:4200)
  // sirva index.html en rutas no encontradas y devuelva HTML en vez de JSON.
  private base = `${environment.api}/admin/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los datos del dashboard principal para el empleado.
   * El backend requiere Authorization: Bearer <token> (manejado por interceptor JWT si está presente).
   */
  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.base);
  }
}
