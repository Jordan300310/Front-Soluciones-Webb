import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { PerfilResponse } from '../../models/perfil/PerfilResponse';
import { PerfilUpdateRequest } from '../../models/perfil/PerfilUpdateRequest';
import { ChangePasswordRequest } from '../../models/perfil/ChangePasswordRequest';
import { Pedido } from '../../models/perfil/Pedido';
import { Reembolso } from '../../models/perfil/Reembolso';
import { SolicitudReembolso } from '../../models/perfil/SolicitudReembolso';
@Injectable({ providedIn: 'root' })
export class PerfilService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = `${environment.api}/perfil`;

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    if (!token) return new HttpHeaders();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getPerfil(): Observable<PerfilResponse> {
    return this.http.get<PerfilResponse>(this.base, {
      headers: this.authHeaders(),
    });
  }

  updatePerfil(body: PerfilUpdateRequest): Observable<PerfilResponse> {
    return this.http.put<PerfilResponse>(this.base, body, {
      headers: this.authHeaders(),
    });
  }

  changePassword(body: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/cambiar-password`, body, {
      headers: this.authHeaders(),
    });
  }
  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.base}/pedidos`, {
      headers: this.authHeaders(),
    });
  }

  solicitarReembolso(body: SolicitudReembolso): Observable<Reembolso> {
    return this.http.post<Reembolso>(`${environment.api}/api/v1/reembolsos/solicitar`, body, {
      headers: this.authHeaders(),
    });
  }

  getMisSolicitudes(): Observable<Reembolso[]> {
    return this.http.get<Reembolso[]>(`${environment.api}/api/v1/reembolsos/mis-solicitudes`, {
      headers: this.authHeaders(),
    });
  }
}
