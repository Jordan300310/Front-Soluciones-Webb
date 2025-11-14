# Análisis de Funciones de Formateo de Fecha (MM/YY)

Este documento detalla el funcionamiento de tres métodos de TypeScript, comúnmente utilizados en un componente de Angular, para gestionar un campo de entrada (input) de fecha de expiración en formato `MM/YY`.

El objetivo de estas funciones es crear una máscara de entrada (input mask) que formatee automáticamente el texto mientras el usuario escribe y valide el formato final cuando el usuario abandona elcampo.

## 1\. `formatFecha`

Esta es la función principal de lógica y formateo. Se utiliza como una utilidad interna para limpiar y estructurar la cadena de fecha.

```typescript
private formatFecha(value: string, strict = false): { digits: string; formatted: string } {
  let digits = (value || '').replace(/\D/g, '').slice(0, 4);

  if (digits.length === 0) {
    return { digits: '', formatted: '' };
  }

  if (digits.length === 1 && strict) {
    const month = parseInt(digits, 10);
    if (month > 0 && month < 10) {
      digits = '0' + month;
    }
  } else if (digits.length === 2) {
    let month = parseInt(digits, 10);

    if (isNaN(month) || month <= 0) {
      month = 1; // "00" -> "01"
    } else if (month > 12) {
      month = 12; // "13" -> "12"
    }
    digits = (month < 10 ? '0' + month : String(month)) + digits.slice(2);
  }

  let formatted = digits;
  if (formatted.length > 2) {
    formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
  }

  return { digits, formatted };
}
```

### 🎯 Propósito

Tomar una cadena de texto (el valor del input) y un indicador opcional `strict`, y devolver un objeto con los dígitos limpios y la cadena formateada.

### ⚙️ Lógica Detallada

1.  **Limpieza:**

    - `let digits = (value || '').replace(/\D/g, '').slice(0, 4);`
    - Toma el `value` (o un string vacío si es nulo).
    - `replace(/\D/g, '')` elimina cualquier carácter que **no** sea un dígito.
    - `.slice(0, 4)` se asegura de que solo se conserven los primeros 4 dígitos (para `MMYY`).

2.  **Caso Vacío:**

    - Si no quedan dígitos, devuelve cadenas vacías.

3.  **Modo `strict` (para `onFechaExpBlur`):**

    - `if (digits.length === 1 && strict)`
    - Este bloque solo se ejecuta si `strict` es `true` (cuando el usuario deja el campo) y solo hay un dígito.
    - Si el usuario escribe "2" y abandona el campo, esto lo convertirá en "02".

4.  **Validación del Mes (Longitud 2):**

    - `else if (digits.length === 2)`
    - Este bloque se activa cuando el usuario ha escrito los dos dígitos del mes (o cuando el modo `strict` formatea un solo dígito a dos).
    - Convierte los dígitos a un número.
    - Si el mes es "00" o inválido, lo fuerza a "01".
    - Si el mes es mayor a "12" (ej. "13"), lo fuerza a "12".
    - Reconstruye la cadena `digits` con el mes validado (asegurando el "0" inicial si es necesario, ej. `8` -\> `08`) y añade los dígitos del año que pudieran existir (`digits.slice(2)`).

5.  **Añadir Separador `/`:**

    - `if (formatted.length > 2)`
    - Si la cadena de dígitos tiene más de 2 caracteres (es decir, ha comenzado a escribir el año, ej. "123" o "1234"), inserta la barra `/` después del mes.
    - Ej: "123" -\> "12/3"

6.  **Retorno:**

    - Devuelve un objeto que contiene:
      - `digits`: Los dígitos limpios y validados (ej. "0825").
      - `formatted`: La cadena lista para mostrar en el input (ej. "08/25").

---

## 2\. `onFechaExpInput`

Este método es un manejador de eventos que se dispara **en cada pulsación de tecla** (evento `input`) dentro del campo de fecha.

```typescript
onFechaExpInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const raw = input.value || '';
  const selectionStart = input.selectionStart ?? raw.length;

  const digitsBefore = raw.slice(0, selectionStart).replace(/\D/g, '').length;

  const { formatted } = this.formatFecha(raw, false);

  let newCaret = 0;
  let seen = 0;
  while (newCaret < formatted.length && seen < digitsBefore) {
    if (/\d/.test(formatted[newCaret])) {
      seen++;
    }
    newCaret++;
  }

  if (raw.replace(/\D/g, '').length === 2 && formatted.length === 5 && newCaret === 2) {
    newCaret = 3;
  }

  this.pagoCtrl['fechaExp'].setValue(formatted, { emitEvent: false });

  setTimeout(() => {
    try {
      input.setSelectionRange(newCaret, newCaret);
    } catch (e) {}
  }, 0);
}
```

