# Cambios antes del commit

- Fecha: 15 de noviembre de 2025
- Rama: `main`

## Archivos modificados (sin commit)

- `src/app/features/public/pages/landing/landing.component.css`
- `src/app/features/public/pages/landing/landing.component.html`
- `src/app/features/public/pages/landing/landing.component.ts`
- `src/app/features/public/pages/products/products.component.css`
- `src/app/features/public/pages/products/products.component.html`
- `src/app/features/public/pages/products/products.component.ts`

## Resumen breve

Se realizaron cambios en los componentes de la página de inicio (`landing`) y en la página de productos (`products`).

## Descripción detallada de los cambios

### Explicación del código añadido (animación del botón "Añadir al carrito")

1. CSS (en `landing.component.css` y `products.component.css`)

- `.add-to-cart-btn`: contenedor del botón. Se define `position: relative`, `overflow: hidden` y una `transition` para suavizar transformaciones.
- `.btn-icon`: elemento absoluto centrado dentro del botón que representa el icono (marca ✓). Inicialmente está escalado a `scale(0)` y con `opacity: 0` para estar oculto.
- `.btn-text`: texto visible del botón. Mantiene su propia `transition` para permitir ocultarlo mediante transform.
- `.add-to-cart-btn.animating`: clase que dispara la animación `pulse` (0.6s). Mientras está presente, el texto se oculta (escala a 0 y opacidad 0) y el icono vuelve a `scale(1)` y `opacity:1`.
- `@keyframes pulse`: define un pulso visual (escala y sombra) para enfatizar la acción.

Efecto: cuando el botón recibe la clase `animating`, el texto desaparece y el icono ✓ aparece con un pulso, dando feedback visual al usuario.

2. HTML (en `landing.component.html` y `products.component.html`)

- El botón ahora contiene dos `span`: `btn-text` (texto) y `btn-icon` (icono). Esto permite animar cada elemento por separado.
- Se añadió la clase `add-to-cart-btn` al botón y se cambió el `click` para pasar el evento: `(click)="agregarAlCarrito(producto, $event)"`.
- También se añadió `aria-label="Añadir al carrito"` en `landing` (recomendado añadirlo también en `products`) y conviene marcar el icono como `aria-hidden="true"` para que los lectores de pantalla no lean la marca.

3. TypeScript (en `landing.component.ts` y `products.component.ts`)

- Nueva propiedad: `animatingProducts: { [key: number]: boolean } = {};` —pensada como fallback cuando la función se llama sin un `event` DOM.
- Firma del método: `agregarAlCarrito(producto: ProductoAdminDTO, event?: Event)` — ahora acepta el evento para manipular el elemento botón directamente.
- Lógica del método:
  - Se añade el producto a la tienda (`cartStore.agregarProducto(producto)`).
  - Si `event.currentTarget` está disponible, se obtiene el elemento botón y se le añade la clase `animating`. Tras `600ms` se remueve la clase.
  - Si no hay `event` (por ejemplo, llamada desde código), se setea `animatingProducts[producto.id] = true` y se revierte a `false` a los `600ms`.

Observaciones técnicas y recomendaciones:

- Accesibilidad: añadir `aria-hidden="true"` al icono en la plantilla `products` y asegurarse de que el `aria-label` esté presente o que el texto sea legible por pantallas lectoras.
- Evitar manipular el DOM directamente cuando sea posible: usar `Renderer2` o bindings de Angular (`[class.animating]` o `ngClass`) para cambiar clases de forma reactiva y más segura.
- Actualmente el mapa `animatingProducts` no tiene efecto visible a menos que la plantilla use esa variable para asignar la clase, por ejemplo:

```html
<button
  class="btn btn-primary mt-2 w-100 add-to-cart-btn"
  (click)="agregarAlCarrito(producto, $event)"
  [class.animating]="animatingProducts[producto.id]"
></button>
```

- Limpieza: si hay riesgo de que el componente se destruya antes de que se ejecute el `setTimeout`, conviene almacenar el `timeout` y limpiarlo en `ngOnDestroy`.
- Reutilización: el CSS y la lógica están duplicados en `landing` y `products`. Mejor crear un componente compartido `AddToCartButton` o mover el CSS a un archivo global (`styles.css` o `shared`) para evitar duplicación.
