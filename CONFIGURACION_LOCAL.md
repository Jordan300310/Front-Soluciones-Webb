# Manual local del frontend Angular

Angular presenta la tienda y el panel administrativo. Toda la informacion se
obtiene del backend Spring Boot; el navegador nunca se conecta directamente a
Python ni a PostgreSQL.

## Requisitos

- Node.js y npm compatibles con Angular 20.
- Backend Spring Boot activo en `http://localhost:8080`.

## Primera configuracion

Desde la raiz del frontend:

```powershell
npm ci
```

La URL local del backend se encuentra en `src/environments/environment.ts`:

```typescript
export const environment = {
  api: 'http://localhost:8080'
};
```

Esta URL no es una credencial y puede subirse a Git. Para otro servidor debe
cambiarse mediante una configuracion de entorno de Angular antes de compilar.

## Iniciar

```powershell
npm start
```

Abre `http://localhost:4200`.

## Usar los pronosticos

1. Inicia sesion como empleado administrador.
2. Entra al panel administrativo.
3. Selecciona `Pronosticos` o abre `http://localhost:4200/admin/pronosticos`.
4. Elige un domingo ya finalizado como fecha de corte y ejecuta el pronostico.
5. Cuando hayan terminado periodos pronosticados, usa **Actualizar resultados
   BI** para completar cantidades reales y recalcular las siete tablas. El
   backend tambien realiza esta comprobacion automaticamente cada dia.

Para que funcione, PostgreSQL, Python y Spring Boot deben estar activos. La
pantalla consulta y ejecuta pronosticos solamente mediante Spring Boot.

## Compilar y probar

```powershell
npm run build
npm test
```

## Power BI

Power BI tampoco recibe datos desde Angular. Lee desde PostgreSQL
`public.vw_powerbi_pronostico_demanda` y las siete vistas
`public.vw_powerbi_*` creadas por `database/ScriptPrediccionEpp.sql`. Despues de
una carga analitica nueva debe actualizarse el modelo de Power BI.

## Orden de inicio del sistema

1. PostgreSQL.
2. Microservicio Python.
3. Spring Boot.
4. Este frontend Angular.
