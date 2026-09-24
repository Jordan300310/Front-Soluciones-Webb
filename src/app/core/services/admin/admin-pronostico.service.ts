import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  EjecucionPronosticoDTO,
  EjecutarPronosticoRequest,
  PronosticoResumenDTO,
  AnalyticsRunStatus,
  AnalyticsUpdateResponse,
} from '../../models/admin/pronostico.models';

@Injectable({ providedIn: 'root' })
export class AdminPronosticoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.api}/admin/pronosticos`;

  ultimo$(): Observable<PronosticoResumenDTO> {
    return this.http.get<PronosticoResumenDTO>(this.base);
  }

  ejecuciones$(limit = 20): Observable<EjecucionPronosticoDTO[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<EjecucionPronosticoDTO[]>(`${this.base}/ejecuciones`, { params });
  }

  detalle$(idEjecucion: number): Observable<PronosticoResumenDTO> {
    return this.http.get<PronosticoResumenDTO>(`${this.base}/ejecuciones/${idEjecucion}`);
  }

  ejecutar$(
    request: EjecutarPronosticoRequest,
    idempotencyKey: string,
  ): Observable<PronosticoResumenDTO> {
    const headers = new HttpHeaders({ 'Idempotency-Key': idempotencyKey });
    return this.http.post<PronosticoResumenDTO>(`${this.base}/ejecutar`, request, { headers });
  }

  actualizarAnalitica$(force = false): Observable<AnalyticsUpdateResponse> {
    const params = new HttpParams().set('force', force);
    return this.http.post<AnalyticsUpdateResponse>(
      `${this.base}/analitica/actualizar`, null, { params },
    );
  }

  ultimaAnalitica$(): Observable<AnalyticsRunStatus> {
    return this.http.get<AnalyticsRunStatus>(`${this.base}/analitica/ultima`);
  }
}
