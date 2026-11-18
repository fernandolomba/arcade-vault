# SPEC 01 — MVP visual de Arcade Vault (5 pantallas)

> **Estado:** Implementado
> **Depende de:** ninguna (el tema visual ya está portado en `app/globals.css` y las fuentes en `app/layout.tsx`)
> **Fecha:** 2026-11-17
> **Objetivo:** Implementar en Next.js las cinco pantallas del template `references/templates/` (biblioteca, detalle, reproductor simulado, acceso y salón de la fama) con datos de ejemplo, sin ningún juego real ni backend.

---

## Por qué existe esta spec

El template en `references/templates/` es un prototipo React por CDN con router propio basado en hash. Esta spec lo traduce a la arquitectura real del proyecto (Next 16 App Router, TypeScript estricto, Tailwind v4 + CSS global ya portado) para tener un MVP navegable y fiel al diseño antes de construir juegos o backend.

---

## Alcance

**Dentro:**

- Navegación superior (`Nav`) con panel móvil, pie de página y fondo global, compartidos por todas las pantallas.
- Pantalla **Biblioteca** (`/`): hero, búsqueda por nombre, chips de categoría, grilla de 9 tarjetas con efecto tilt, estado vacío "NO HAY RESULTADOS".
- Pantalla **Detalle** (`/juegos/[id]`): portada, etiquetas, descripción, franja de estadísticas, botones de acción y tabla de mejores puntuaciones.
- Pantalla **Reproductor** (`/juegos/[id]/jugar`): HUD, marco CRT con arena decorativa, puntaje simulado que sube solo, pausa, botón FIN, modal de fin de partida con guardado de puntaje.
- Pantalla **Acceso** (`/acceso`): pestañas Iniciar sesión / Crear cuenta, botón invitado, botones sociales decorativos.
- Pantalla **Salón de la Fama** (`/salon`): pestañas por juego, podio top 3, tabla de 12 filas, fila "tu mejor marca" si hay sesión.
- Datos de ejemplo tipados: los 9 juegos del template y el generador determinista de puntuaciones `seededScores`.
- Sesión simulada y puntajes guardados en `localStorage`.
- Página 404 para ids de juego inexistentes.

**Fuera de alcance (para otras specs):**

- Cualquier juego real jugable (lógica, canvas, input de teclado o táctil).
- Backend, base de datos, API routes o autenticación real (OAuth Google/GitHub, hash de contraseñas, validación).
- Ranking global real; las puntuaciones de la tabla siguen siendo semilla determinista.
- Contador de créditos funcional (el "CRÉDITOS · 03" es texto fijo).
- Internacionalización (la UI queda solo en español).
- Tests automatizados (no hay runner configurado).
- Mostrar en el salón o el detalle los puntajes guardados en `av_scores` (solo se escriben).

---

## Modelo de datos

```ts
// lib/games.ts
export type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type AccentColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;          // slug, p. ej. "bloque-buster"
  title: string;
  short: string;
  long: string;
  cat: Category;
  cover: string;       // clase CSS existente, p. ej. "cover-bricks"
  color: AccentColor;
  best: number;
  plays: string;       // texto ya formateado, p. ej. "12.4K"
}

export const GAMES: Game[];                       // 9 juegos del template
export const CATS: ("TODOS" | Category)[];

// lib/scores.ts
export interface ScoreRow { rank: number; name: string; score: number; date: string } // date "DD/MM/2026"
export function seededScores(seed: number, count?: number): ScoreRow[]; // determinista

// lib/session.ts (cliente)
export interface SessionUser { name: string }      // máx. 10 caracteres, mayúsculas
export interface SavedScore { game: string; score: number; name: string; at: number }
```

Persistencia en `localStorage`:

- `av_user`: `SessionUser` serializado; ausente = invitado.
- `av_scores`: `SavedScore[]` serializado; se añade una entrada por cada puntaje guardado.

Convenciones:

- Los números se formatean con `toLocaleString("es-ES")`.
- Los seeds se calculan igual que en el template (`id.length * 17 + 3` en detalle, `id.length * 23 + 7` en salón) para que los datos coincidan con el diseño.
- Rutas: `/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/acceso`, `/salon`.

---

## Plan de implementación

