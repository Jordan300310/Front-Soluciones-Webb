export interface CheckoutResponse {
  ventaId: number;
  serieComprobante: string;
  numeroComprobante: string;
  fechaEmision: string;
  total: number;
}
