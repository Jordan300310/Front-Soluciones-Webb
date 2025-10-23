export interface CompraListDTO {
  idCompra: number;
  idProveedor: number;
  proveedor: string | null;
  fecha: string;          
  subtotal: number;
  igv: number;
  total: number;
  productos: string;
}

export interface CompraCreatedDTO {
  idCompra: number;
  subtotal: number;
  igv: number;
  total: number;
}


export interface CompraItemReq { idProducto: number; cantidad: number; costoUnit: number; }
export interface CompraReq { idProveedor: number; items: CompraItemReq[]; }