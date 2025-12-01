import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface VentaDiaria {
  fecha: string;
  total: number;
}

export interface VentaCategoria {
  categoria: string;
  totalVenta: number;
}

export interface ProductoResumen {
  id: number;
  nombre: string;
  stock: number;
  precio: number;
}

export interface TopProducto {
  productoId: number;
  nombre: string;
  cantidadVendida: number;
  totalVenta: number;
}

export interface DashboardResponse {
  ventasMes?: number | null;
  gananciasMes?: number | null;
  topProductos?: TopProducto[] | null;
  ventasPorPeriodo?: VentaDiaria[] | null; // Renombrado acorde al backend
  ventasPorCategoria?: VentaCategoria[] | null;
  productosBajoStock?: ProductoResumen[] | null;
  productosSinVentas?: ProductoResumen[] | null;
}

interface GraphQlResponse {
  data: {
    adminDashboard: DashboardResponse;
    detalleCategoria?: TopProducto[]; 
  };
  errors?: any[];
}

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private graphqlUrl = `${environment.api}/graphql`;

  constructor(private http: HttpClient) {}

  // Acepta parámetros opcionales
  getDashboard(fechaInicio?: string, fechaFin?: string): Observable<DashboardResponse> {
    const query = `
      query($fi: String, $ff: String) {
        adminDashboard(fechaInicio: $fi, fechaFin: $ff) {
          ventasMes
          gananciasMes
          topProductos {
            nombre
            cantidadVendida
            totalVenta
          }
          ventasPorPeriodo {
            fecha
            total
          }
          ventasPorCategoria {
            categoria
            totalVenta
          }
          productosBajoStock {
            id
            nombre
            stock
            precio
          }
          productosSinVentas {
            id
            nombre
            stock
            precio
          }
        }
      }
    `;

    return this.http
      .post<GraphQlResponse>(this.graphqlUrl, { 
        query,
        variables: { fi: fechaInicio, ff: fechaFin } // Enviamos variables
      })
      .pipe(
        map((response) => {
          if (response.errors) {
            throw new Error('Error en GraphQL: ' + JSON.stringify(response.errors));
          }
          return response.data.adminDashboard;
        })
      );
  }

  getDetalleCategoria(categoria: string, fechaInicio?: string, fechaFin?: string): Observable<TopProducto[]> {
    const query = `
      query($cat: String!, $fi: String, $ff: String) {
        detalleCategoria(categoria: $cat, fechaInicio: $fi, fechaFin: $ff) {
          nombre
          cantidadVendida
          totalVenta
        }
      }
    `;

    return this.http
      .post<GraphQlResponse>(this.graphqlUrl, {
        query,
        variables: { cat: categoria, fi: fechaInicio, ff: fechaFin } 
      })
      .pipe(
        map((response) => {
          if (response.errors) {
            throw new Error('Error en GraphQL: ' + JSON.stringify(response.errors));
          }
          return response.data.detalleCategoria || [];
        })
      );
  }
}