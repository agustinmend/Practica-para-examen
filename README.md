[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/qAAlj3Mz)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=23616877)
# Examen Final - WEB-ISW-233

> Refactor de una aplicación tipo **Slack** escrita en código _legacy_.
> Tienes **2 horas y 30 minutos**.

## Contexto

Recibes un proyecto que "ya funciona": un cliente de chat tipo Slack con varios
canales, mensajes y miembros. El problema es que **todo el código está dentro
de tres archivos** (`index.html`, `index.css`, `index.js`), no hay tipado, no
hay separación de responsabilidades, no se usan plantillas y la única forma
en que la UI se actualiza es llamando manualmente a `render()`.

Tu trabajo es **convertirlo en una aplicación profesional** sin cambiar la
experiencia visual. La UI actual **no debe cambiar**: se mantiene la misma
distribución. Lo que cambia es **cómo está construida**.

## Reglas

- La rúbrica completa está en [`RUBRICA.md`](./RUBRICA.md) — léela **antes** de
  empezar para saber dónde están los puntos.
- Puedes consultar documentación oficial en línea (MDN, Vite, Handlebars,
  TypeScript, PostCSS).
- Tienes acceso limitado a IA dentro del IDE: úsala con criterio. Lo que
  presentes lo tienes que poder explicar.
- Se evalúa **cómo organizas el código**, no sólo que "funcione".
- Para entregar, todos los tests del workflow de **GitHub Actions** deben
  pasar en verde. Si el CI está rojo, el examen no se considera entregado.
- Debes abrir un **Pull Request** para la revisión.
- Los tests viven en `tests/` — **son tu fuente de verdad**. Cuando un test
  falle, su nombre te dice exactamente qué revisar.

## Lo que debes lograr

Las secciones de esta guía están numeradas **igual que la rúbrica**. Si la
sección §N aquí no te basta, busca §N en `RUBRICA.md` para ver los criterios
de puntuación exactos.

### §1. Setup del proyecto

- Configura **TypeScript** (`tsconfig.json` con `strict` activado).
- Configura **PostCSS** — elige los plugins que consideres útiles.
- Instala y configura **Handlebars** de modo que puedas importar plantillas
  `.hbs` desde tu código TypeScript.
- Define los scripts de `package.json`:
  - `dev`: levanta el servidor de desarrollo.
  - `build`: genera la versión de producción en `dist/`.
  - `start`: hace `build` y luego sirve la versión de producción.
  - El servidor debe correr en el **puerto 3000** (tanto `dev` como `start`).

### §2. Refactor a TypeScript + Handlebars

- Migra **todo el JavaScript a TypeScript** (`.ts`). No deben quedar archivos
  `.js` dentro de `src/`.
- No debe usar null. Todas las variables, funciones, etc deben estar tipadas.
- El `index.html` actual es un punto de partida con la UI _hardcoded_ — debes
  reemplazarlo por un HTML mínimo (un punto de montaje, p. ej. `<div id="app">`)
  y reconstruir la UI en el cliente con tus componentes.
- Extrae el HTML repetido (mensajes, items de canal, miembros, etc.) a
  **plantillas Handlebars** (`.hbs`) reutilizables; apóyate en `{{#each}}` y
  partials para no repetir HTML.
- Declara los tipos de dominio (`Channel`, `Message`, `User`, …) en
  `src/types/`.

### §3. CSS con BEM

Refactoriza el CSS aplicando **metodología BEM**:

- `.bloque__elemento`
- `.bloque__elemento--modificador`

Separa los estilos **por componente** (un archivo `.css` por bloque BEM, no un
solo archivo gigante).

### §4. Arquitectura MVC

Organiza tu código en carpetas claras dentro de `src/`. Como mínimo:

- **Modelos** (`src/models/`): el estado de la app y las entidades de dominio.
- **Vistas** (`src/views/` o `src/components/`): plantillas Handlebars y las
  clases que las renderizan.
- **Controladores** (`src/controllers/`): la lógica que conecta modelos con
  vistas y reacciona a eventos del usuario.

Regla clave: **las vistas no mutan el modelo directamente**. Toda mutación
pasa por un controlador.

### §5. Mock data + capa API

- En la carpeta `mock/` ya tienes `data.json` con datos anidados (workspaces,
  canales, mensajes, usuarios). **Puedes ampliarlo, pero no romper su forma.**
- Crea `src/api.ts`: una capa de acceso a datos que consume ese JSON con
  `fetch`. El resto de la aplicación **nunca** debe leer el JSON directamente
  — todo pasa por `api.ts`.

### §6. Router (History API)

Implementa un **router** propio en `src/router.ts` (o `src/utils/router.ts`)
usando la **History API**. Define al menos:

- `/` → canal por defecto
- `/c/:id` → un canal específico

Cuando el usuario navegue (o use el botón "atrás" del navegador), la URL
debe actualizarse sin recargar la página.

### §7. Reactividad: Proxy + Observer

Cuando el usuario hace click en otro canal:

- La URL cambia (router).
- El panel central se reemplaza con los mensajes del canal seleccionado.
- El header (nombre, topic, número de miembros) se actualiza.
- El panel derecho de miembros refleja los miembros del nuevo canal.
- El composer actualiza su `placeholder`.

