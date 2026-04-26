# Rúbrica - Examen Final WEB-ISW-233

> Nota máxima: **70 puntos**. La calificación es la suma de los puntos
> obtenidos por sección. La nota mínima de aprobación se anuncia en clase.

## Cómo se aplica esta rúbrica

- Los **tests automáticos del CI** son condición necesaria pero no suficiente:
  hay puntos que solo se otorgan en revisión humana (justificación de patrones,
  separación real de responsabilidades, calidad de los nombres BEM, etc.).
- Si el **CI está rojo** al cierre del examen, el máximo posible se reduce a
  **35 / 70**, sin importar lo que muestre el código localmente.
- Cada criterio se evalúa de forma binaria (todo o nada) salvo donde se
  indique **"parcial"**.

---

## 1. Setup del proyecto — **6 pts**

| Criterio | Pts |
|---|---|
| `tsconfig.json` válido y con `strict` activado | 1 |
| PostCSS configurado (`postcss.config.{js,ts,cjs,mjs}`) y al menos un plugin útil | 1 |
| Handlebars instalado y `.hbs` importables desde TypeScript | 1 |
| Scripts `dev`, `build`, `start` definidos y funcionando | 2 |
| Servidor en **puerto 3000** (en `dev` y en `start`) | 1 |

---

## 2. Refactor a TypeScript + Handlebars — **10 pts**

| Criterio | Pts |
|---|---|
| Todo el código fuente en `src/` es `.ts` (no quedan `.js`) | 3 |
| El `index.html` final solo tiene un punto de montaje (`<div id="app">` o equivalente) | 1 |
| Existen al menos 3 plantillas `.hbs` reutilizables (sidebar, chat, members, etc.) | 2 |
| Las plantillas usan `{{#each}}` / partials para no repetir HTML | 2 |
| Tipos de dominio (`Channel`, `Message`, `User`, ...) declarados en `src/types/` | 2 |

---

## 3. CSS con BEM — **8 pts**

| Criterio | Pts |
|---|---|
| CSS separado por bloque (un archivo `.css` por bloque BEM) | 3 |
| Uso correcto de `block__elemento` | 3 |
| Uso correcto de `block--modificador` o `block__elemento--modificador` | 2 |

---

## 4. Arquitectura MVC — **10 pts**

| Criterio | Pts |
|---|---|
| Carpeta `src/models/` con la representación del estado | 2 |
| Carpeta `src/views/` (o `src/components/`) con vistas + plantillas | 2 |
| Carpeta `src/controllers/` que orquesta modelo y vistas | 2 |
| Las vistas **no** mutan el modelo directamente (lo hacen vía controlador / Command) | 4 |

---

## 5. Mock data + capa API — **6 pts**

| Criterio | Pts |
|---|---|
| `mock/data.json` (o nested) intacto en su forma | 1 |
| `src/api.ts` existe y consume el JSON con `fetch` | 2 |
| Toda la app accede al modelo **solo** a través de `api.ts` (no hay `fetch("./mock...")` desperdigado) | 3 |

---

## 6. Router (History API) — **8 pts**

| Criterio | Pts |
|---|---|
| `src/router.ts` (o `src/utils/router.ts`) usando `pushState` | 3 |
| Escucha `popstate` y reacciona al botón "atrás" | 2 |
| Define al menos `/` y `/c/:id` y la URL cambia al seleccionar canal | 3 |

---

## 7. Reactividad: Proxy + Observer — **10 pts**

| Criterio | Pts |
|---|---|
| Estado envuelto con `new Proxy(...)` que detecta mutaciones | 4 |
| Implementación propia de Observer (`subscribe`/`notify` o `on`/`emit`) | 3 |
| El controlador **no** llama a `view.render()` después de mutar el estado — la re-render ocurre porque el observer se disparó | 3 |

> Penalización: −2 pts si se observa `view.render()` manualmente tras una mutación del modelo.

---

## 8. Patrones de diseño — **6 pts**

Patrones permitidos (cerrados): **Command**, **Factory**, **Memento**.
No se aceptan sustituciones.

- **Mínimo 2** de los 3 patrones, **máximo 3**.
- Cada patrón correctamente aplicado vale **3 pts** (todo o nada por patrón).
- El tope de la sección es **6 pts**. Implementar el 3er patrón no suma más
  allá del tope, pero **sirve de red de seguridad**: si uno de los 3 está
  mal implementado, el mejor par de los restantes es el que cuenta.
