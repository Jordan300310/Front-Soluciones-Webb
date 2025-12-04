export interface Reembolso {
    id: number;
    idVenta: number;
    nombreCliente: string;
    emailCliente: string;
    totalVenta: number;
    motivo: string;
    estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
    fechaSolicitud: string;
    fechaProcesamiento: string | null;
    nombreEmpleadoProceso: string | null;
    comentarioEmpleado: string | null;
}
