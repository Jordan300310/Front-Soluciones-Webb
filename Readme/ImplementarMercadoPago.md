## Contexto

Tengo un backend en Spring Boot con integración de Mercado Pago Checkout Pro completamente funcional. Necesito implementar el frontend en Angular para completar el proceso de venta.

## Backend Endpoints Disponibles

### 1. Crear Checkout
```
POST http://localhost:8080/venta/checkout
Headers:
  - Authorization: Bearer {JWT_TOKEN}
  - Content-Type: application/json

Request Body:
{
  "items": [
    {
      "productoId": 1,
      "cantidad": 2
    }
  ],
  "direccion": "Av. Principal 123",
  "ciudad": "Lima",
  "pais": "Perú",
  "codigoPostal": "15001"
}

Response (200):
{
  "initPoint": "https://www.mercadopago.com.pe/checkout/v1/redirect?pref_id=...",
  "preferenceId": "3006513216-37366693-8952-4944-a7f1-65aa48ef682a",
  "total": 179.80,
  "checkoutPendienteId": 10
}
```

### 2. Consultar Venta
```
GET http://localhost:8080/api/v1/ventas/{id}
Headers:
  - Authorization: Bearer {JWT_TOKEN}

Response (200):
{
  "ventaId": 31,
  "serie": "B001",
  "numero": "00000031",
  "subtotal": 76.19,
  "igv": 13.71,
  "total": 89.90,
  "clienteNombre": "cliente1 cliente1 cliente1",
  "fechaEmision": "2025-11-22T02:39:48.858895"
}
```

## Flujo de Usuario Esperado

1. **Página de Carrito**
   - Usuario ve sus productos en el carrito
   - Puede modificar cantidades
   - Ve el total a pagar
   - Botón "Proceder al Checkout"

2. **Página de Checkout**
   - Formulario para ingresar datos de envío:
     - Dirección
     - Ciudad
     - País
     - Código Postal
   - Resumen del pedido (productos, cantidades, total)
   - Botón "Pagar con Mercado Pago"

3. **Proceso de Pago**
   - Al hacer clic en "Pagar con Mercado Pago":
     - Llamar al endpoint POST /venta/checkout
     - Recibir la respuesta con el `initPoint`
     - Redirigir automáticamente al usuario a la URL `initPoint`
   - El usuario completa el pago en Mercado Pago
   - Mercado Pago redirige al usuario según el resultado:
     - Éxito → `/checkout/success?payment_id=xxx&status=approved&preference_id=xxx`
     - Fallo → `/checkout/failure`
     - Pendiente → `/checkout/pending`

4. **Página de Éxito** (`/checkout/success`)
   - Mostrar mensaje de éxito
   - Extraer `preference_id` de los query params
   - Buscar la venta creada (puede requerir polling o esperar unos segundos)
   - Mostrar detalles del comprobante:
     - Número de comprobante
     - Total pagado
     - Fecha
     - Productos comprados
   - Botón para descargar comprobante (opcional)
   - Botón para ver historial de compras

5. **Página de Fallo** (`/checkout/failure`)
   - Mostrar mensaje de error
   - Explicar que el pago no se procesó
   - Botón para reintentar
   - Botón para volver al carrito

6. **Página Pendiente** (`/checkout/pending`)
   - Mostrar mensaje de pago pendiente
   - Explicar que recibirá notificación cuando se confirme
   - Botón para volver al inicio

## Requisitos de Implementación

### Servicios Angular a Crear

1. **CheckoutService**
   ```typescript
   - crearCheckout(checkoutData): Observable<CheckoutResponse>
   - consultarVenta(ventaId): Observable<VentaResponse>
   ```

2. **CarritoService** (si no existe)
   ```typescript
   - obtenerItems(): Observable<ItemCarrito[]>
   - calcularTotal(): number
   - limpiarCarrito(): void
   ```

### Componentes a Crear/Modificar

1. **CarritoComponent**
   - Mostrar items del carrito
   - Botón para ir a checkout

2. **CheckoutComponent**
   - Formulario de datos de envío
   - Resumen del pedido
   - Botón de pago que llama al backend y redirige

3. **CheckoutSuccessComponent**
   - Procesar query params de Mercado Pago
   - Mostrar comprobante de venta
   - Manejar caso donde la venta aún no está creada (webhook puede tardar)

4. **CheckoutFailureComponent**
   - Mensaje de error
   - Opciones para reintentar

5. **CheckoutPendingComponent**
   - Mensaje de pago pendiente

### Modelos TypeScript