- Los puntos por patrón solo se entregan si el **bloque de justificación**
  está presente (ver abajo).

### 8.1 Command — **3 pts** (si lo eliges)

| Criterio | Pts |
|---|---|
| Existe `class SendMessageCommand` que implementa una interfaz/contrato `Command` con `execute()` | 1 |
| Existe un único `Executor` / `Invoker` con `execute(cmd)` o `run(cmd)` que es el que despacha los comandos (el controlador no llama directamente a métodos del Store para enviar) | 1 |
| Bloque `Patrón: Command / Problema que resuelve: ... / Implementación: ...` presente en el archivo correspondiente | 1 |

### 8.2 Factory — **3 pts** (si lo eliges)

| Criterio | Pts |
|---|---|
| Existe `class MessageFactory` con un método `create(authorId, text)` que devuelve un `Message` listo (con id único + timestamp formateado) | 1 |
| El resto del código **nunca** construye literales `{ id, authorId, text, time }` a mano — siempre pasa por la Factory | 1 |
| Bloque `Patrón: Factory / Problema que resuelve: ... / Implementación: ...` presente en el archivo correspondiente | 1 |

### 8.3 Memento — **3 pts** (si lo eliges)

| Criterio | Pts |
|---|---|
| Existe `class History` (o `MessagesHistory` / `Memento`) con `push(...)` y `pop(...)` que guardan/restauran snapshots inmutables de los mensajes | 1 |
| Cada vez que cambia el conjunto de mensajes se hace `history.push(...)` y existe la posibilidad real de restaurar el estado anterior (no es un `History` muerto) | 1 |
| Bloque `Patrón: Memento / Problema que resuelve: ... / Implementación: ...` presente en el archivo correspondiente | 1 |

### Reglas estrictas (penalizaciones)

- Entregar **menos de 2 patrones** implica **0 pts** en toda la sección.
- **Singleton** puede usarse como *plumbing* (bus, router, etc.) si lo
  necesita. **No cuenta** como uno de los patrones pedidos y **no suma
  puntos**, pero su uso tampoco rompe los tests ni está prohibido.
- **−2 pts**: implementar un patrón adicional fuera de los tres permitidos
  (Decorator, Strategy, etc.) presentado como si fuera calificable. Singleton
  queda fuera de esta penalización mientras se use como infraestructura.
- **−1 pt** por cada justificación que falte uno de los rótulos exactos
  (`Patrón:`, `Problema que resuelve:`, `Implementación:`).
- **0 pts** en toda la sección si Observer o Mediator son presentados
  *como si fueran* uno de los patrones — Observer ya está exigido en §7 y
  no es sustituto válido.

---

## 9. Calidad general y CI — **6 pts**

| Criterio | Pts |
|---|---|
| `npm test` pasa **localmente** | 2 |
| Workflow de GitHub Actions en **verde** sobre la rama de entrega | 3 |
| Sin warnings críticos de TypeScript (`tsc --noEmit` limpio) | 1 |

---

## Total — **70 pts**

## Penalizaciones globales

- −5 pts: copia de código entre estudiantes (sin justificación pedagógica).
- −3 pts: el `index.js` original quedó en el repo final.
- −3 pts: archivos `node_modules/`, `dist/` o `.env` commiteados.
- −2 pts: uso intensivo de `any` o `// @ts-ignore` para esquivar el tipado.
- Hasta −5 pts: nombres de variables/clases que no comunican intención.
- Pull Request no abierto contra la rama de revisión, o sin descripción clara:
  hasta −2 pts.

## Bonus (máx. **+5 pts**, no superan el techo de 70)

- **+3 pts — Edición de mensajes con `MutationObserver`:**
  - Doble-click sobre un mensaje propio activa `contenteditable` (1 pt).
  - Existe un `new MutationObserver(...)` registrado sobre el contenedor de
    mensajes y es el **cambio del DOM** (no un `blur` directo) lo que
    dispara la actualización del modelo (1 pt).
  - Existe un `EditMessageCommand` (o equivalente) despachado por el
    observer, siguiendo el mismo flujo de Commands de §8 (1 pt).
- **+1 pt:** `UndoCommand` que aprovecha el `Memento` y se dispara con `Ctrl+Z`
  (requiere haber implementado Memento en §8).
- **+1 pt:** indicador visual del estado online/away/offline reactivo.
