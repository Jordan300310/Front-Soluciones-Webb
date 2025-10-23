export interface ClienteAdminDTO {
  idCliente: number;
  idUsuario: number;
  username: string | null;
  password: string | null;
  usuarioEstado: boolean | null;
  nom: string | null; apat: string | null; amat: string | null;
  dni: string | null; cel: string | null; email: string | null;
  fen: string | null;
  clienteEstado: boolean | null;
}
export interface UpdateClienteRequest {
  nom?: string; apat?: string; amat?: string; dni?: string; cel?: string; email?: string; fen?: string; clienteEstado?: boolean;
  username?: string; password?: string; usuarioEstado?: boolean;
}