Antes de empezar, leer en `node_modules/next/dist/docs/` las guías de App Router, `cacheComponents`, rutas dinámicas y `params` asíncronos (Next 16).

1. Crear `lib/games.ts` y `lib/scores.ts` portando `data.jsx` a TypeScript. Verificación: `npm run lint` y `npx tsc --noEmit` sin errores.
2. Crear `lib/session.ts` y `components/session-provider.tsx` (`"use client"`): contexto con `user`, `login`, `logout`, `saveScore`; lee `av_user` en `useEffect` para evitar errores de hidratación. Todas las lecturas y escrituras en `try/catch`.
3. Crear `components/nav.tsx` (cliente, usa `usePathname` para el estado activo y gestiona el panel móvil) y `components/footer.tsx`. Montarlos en `app/layout.tsx` junto con `SessionProvider`. Verificación: `npm run dev`, el nav aparece en `/`, el enlace activo se resalta y el panel móvil abre y cierra.
4. Reemplazar `app/page.tsx` por la Biblioteca: hero (servidor) + `components/library.tsx` (cliente: búsqueda, chips, estado vacío) + `components/game-card.tsx` (tilt). Verificación: filtrar por "PUZZLE" deja 1 tarjeta; buscar "zzz" muestra "NO HAY RESULTADOS".
5. Crear `app/juegos/[id]/page.tsx` (Detalle) con `generateStaticParams`, `notFound()` y `app/not-found.tsx` con estilo arcade. Verificación: `/juegos/caida` renderiza; `/juegos/xyz` muestra el 404.
6. Crear `app/acceso/page.tsx` + `components/auth-form.tsx` (cliente): pestañas, campo de correo solo en "Crear cuenta", envío que llama a `login` y redirige a `/`, botón invitado que llama a `logout` y redirige a `/`. El nav pasa a mostrar `NOMBRE ▾` (clic = cerrar sesión) cuando hay usuario.
7. Crear `app/salon/page.tsx` + `components/hall-of-fame.tsx` (cliente): pestañas por juego, podio, tabla y fila "tu mejor marca" condicionada a sesión.
8. Crear `app/juegos/[id]/jugar/page.tsx` + `components/game-player.tsx` (cliente): HUD, marco CRT, puntaje simulado con `setInterval` cada 220 ms, pausa, FIN, modal con guardado en `av_scores`, "JUGAR DE NUEVO" y "VOLVER AL VAULT".
9. Pasada responsive y de accesibilidad básica: probar 375 px, 768 px y 1280 px; `aria-label` en el botón hamburguesa; `prefers-reduced-motion` ya cubierto en `globals.css`. Ajustar `metadata` por página.

---

## Criterios de aceptación

- [ ] `npm run build` termina sin errores de TypeScript y `npm run lint` queda limpio.
- [ ] `/` muestra 9 tarjetas de juego con portada, categoría, descripción y mejor puntuación.
- [ ] Escribir en el buscador filtra las tarjetas por título sin distinguir mayúsculas.
- [ ] Cada chip de categoría filtra la grilla; "TODOS" muestra los 9 juegos.
- [ ] Un filtro sin coincidencias muestra el texto "NO HAY RESULTADOS".
- [ ] Hacer clic en una tarjeta o en su botón JUGAR navega a `/juegos/[id]`.
- [ ] `/juegos/[id]` muestra 10 filas de puntuaciones, con las tres primeras con estilo top1, top2 y top3.
- [ ] Recargar `/juegos/[id]` muestra exactamente las mismas 10 puntuaciones (determinista).
- [ ] `/juegos/inexistente` muestra la página 404.
- [ ] "▶ JUGAR AHORA" lleva a `/juegos/[id]/jugar` y "VOLVER AL VAULT" lleva a `/`.
- [ ] En el reproductor el puntaje aumenta solo; con PAUSA deja de aumentar y aparece "EN PAUSA"; REANUDAR lo reactiva.
- [ ] El botón FIN abre el modal "FIN DEL JUEGO" con el puntaje final.
- [ ] "GUARDAR PUNTUACIÓN" añade una entrada a `localStorage["av_scores"]` y muestra "PUNTUACIÓN GUARDADA".
- [ ] "JUGAR DE NUEVO" reinicia puntaje, vidas y nivel y cierra el modal.
- [ ] En `/acceso` la pestaña "CREAR CUENTA" muestra el campo de correo y "INICIAR SESIÓN" lo oculta.
- [ ] Enviar el formulario guarda `av_user` con el nombre en mayúsculas (máx. 10 caracteres), redirige a `/` y el nav muestra ese nombre.
- [ ] Con el campo usuario vacío el nombre guardado es `PLAYER1`.
- [ ] "JUGAR COMO INVITADO" borra `av_user`, redirige a `/` y el nav muestra "Iniciar Sesión".
- [ ] Tras recargar la página con sesión activa, el nav sigue mostrando el nombre sin errores de hidratación en consola.
- [ ] `/salon` muestra una pestaña por cada uno de los 9 juegos, el podio con 3 posiciones y 12 filas en la tabla.
- [ ] La fila "TU MEJOR MARCA" aparece en `/salon` solo cuando hay sesión.
- [ ] El enlace activo del nav es "Biblioteca" en `/` y `/juegos/*`, y "Salón de la Fama" en `/salon`.
- [ ] A 375 px de ancho no hay scroll horizontal y el nav muestra el botón hamburguesa con el panel lateral funcional.
- [ ] La consola del navegador no muestra errores ni warnings de React en ninguna de las cinco pantallas.

