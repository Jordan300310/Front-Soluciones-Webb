import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UbicacionService {
  // Cambiamos a tu archivo local
  private jsonUrl = 'assets/data/full.json';

  constructor(private http: HttpClient) {}

  getDepartamentos(): Observable<any[]> {
    return this.http.get<any[]>(this.jsonUrl).pipe(
      map(data => {
        // Extraemos departamentos únicos y les damos el formato que espera tu HTML
        const unique = [...new Set(data.map(item => item.departamento))];
        return unique.map((name, index) => ({ id: name, nombre: name }));
      })
    );
  }

  getProvincias(depNombre: string): Observable<any[]> {
    return this.http.get<any[]>(this.jsonUrl).pipe(
      map(data => {
        const filtered = data.filter(item => item.departamento === depNombre);
        const unique = [...new Set(filtered.map(item => item.provincia))];
        return unique.map(name => ({ id: name, nombre: name }));
      })
    );
  }

  getDistritos(provNombre: string): Observable<any[]> {
    return this.http.get<any[]>(this.jsonUrl).pipe(
      map(data => {
        const filtered = data.filter(item => item.provincia === provNombre);
        return filtered.map(item => ({
          nombre: item.distrito,
          latitud: item.latitud,
          longitud: item.longitud
        }));
      })
    );
  }
}
