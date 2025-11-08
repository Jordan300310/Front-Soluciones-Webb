
export interface ClienteAdminDTO {
  idCliente: number;
  idUsuario: number | null;
  username: string | null;

  nom: string | null;
  apat: string | null;
  amat: string | null;
  dni: string | null;
  cel: string | null;
  email: string | null;
  fen: string | null;          // LocalDate como 'yyyy-MM-dd'

  clienteEstado: boolean | null;
  usuarioEstado: boolean | null; // opcional, solo lectura
}

// Lo que se envía al backend al actualizar (match con record Java)
export interface UpdateClienteRequest {
  nom: string;
  apat: string;
  amat: string;
  dni: string;
  cel: string;
  email: string;
  fen: string;      // 'yyyy-MM-dd'
  username: string;
}
