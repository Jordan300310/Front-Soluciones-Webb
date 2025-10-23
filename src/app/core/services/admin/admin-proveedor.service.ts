import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Proveedor } from '../../models/admin/proveedor.models';

@Injectable({ providedIn: 'root' })
export class AdminProveedoresService {
  private http = inject(HttpClient);
  private base = `${environment.api}/admin/proveedores`;

  list$(): Observable<Proveedor[]> { return this.http.get<Proveedor[]>(this.base); }
  get$(id: number): Observable<Proveedor> { return this.http.get<Proveedor>(`${this.base}/${id}`); }
  create$(body: any): Observable<Proveedor> { return this.http.post<Proveedor>(this.base, body); }         // body = entidad Proveedor
  update$(id: number, body: any): Observable<Proveedor> { return this.http.patch<Proveedor>(`${this.base}/${id}`, body); }
  delete$(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
