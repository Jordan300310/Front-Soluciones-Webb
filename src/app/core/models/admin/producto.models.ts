export interface ProductoAdminDTO {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  marca: string | null;
  categoria: string | null;
  idProveedor: number | null;
  proveedorNombre: string | null;
  imagenUrl: string | null;
  estado: boolean | null;
}
