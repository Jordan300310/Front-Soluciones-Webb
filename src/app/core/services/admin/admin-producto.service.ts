import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ProductoAdminDTO } from '../../models/admin/producto.models';

@Injectable({ providedIn: 'root' })
export class AdminProductosService {
  private http = inject(HttpClient);
  private base = `${environment.api}/admin/productos`;

  list$(): Observable<ProductoAdminDTO[]> {
    return this.http.get<ProductoAdminDTO[]>(this.base);
  }
  get$(id: number): Observable<ProductoAdminDTO> {
    return this.http.get<ProductoAdminDTO>(`${this.base}/${id}`);
  }
  create$(body: any): Observable<ProductoAdminDTO> {
    return this.http.post<ProductoAdminDTO>(this.base, body);
  } 
  update$(id: number, body: any): Observable<ProductoAdminDTO> {
    return this.http.patch<ProductoAdminDTO>(`${this.base}/${id}`, body);
  }
  delete$(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  productosCombo$(): Observable<{ id: number; nombre: string }[]> {
    return this.http.get<{ id: number; nombre: string }[]>(
      `${this.base}/activos`
    );
  }
  
  
}
