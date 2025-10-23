import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { CompraListDTO, CompraCreatedDTO, CompraReq } from '../../models/admin/compra.models';

@Injectable({ providedIn: 'root' })
export class AdminCompraService {
  private http = inject(HttpClient);
  private base = `${environment.api}/admin/compras`;

  list$(): Observable<CompraListDTO[]> { return this.http.get<CompraListDTO[]>(this.base); }
  create$(body: CompraReq): Observable<CompraCreatedDTO> { return this.http.post<CompraCreatedDTO>(this.base, body); }
}