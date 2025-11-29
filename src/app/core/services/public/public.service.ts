import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ProductoAdminDTO } from '../../models/admin/producto.models';
@Injectable({ providedIn: 'root' })
export class PublicService {
  private http = inject(HttpClient);
  private base = `${environment.api}/publico/productos`;

  listPublic$(): Observable<ProductoAdminDTO[]> {
    return this.http.get<ProductoAdminDTO[]>(this.base);
  }

  getTop5MasVendidos(): Observable<ProductoAdminDTO[]> {
    return this.http.get<ProductoAdminDTO[]>(`${this.base}/top5masvendidos`);
}
filtrarProductos(filtros: any): Observable<ProductoAdminDTO[]> {
    let params = new HttpParams();

    if (filtros.texto) params = params.set('texto', filtros.texto);
    if (filtros.min !== null) params = params.set('min', filtros.min.toString());
    if (filtros.max !== null) params = params.set('max', filtros.max.toString());
    if (filtros.marcas && filtros.marcas.length > 0) {
        params = params.set('marcas', filtros.marcas.join(','));
    }
    
    if (filtros.categorias && filtros.categorias.length > 0) {
        params = params.set('categorias', filtros.categorias.join(','));
    }

    return this.http.get<ProductoAdminDTO[]>(`${this.base}/filtrar`, { params });
}



}