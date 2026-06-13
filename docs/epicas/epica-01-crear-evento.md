# Épica 1 — Crear y publicar un evento

> **Cómo leer este doc:** aquí va el **QUÉ** y el **PARA QUÉ**, con *pistas* del CÓMO.
> No es una lista de pasos a obedecer. Las decisiones marcadas con 🧠 son **tuyas**:
> ahí es donde sueltas las rueditas y resuelves como tú lo verías.

---

## Objetivo
Un organizador puede **crear un evento con un cupo definido de boletos** y dejarlo
guardado en el sistema. Es la base sobre la que después se venden boletos.

## Por qué es la Épica 1 (y no "configurar la DB")
Es la **rebanada vertical** más delgada que ya entrega algo funcional de punta a punta:
`HTTP → dominio → persistencia`. No partimos por capas ("épica de infra", "épica de
dominio"); partimos por **una funcionalidad completa que se puede demostrar**.

> ⚠️ **Aquí NO hay concurrencia.** Nadie pelea por un evento al crearlo.
> Por lo tanto **NO metas Redis todavía**: sería sobre-ingeniería. Redis entra
> cuando empecemos a *vender* (Épica 3), que es donde 500 personas chocan por el
> mismo cupo.

---

## Alcance

**Entra:**
- Endpoint para crear un evento (`POST /events`, o como decidas nombrarlo).
- Modelo de dominio del evento (nombre, fecha, **cupo total**, precio…).
- Persistir el evento.
- Validación de entrada (cupo > 0, fecha futura, etc.).
- Poder leer el evento creado (`GET /events/:id`) para confirmar que quedó bien.

**NO entra (se queda para después):**
- Comprar / reservar boletos.
- Concurrencia / Redis / k6.
- Pagos, correos, login.

---

## Criterios de aceptación
- [ ] Puedo crear un evento con cupo `N` y me regresa su `id`.
- [ ] Si mando datos inválidos (cupo ≤ 0, fecha pasada), me rechaza con un error claro.
- [ ] Puedo recuperar el evento por `id` y su cupo está intacto.
- [ ] El cupo total queda guardado como la **fuente de verdad** del inventario inicial.

---

## Pistas técnicas (no son órdenes)
- Ya tienes **arquitectura hexagonal**. Lo natural: un **port** en `domain`
  (algo tipo `EventRepository`) y su **adapter** en `infra`.
  🧠 *Tú defines la forma del port.*
- Los contratos compartidos (el tipo `Evento`) pueden vivir en `packages/types`
  (`@venta/types`), que para eso está.
- Persistencia: tu `AWS.md` apunta a **DynamoDB**. 🧠 Pero para *arrancar y aprender*
  podrías usar algo más simple (incluso un repo en memoria) y migrar luego. La gracia
  de la hexagonal es que cambiar el adapter **no toca el dominio**.
- Validación: ya usas **zod** en el proyecto.
- 🧠 ¿Dónde vive la regla "el cupo no puede ser negativo": en el controller o en el
  dominio? (Hay una respuesta más limpia que la otra. Piénsalo.)

---

## Cómo lo probarías
- Un par de requests manuales: crear + leer.
- 🧠 ¿Vale un test automatizado del caso de uso aquí? Decide tú.
- **k6 todavía NO**: no hay nada concurrente que estresar. Se guarda para la épica de compra.

---

## Decisiones abiertas (para ti) 🧠
1. ¿Nombre y forma del endpoint?
2. ¿Qué campos mínimos definen un evento?
3. ¿Dónde guardas el inventario inicial y cómo lo representas?
4. ¿El `id` lo genera el dominio, la DB, o un UUID?
