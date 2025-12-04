import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Reembolso } from '../../models/perfil/Reembolso';
import { ProcesarReembolsoRequest } from '../../models/admin/ProcesarReembolsoRequest';

@Injectable({ providedIn: 'root' })
export class AdminReembolsoService {
    private http = inject(HttpClient);
    private auth = inject(AuthService);
    private base = `${environment.api}/api/v1/reembolsos`;

    private authHeaders(): HttpHeaders {
        const token = this.auth.getToken();
        if (!token) return new HttpHeaders();
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    /**
     * Obtiene todas las solicitudes de reembolso (cualquier estado)
     */
    getReembolsos(): Observable<Reembolso[]> {
        return this.http.get<Reembolso[]>(this.base, {
            headers: this.authHeaders(),
        });
    }

    /**
     * Obtiene todas las solicitudes de reembolso pendientes
     */
    getReembolsosPendientes(): Observable<Reembolso[]> {
        return this.http.get<Reembolso[]>(`${this.base}/pendientes`, {
            headers: this.authHeaders(),
        });
    }

    /**
     * Procesa una solicitud de reembolso (aprobar o rechazar)
     */
    procesarReembolso(id: number, request: ProcesarReembolsoRequest): Observable<Reembolso> {
        return this.http.put<Reembolso>(`${this.base}/${id}/procesar`, request, {
            headers: this.authHeaders(),
        });
    }
}
