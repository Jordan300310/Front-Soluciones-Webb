export interface PerfilResponse {
  username: string;
  nombres: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  dni: string | null;
  celular: string | null;
  email: string | null;
  fechaNacimiento: string | null; // ISO (yyyy-MM-dd)
}