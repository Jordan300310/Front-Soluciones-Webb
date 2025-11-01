export interface ComprobanteDTO {
  ventaId: number;
  serie: string;
  numero: string;
  fechaEmision: string;
  subtotal: number;
  igv: number;
  total: number;
  clienteNombre: string;
}
