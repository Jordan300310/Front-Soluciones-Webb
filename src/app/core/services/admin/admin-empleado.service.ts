import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { EmpleadoAdminDTO, CrearEmpleadoRequest, UpdateEmpleadoRequest } from '../../models/admin/empleado.models';

@Injectable({ providedIn: 'root' })
export class AdminEmpleadosService {
  private http = inject(HttpClient);
  private base = `${environment.api}/admin/empleados`;

  list$(): Observable<EmpleadoAdminDTO[]> { return this.http.get<EmpleadoAdminDTO[]>(this.base); }
  get$(id: number): Observable<EmpleadoAdminDTO> { return this.http.get<EmpleadoAdminDTO>(`${this.base}/${id}`); }
  create$(body: CrearEmpleadoRequest): Observable<EmpleadoAdminDTO> { return this.http.post<EmpleadoAdminDTO>(this.base, body); }
  update$(id: number, body: UpdateEmpleadoRequest): Observable<EmpleadoAdminDTO> { return this.http.patch<EmpleadoAdminDTO>(`${this.base}/${id}`, body); }
  delete$(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
