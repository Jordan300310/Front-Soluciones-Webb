// Empleado que viene del backend para panel admin
export interface EmpleadoAdminDTO {
  idEmpleado: number;
  idUsuario: number | null;
  username: string | null;

  nom: string | null;
  apat: string | null;
  amat: string | null;
  dni: string | null;
  cel: string | null;
  email: string | null;
  fen: string | null; // LocalDate representado como 'yyyy-MM-dd'

  cargo: string | null;
  sueldo: number | null;

  empleadoEstado: boolean;
  usuarioEstado: boolean;
}

// Crear empleado (tiene password)
export interface CrearEmpleadoRequest {
  nom: string;
  apat: string;
  amat: string;
  dni: string;
  cel: string;
  email: string;
  fen: string;      // 'yyyy-MM-dd'
  cargo: string;
  sueldo: number;
  username: string;
  password: string;
}

// Update empleado (ya sin password ni estado)
export interface UpdateEmpleadoRequest {
  nom: string;
  apat: string;
  amat: string;
  dni: string;
  cel: string;
  email: string;
  fen: string;      // 'yyyy-MM-dd'
  cargo: string;
  sueldo: number;
  username: string;
}
