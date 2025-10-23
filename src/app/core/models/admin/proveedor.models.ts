export interface Proveedor {
  id: number;
  razonSocial: string;
  ruc: string;
  cel?: string;
  email?: string;
  direccion?: string;
  estado?: boolean;
}
