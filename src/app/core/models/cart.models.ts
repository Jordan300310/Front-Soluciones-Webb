import { ProductoAdminDTO } from './admin/producto.models';
export interface CartItem {
  producto: ProductoAdminDTO;
  cantidad: number;
}