```typescript
interface CheckoutRequest {
  items: ItemCheckout[];
  direccion: string;
  ciudad: string;
  pais: string;
  codigoPostal: string;
}

interface ItemCheckout {
  productoId: number;
  cantidad: number;
}

interface CheckoutResponse {
  initPoint: string;
  preferenceId: string;
  total: number;
  checkoutPendienteId: number;
}

interface VentaResponse {
  ventaId: number;
  serie: string;
  numero: string;
  subtotal: number;
  igv: number;
  total: number;
  clienteNombre: string;
  fechaEmision: string;
}
```

### Rutas a Configurar

```typescript
const routes: Routes = [
  { path: 'carrito', component: CarritoComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'checkout/success', component: CheckoutSuccessComponent },
  { path: 'checkout/failure', component: CheckoutFailureComponent },
  { path: 'checkout/pending', component: CheckoutPendingComponent },
];
```

## Consideraciones Importantes

1. **Autenticación**
   - Todos los endpoints requieren JWT token
   - Incluir token en header Authorization: Bearer {token}

2. **Redirección a Mercado Pago**
   - Usar `window.location.href = initPoint` para redirigir
   - NO usar router.navigate() porque debe salir de la aplicación

3. **Manejo de Query Params en Success**
   - Mercado Pago devuelve: `?payment_id=xxx&status=approved&preference_id=xxx`
   - Usar ActivatedRoute para leer los params
   - El `preference_id` puede usarse para buscar la venta

4. **Polling para Venta**
   - El webhook puede tardar unos segundos
   - Implementar retry logic o polling para consultar la venta
   - Mostrar loading mientras se espera

5. **Manejo de Errores**
   - Validar que el carrito no esté vacío
   - Validar formulario de checkout
   - Manejar errores de red
   - Mostrar mensajes claros al usuario

6. **UX/UI**
   - Loading spinner durante la creación del checkout
   - Deshabilitar botón de pago después del primer clic
   - Animaciones de transición entre páginas
   - Diseño responsive

## Ejemplo de Flujo en CheckoutComponent

```typescript
procesarPago() {
  this.loading = true;
  this.botonDeshabilitado = true;

  const checkoutData: CheckoutRequest = {
    items: this.carrito.items.map(item => ({
      productoId: item.producto.id,
      cantidad: item.cantidad
    })),
    direccion: this.formulario.value.direccion,
    ciudad: this.formulario.value.ciudad,
    pais: this.formulario.value.pais,
    codigoPostal: this.formulario.value.codigoPostal
  };

  this.checkoutService.crearCheckout(checkoutData).subscribe({
    next: (response) => {
      // Guardar preferenceId en localStorage para usar en success page
      localStorage.setItem('lastPreferenceId', response.preferenceId);
      
      // Redirigir a Mercado Pago
      window.location.href = response.initPoint;
    },
    error: (error) => {
      this.loading = false;
      this.botonDeshabilitado = false;
      this.mostrarError('Error al procesar el pago. Intenta nuevamente.');
    }
  });
}
```

## Ejemplo de Flujo en CheckoutSuccessComponent

```typescript
ngOnInit() {
  this.route.queryParams.subscribe(params => {
    const paymentId = params['payment_id'];
    const status = params['status'];
    const preferenceId = params['preference_id'];

    if (status === 'approved') {
      // Esperar un poco para que el webhook procese
      setTimeout(() => {
        this.buscarVenta(preferenceId);
      }, 2000);
    }
  });
}

buscarVenta(preferenceId: string, intentos = 0) {
  // Buscar venta por preference_id o usar el ID guardado
  // Implementar retry logic si la venta no existe aún
  this.ventaService.buscarPorPreferenceId(preferenceId).subscribe({
    next: (venta) => {
      this.venta = venta;
      this.carrito.limpiar();
    },
    error: (error) => {
      if (intentos < 3) {
        setTimeout(() => {
          this.buscarVenta(preferenceId, intentos + 1);
        }, 2000);
      } else {
        this.mostrarError('No se pudo obtener el comprobante. Revisa tu historial de compras.');
      }
    }
  });
}
```

## Tarea

Por favor, implementa el flujo completo de checkout con Mercado Pago en Angular siguiendo esta especificación. Incluye:

1. Servicios para comunicación con el backend
2. Componentes para cada página del flujo
3. Formularios con validación
4. Manejo de estados de carga y errores
5. Diseño responsive y atractivo
6. Animaciones y transiciones suaves

El objetivo es que el usuario pueda:
- Ver su carrito
- Ingresar datos de envío
- Ser redirigido a Mercado Pago para pagar
- Ver su comprobante después del pago exitoso

ngrok http 4200 --pooling-enabled

ngrok http 8080 --pooling-enabled