Esta reactividad **no se logra llamando a `render()` a mano**. Debes:

- Envolver el estado con el **`Proxy` API** para detectar mutaciones.
- Implementar tú mismo un **Observer** (`subscribe`/`notify` o `on`/`emit`)
  al que las vistas se suscriben para re-renderizarse.

Cuando el usuario envía un mensaje, el controlador muta el modelo y son los
observadores los que re-renderizan — el controlador **no** invoca a las
vistas manualmente.

### §8. Patrones de diseño

Patrones permitidos (cerrados): **Command**, **Factory**, **Memento**.
No se aceptan sustituciones.

- **Mínimo 2** de los 3, **máximo 3**. Tú eliges cuáles aplicar según lo que
  mejor encaje con tu diseño.
- Implementar el 3er patrón **no suma más puntos** (la sección tiene tope),
  pero funciona como red de seguridad: si uno sale mal, los otros dos
  cuentan igual.

Reglas de esta sección:

- `Observer` ya está exigido por §7 — **no cuenta** como uno de los patrones
  de esta sección.
- **Puedes** usar `Singleton` si lo necesitas para _plumbing_ (bus, router),
  pero no cuenta como uno de los patrones pedidos y tampoco suma puntos.
- Si entregas un patrón _"extra"_ fuera de los tres permitidos (Decorator,
  Strategy, etc.) y no aporta valor real, se descuenta por sobre-ingeniería.

**Para cada patrón que apliques**, agrega al inicio del archivo
correspondiente (o en un bloque JSDoc encima de la clase) una
**justificación, en este orden y con estos
rótulos exactos**:

```ts
/**
 * Patrón: <Command | Factory | Memento>
 * Problema que resuelve: <qué dolor concreto del proyecto resuelve y donde se encuentra este dolor actualemnte (en el codigo espagetti)>
 * Implementación: <cómo lo implementaste aquí, qué clases/archivos colaboran>
 */
```

Si falta la justificación, el patrón **no se considera aplicado** durante la
revisión humana, aunque los tests automáticos pasen.

> Los nombres exactos de clases/métodos que el CI espera no están listados
> aquí: cuando un test falle, su mensaje te los dirá. Usa los tests como
> contrato.

### §9. Calidad general y CI

- El workflow en `.github/workflows/ci.yml` corre `npm run build` y `npm test`.
- Los tests en `tests/` validan: setup, organización MVC, BEM, uso de Proxy /
  Observer, presencia de los patrones que implementaste, existencia de
  `api.ts` y `router.ts`, y que el build produzca artefactos.
- El CI debe quedar **verde** en GitHub Actions.
- Mantén `tsc --noEmit` limpio. Evita `any` e `// @ts-ignore` generalizados.

## Estructura interna

La organización interna de `src/` es **flexible**, pero estos elementos **sí
son obligatorios**:

- `src/api.ts`
- `src/router.ts` (o `src/utils/router.ts`)
- al menos una plantilla `.hbs` y CSS separado por componente
- carpetas reconocibles de **models**, **views**/components y **controllers**

Ejemplo orientativo:

```
src/
  api.ts
  index.ts
  router.ts
  controllers/
  models/               ← donde vive el Proxy
  views/                ← o components/, con .hbs + .ts por componente
  styles/               ← BEM, un archivo por bloque
  types/
mock/
  data.json
tests/                   ← NO modificar
.github/workflows/ci.yml ← NO modificar
```

## Cómo ejecutar

```bash
npm install
npm run dev      # servidor de desarrollo en :3000
npm run build    # genera /dist
npm run start    # build + preview en :3000
npm test         # corre los tests del examen
```

## Bonus (opcional, máx. +5 pts — no superan el techo de 70)

Los bonuses no son obligatorios, pero si los implementas **bien**, suman sobre
tu nota final:

- **+3 pts — Edición de mensajes con `MutationObserver`:**
  - Doble-click sobre un mensaje propio lo vuelve editable
    (`contenteditable`).
  - Un **`MutationObserver`** debe observar el contenedor de mensajes y ser
    quien dispare la actualización del modelo cuando el DOM cambia. La
    actualización **no** debe dispararse escuchando directamente `blur` u
    otros eventos del input — el observador del DOM es la fuente del cambio.
  - La actualización del modelo debe ir por el mismo flujo que el resto de
    la app (un `EditMessageCommand` que muta el estado; el Proxy + Observer
    notifican a las vistas para re-renderizar). Requiere haber elegido
    **Command** en §8.
- **+1 pt** — `UndoCommand` que aprovecha tu Memento y se dispara con `Ctrl+Z`
  (requiere haber elegido **Memento** en §8).
- **+1 pt** — indicador visual reactivo del estado `online` / `away` /
  `offline` de los miembros.

---

## Entrega

1. Asegúrate de que `npm test` pase **localmente**.
2. Haz `push` a tu fork y abre un Pull Request.
3. El badge de GitHub Actions debe estar **verde**. Si el CI está rojo, no
   hay entrega.

Mucha suerte. Lee bien los nombres de los tests cuando fallen. Te dicen qué
falta.