### 🎯 Propósito

Formatear el valor del input _mientras_ el usuario escribe y, lo más importante, gestionar inteligentemente la posición del cursor (caret) para que no salte de forma inesperada.

### ⚙️ Lógica Detallada

1.  **Obtener Estado Actual:**

    - Obtiene el elemento `input`, su valor `raw` (texto sin procesar), y la posición del cursor (`selectionStart`).

2.  **Calcular Dígitos Previos (Clave del Cursor):**

    - `const digitsBefore = raw.slice(0, selectionStart).replace(/\D/g, '').length;`
    - Esta es la parte más inteligente: cuenta cuántos _dígitos_ había en la cadena _antes_ de la posición actual del cursor.
    - _Ejemplo:_ Si el texto es "12/3" y el cursor está en "12/|3", `digitsBefore` será **2** (del "1" y "2").

3.  **Formatear (No Estricto):**

    - `const { formatted } = this.formatFecha(raw, false);`
    - Llama a la función de formateo en modo `false` (no estricto), ya que el usuario aún está escribiendo.

4.  **Calcular Nueva Posición del Cursor:**

    - Este bucle `while` recorre la _nueva_ cadena `formatted`.
    - Va contando los dígitos (`seen++`) que encuentra.
    - Se detiene cuando ha "visto" el mismo número de dígitos que había _antes_ del cursor (`seen < digitsBefore`).
    - La variable `newCaret` tendrá la posición índice correcta en la nueva cadena formateada.

5.  **Caso Especial: Auto-salto del `/`:**

    - `if (raw.replace...length === 2 && formatted.length === 5 && newCaret === 2)`
    - Esta condición detecta el momento exacto en que el usuario escribe el segundo dígito del mes (ej. "12").
    - En este punto, `formatFecha` añade automáticamente la barra (ej. "12/").
    - El cálculo del cursor (`newCaret === 2`) lo pondría en "12|/".
    - Esta línea `newCaret = 3;` lo "salta", moviéndolo a "12/|".

6.  **Actualizar Valor del Formulario:**

    - `this.pagoCtrl['fechaExp'].setValue(formatted, { emitEvent: false });`
    - Actualiza el valor del control del formulario (probablemente un `FormControl` de Angular) con la cadena formateada.
    - `{ emitEvent: false }` es crucial para evitar un bucle infinito, ya que `setValue` dispararía otro evento `input`.

7.  **Actualizar Cursor (con `setTimeout`):**

    - `setTimeout(() => { ... }, 0);`
    - El reposicionamiento del cursor (`setSelectionRange`) se envuelve en un `setTimeout` de 0 milisegundos.
    - Esto es necesario porque el navegador intentará mover el cursor por sí mismo después del evento de input. Este `setTimeout` pone la lógica de posicionamiento del cursor al final de la cola de eventos, asegurando que se ejecute _después_ de la acción predeterminada del navegador y anule su comportamiento.

---

## 3\. `onFechaExpBlur`

Este método es un manejador de eventos que se dispara cuando el usuario **abandona el campo** (evento `blur`).

```typescript
onFechaExpBlur(event: FocusEvent) {
  const input = event.target as HTMLInputElement;

  const { formatted } = this.formatFecha(input.value, true);

  this.pagoCtrl['fechaExp'].setValue(formatted, { emitEvent: false });
}
```

### 🎯 Propósito

Realizar una limpieza y formateo final del valor una vez que el usuario ha terminado de interactuar con el campo.

### ⚙️ Lógica Detallada

1.  **Obtener Valor Final:**

    - Obtiene el elemento `input` y su valor actual.

2.  **Formatear (Modo Estricto):**

    - `const { formatted } = this.formatFecha(input.value, true);`
    - Llama a la función de formateo pasando `strict = true`.
    - Esto aplica reglas más estrictas, como convertir "2" en "02" o "0" en "01".

3.  **Actualizar Valor del Formulario:**

    - `this.pagoCtrl['fechaExp'].setValue(formatted, { emitEvent: false });`
    - Establece el valor final y formateado en el control del formulario. No se necesita gestión del cursor porque el usuario ya no está en el campo.
