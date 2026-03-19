import { VentaItemRequest } from './VentaItemRequest';

export interface CheckoutRequest {
  items: VentaItemRequest[];
  direccion: string;
  latitud: number;
  longitud: number;
  ciudad: string;
  pais: string;
  codigoPostal: string;
  emailEnvioComprobante: string; // Email para la boleta
}
