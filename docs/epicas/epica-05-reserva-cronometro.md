# Épica 5 — Reserva con cronómetro (hold / `SET NX EX`)

> **Cómo leer este doc:** va el **QUÉ** y el **PARA QUÉ**, con *pistas* del CÓMO.
> Lo marcado con 🧠 lo decides tú. (Leyenda completa en el `README`.)

---

## Objetivo
Cuando un usuario elige boletos, se le **reservan temporalmente** (ej. 10 min) mientras
completa la compra. Si no termina a tiempo, los boletos **se liberan solos** y vuelven a
estar disponibles. Es el **cronómetro estilo Ticketmaster**.

## Por qué es la Épica 5
Refina la compra de la Épica 4. Ahí la compra era instantánea; en la realidad hay un paso
intermedio: `elegir → reservar → pagar`. Aquí aprendes el patrón **reservation/hold** con
**expiración automática**, que es Redis puro y muy elegante.

## Alcance
**Entra:**
- Reservar boletos por un tiempo (`POST .../hold`).
- Liberación **automática** al expirar (sin un cron manual).
- Confirmar la reserva al momento de comprar.

**NO entra:**
- El pago en sí (Épica 6).

## Criterios de aceptación
- [ ] Al reservar, esos boletos ya **no están disponibles** para otros.
- [ ] Si el usuario no compra a tiempo, se liberan **solos** (sin que tú barras nada).
- [ ] Dos usuarios **no** pueden reservar el mismo asiento/cupo a la vez.

## Pistas técnicas (no son órdenes)
- ⭐ Comando estrella: **`SET clave valor NX EX <segundos>`**. 🧠 Descífralo:
  - `NX` = "solo si **no** existe" → eso es un **lock atómico**: el primero gana, el
    segundo falla. Resuelve el "dos a la vez".
  - `EX` = expira solo → eso te da la **liberación automática gratis**, sin cron job.
- Diferencia con la Épica 4: ahí decrementabas un **contador** (boletos sin asiento).
  Aquí, si hay **asientos específicos**, reservas **cada asiento** con su propia clave
  (`seat:event123:A12`). 🧠 ¿Tu evento es por **cupo** o por **asiento**? Cambia el diseño.
- El `EX` resolviendo el **carrito abandonado** sin que tú hagas nada es la parte bonita.
  Antes de Redis esto pedía un job que barriera reservas viejas. 🧠 Aprecia por qué es elegante.
- ⚠️ Caso trampa: el usuario paga **justo** cuando la reserva expira. Piensa la condición
  de carrera entre "confirmar" y "expirar".

💼 **Para entrevista:** "`SET NX` como lock distribuido", "TTL para auto-liberar sin cron",
"el patrón de reserva con expiración". Muy preguntado en sistemas de booking/inventario.

## Cómo lo probarías
- Reserva → verifica que **otro no puede** → espera el TTL → verifica que **ya se liberó**.
- 🧠 ¿k6 para simular muchos reservando a la vez? Buena idea para ver el `NX` trabajando.

## Decisiones abiertas (para ti) 🧠
1. ¿Cupo general o **asientos específicos**?
2. ¿Cuánto dura la reserva? ¿Por qué ese tiempo?
3. ¿Qué pasa si pagan en el **límite exacto** del TTL?
4. ¿La reserva descuenta del inventario de la Épica 4, o es un nivel aparte?
