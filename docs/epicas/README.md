# Roadmap de épicas — Venta de boletos

Proyecto de aprendizaje: construir un sistema de venta de boletos que **no se sobrevenda**
bajo alta concurrencia, aprendiendo **Redis**, un poco de **AWS** (Cognito + S3) y
**k6** en el camino.

## Cómo se cortaron las épicas
En **rebanadas verticales**: cada épica atraviesa todas las capas
(`HTTP → dominio → persistencia`) y entrega **una funcionalidad demostrable**.
No partimos por capas técnicas ("épica de infra", "épica de dominio"). Por eso las
herramientas (Redis, AWS) **entran cuando una feature las necesita**, no "porque sí".

| # | Épica | Estado | Lo nuevo que introduce |
|---|---|---|---|
| 1 | [Crear y publicar un evento](./epica-01-crear-evento.md) | 📝 listo | Base, **sin** Redis |
| 2 | [Auth con Cognito](./epica-02-auth-cognito.md) | 📝 listo | User Pool, JWT, middleware que valida el token |
| 3 | [Ver / listar eventos](./epica-03-listar-eventos.md) | 📝 listo | Primer Redis: **caché** (lectura, bajo riesgo) |
| 4 | [Comprar boleto](./epica-04-comprar-boleto.md) 🔥 | 📝 listo | **Inventario atómico** (`DECR`) + **k6** |
| 5 | [Reserva con cronómetro](./epica-05-reserva-cronometro.md) | 📝 listo | Patrón *hold*: `SET NX EX` |
| 6 | [Pago + entrega del boleto](./epica-06-pago-entrega.md) | 📝 listo | Idempotencia, **S3** (presigned URL), SES |

## Leyenda de símbolos
- 🧠 **Decisión tuya** — aquí sueltas las rueditas y resuelves como tú lo verías.
- 💼 **Para entrevista** — concepto que sí preguntan; sábelo explicar.
- ⭐ **Concepto estrella** — el más importante del tema.
- ⚠️ **Trampa** — un caso fácil de romper, piénsalo.

## Cómo trabajar esto
1. **Una épica a la vez**, en orden. Cada una se construye sobre la anterior.
2. **Redis: local primero.** `docker run -p 6379:6379 redis`. Aprende la mecánica
   sin el setup de AWS encima.
3. **AWS: solo Cognito y S3**, y al final / cuando la feature lo pida. No mezcles
   "aprender Redis" con "aprender AWS" el mismo día.
4. El doc te da el **QUÉ**; el **CÓMO (el código) lo escribes tú**. Esa es la meta.
