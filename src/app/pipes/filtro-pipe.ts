import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FiltroPipe implements PipeTransform {
  transform(productos: any[], filtro: string): any[] {
    if (!productos) return [];
    if (!filtro) return productos;

    const filtroLower = filtro.toLowerCase();

    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(filtroLower) ||
        p.descripcion?.toLowerCase().includes(filtroLower)
    );
  }
}
