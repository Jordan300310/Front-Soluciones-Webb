# Documentación de Implementación de Reembolsos

Este documento detalla la implementación del sistema de gestión de reembolsos en la aplicación, cubriendo tanto la funcionalidad para clientes como para empleados y administradores.

## 1. Visión General

El módulo de reembolsos permite a los clientes solicitar devoluciones por compras realizadas, y proporciona a los empleados y administradores herramientas para revisar, aprobar o rechazar estas solicitudes.

## 2. Endpoints para Clientes

Estas funcionalidades están integradas en el perfil del usuario (`PerfilComponent`).

### 2.1. Solicitar Reembolso
Permite a un cliente autenticado solicitar un reembolso para una venta específica.

- **Método:** `POST`
- **URL:** `/api/v1/reembolsos/solicitar`
- **Autenticación:** Requiere token de usuario (Bearer Token).
- **Body (JSON):**
  ```json
  {
    "idVenta": 123,
    "motivo": "El producto llegó dañado"
  }
  ```
- **Respuesta Exitosa (200 OK):** Retorna el objeto `Reembolso` creado con estado `PENDIENTE`.

### 2.2. Ver Mis Solicitudes
Obtiene el historial de solicitudes de reembolso del cliente actual.

- **Método:** `GET`
- **URL:** `/api/v1/reembolsos/mis-solicitudes`
- **Autenticación:** Requiere token de usuario.
- **Respuesta Exitosa (200 OK):** Array de objetos `Reembolso`.

## 3. Endpoints para Empleados/Administradores

Estas funcionalidades están implementadas en el panel administrativo (`TicketComponent`).

### 3.1. Ver Todos los Reembolsos
Obtiene el listado completo de reembolsos (pendientes, aprobados y rechazados).

- **Método:** `GET`
- **URL:** `/api/v1/reembolsos`
- **Autenticación:** Requiere rol `EMPLEADO` o `ADMIN`.
- **Respuesta Exitosa (200 OK):** Array de objetos `Reembolso`.

### 3.2. Ver Reembolsos Pendientes
Obtiene únicamente las solicitudes que requieren atención.

- **Método:** `GET`
- **URL:** `/api/v1/reembolsos/pendientes`
- **Autenticación:** Requiere rol `EMPLEADO` o `ADMIN`.
- **Respuesta Exitosa (200 OK):** Array de objetos `Reembolso` con estado `PENDIENTE`.

### 3.3. Procesar Reembolso
Permite aprobar o rechazar una solicitud.

- **Método:** `PUT`
- **URL:** `/api/v1/reembolsos/{id}/procesar`
- **Autenticación:** Requiere rol `EMPLEADO` o `ADMIN`.
- **Body (JSON):**
  ```json
  {
    "aprobar": true, // true para APROBAR, false para RECHAZAR
    "comentario": "Reembolso aprobado según política de garantía"
  }
  ```
- **Respuesta Exitosa (200 OK):** Objeto `Reembolso` actualizado con el nuevo estado, fecha de procesamiento y nombre del empleado.

## 4. Modelos de Datos

### Interfaz Reembolso (Frontend)
```typescript
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
```

## 5. Implementación Frontend

### Cliente (`PerfilComponent`)
- Se agregó una pestaña "Reembolsos" en el perfil.
- Se valida que no exista ya una solicitud para el pedido seleccionado.
- Formulario modal para ingresar el motivo de la solicitud.

### Admin (`TicketComponent`)
- **Servicio:** `AdminReembolsoService` maneja la comunicación con la API.
- **Interfaz:**
  - Filtros para ver "Pendientes" vs "Todas".
  - Tarjetas informativas con detalles de la venta y el cliente.
  - Badges de colores para los estados (Amarillo: Pendiente, Verde: Aprobado, Rojo: Rechazado).
  - Modal de confirmación para aprobar/rechazar con campo para comentarios.
- **UX:**
  - Actualización en tiempo real de la lista tras procesar.
  - Manejo de estados de carga (spinners) y errores.
  - Formato de moneda local (PEN).
