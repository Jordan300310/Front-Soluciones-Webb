import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ClienteAdminDTO, UpdateClienteRequest } from '../../models/admin/cliente.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminClientesService {
  private http = inject(HttpClient);
  private base = `${environment.api}/admin/clientes`;

  list$(): Observable<ClienteAdminDTO[]> { return this.http.get<ClienteAdminDTO[]>(this.base); }
  get$(id: number): Observable<ClienteAdminDTO> { return this.http.get<ClienteAdminDTO>(`${this.base}/${id}`); }
  update$(id: number, body: UpdateClienteRequest): Observable<ClienteAdminDTO> { return this.http.patch<ClienteAdminDTO>(`${this.base}/${id}`, body); }
  delete$(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}