---

## Decisiones

- **Sí:** App Router con rutas reales. URLs compartibles y encaja con Next 16; el router por hash del template es un artefacto del prototipo.
- **No:** replicar el router por hash en una sola página cliente. Va contra el framework y rompe el botón atrás.
- **Sí:** sesión y puntajes mock en `localStorage` con las claves `av_user` y `av_scores` del template. Cumple "solo parte visual" y deja el contrato listo para sustituirlo por backend.
- **No:** backend o auth real ahora. Es una spec grande y distinta; mezclarla retrasa el MVP visual.
- **Sí:** reproductor simulado como en el template. Valida el flujo completo (jugar → fin → guardar) y el diseño del modal antes de tener juegos.
- **No:** reproductor estático "PRÓXIMAMENTE". Dejaría sin probar el modal y el guardado.
- **Sí:** datos tipados en `lib/` y componentes por pantalla, Server Components por defecto y `"use client"` solo donde hay estado o `localStorage`. Es lo idiomático en Next y reduce JS al cliente.
- **No:** portar los `.jsx` casi tal cual como componentes cliente. Más rápido, pero hereda globals de `window` y pierde tipado.
- **Sí:** reutilizar `app/globals.css` existente sin reescribirlo. Ya contiene el tema y las clases de componentes del template (commit "01-styles").
- **Sí:** lectura de `localStorage` en `useEffect`, nunca en el render inicial, para evitar diferencias de hidratación.
- **Sí:** el contador "CRÉDITOS · 03" queda como texto estático; no aporta valor funcional hasta que existan juegos.
- **Sí:** los botones sociales (Google, GitHub) quedan decorativos, tal como en el template.

---

## Riesgos

| Riesgo                                                                                        | Mitigación                                                                                                       |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `cacheComponents` y rutas dinámicas con `params` asíncronos cambian respecto a Next anteriores | Leer las guías en `node_modules/next/dist/docs/` antes del paso 1 y usar `generateStaticParams` para los 9 ids.   |
| `localStorage` no disponible (modo privado, bloqueado)                                        | Todas las lecturas y escrituras en `try/catch`; la app funciona como invitado sin persistir.                      |
| Diferencias de hidratación por el estado de sesión y el tilt de las tarjetas                   | Sesión leída tras montar; el tilt solo manipula `style` en eventos de ratón, nunca en el render.                 |
| Clases CSS del template ausentes en `globals.css`                                             | En cada paso, comparar visualmente con `references/templates/Arcade Vault.html` y añadir lo que falte.            |
| El `setInterval` del reproductor sigue activo al salir de la pantalla                         | Limpiar el intervalo en el cleanup del `useEffect`.                                                              |

---

## Qué **no** está en esta spec

- Ningún juego real (Bloque Buster, Caída, etc.).
- Backend, base de datos, OAuth o autenticación real.
- Ranking global real y lectura de `av_scores` en el salón o el detalle.
- Créditos funcionales.
- Internacionalización.
- Tests automatizados.

Cada una de estas cosas, si se aborda, va en su propia spec.
