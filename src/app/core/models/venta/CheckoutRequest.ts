import { VentaItemRequest } from './VentaItemRequest';

export interface CheckoutRequest {
  items: VentaItemRequest[];
  pais: string;
  departamento: string;
  ciudad: string;
  distrito: string;
  direccion: string;
  referencia: string;
  latitud: number;
  longitud: number;
  codigoPostal: string;
  emailEnvioComprobante: string;
}
