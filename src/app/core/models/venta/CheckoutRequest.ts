import { VentaItemRequest } from './VentaItemRequest';

export interface CheckoutRequest {
  items: VentaItemRequest[];
  direccion: string;
  ciudad: string;
  pais: string;
  codigoPostal: string;
}
