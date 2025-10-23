export interface EmpleadoAdminDTO {
  idEmpleado: number;
  idUsuario: number;
  username: string | null;
  password: string | null;
  usuarioEstado: boolean | null;
  nom: string | null; apat: string | null; amat: string | null;
  dni: string | null; cel: string | null; email: string | null;
  fen: string | null; cargo: string | null; sueldo: number | null;
  empleadoEstado: boolean | null;
}
export interface CrearEmpleadoRequest {
  nom: string; apat: string; amat: string; dni: string; cel: string; email: string;
  fen: string; cargo: string; sueldo: number; username: string; password: string;
}
export interface UpdateEmpleadoRequest extends Partial<CrearEmpleadoRequest> {
  empleadoEstado?: boolean; usuarioEstado?: boolean;
}
