export interface CheckoutResponse {
  checkoutUrl: string;       // La URL de Stripe
  sessionId: string;         // El ID de sesión (cs_test_...)
  total: number;
  checkoutPendienteId: number;
}
