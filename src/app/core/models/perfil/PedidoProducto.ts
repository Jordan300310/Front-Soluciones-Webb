export interface PedidoProducto {
  nombreProducto: string;
  imagenUrl: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}