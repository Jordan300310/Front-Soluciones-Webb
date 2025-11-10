import { PedidoProducto } from './PedidoProducto';

export interface Pedido {
  idVenta: number;
  numeroComprobante: string | null;
  fechaVenta: string;
  direccion: string;
  ciudad: string;
  pais: string;
  total: number | null;
  productos: PedidoProducto[];
}