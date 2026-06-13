# Épica 4 — Comprar boleto 🔥 (el corazón: inventario atómico + k6)

> **Cómo leer este doc:** va el **QUÉ** y el **PARA QUÉ**, con *pistas* del CÓMO.
> Lo marcado con 🧠 lo decides tú. (Leyenda completa en el `README`.)

---

## Objetivo
Un usuario compra uno o más boletos, y el sistema **nunca vende más que el cupo**,
aunque 500 personas compren **al mismo tiempo**. Aquí resolvemos la **sobreventa**.

## Por qué es la Épica 4
Es el **corazón del proyecto** y la razón de ser de Redis aquí. La sobreventa es una
**race condition** clásica (un *check-then-write* que no es atómico). Esta es la épica
donde de verdad aprendes concurrencia, y donde **k6 te muestra el bug con tus ojos** y
luego lo ves desaparecer.

## Alcance
**Entra:**
- `POST /events/:id/buy`.
- Decremento **atómico** del inventario en Redis.
- Rechazo limpio cuando se agota ("sold out", no un 500).
- Prueba de carga con **k6** que demuestre **0 sobreventa**.

**NO entra:**
- Pago real (Épica 6), reserva con cronómetro (Épica 5: aquí la compra es "instantánea"),
  correo.

## Criterios de aceptación
- [ ] Con cupo `N` y ~500 compradores simultáneos (k6), se venden **exactamente N**.
- [ ] Al agotarse, los demás reciben un error claro, no un error 500.
- [ ] El inventario en Redis es la **fuente de verdad** del "cuántos quedan" durante la venta.
- [ ] *(Bonus)* El conteo de Redis se concilia con la DB (la verdad persistente).

## Pistas técnicas — aquí está la chicha
- **Hazlo mal primero, a propósito:** lee cupo → `if cupo > 0` → guarda. Lanza k6 y
  **verás la sobreventa** (vende >N). *Medir el bug es media lección.*
- El arreglo base: ⭐ **`DECR` / `DECRBY`** sobre un contador (`stock:event:123`). Es
  **atómico**: nunca se pisa con otro. Si el resultado queda **< 0**, te pasaste →
  rechazas y haces `INCR` de vuelta para "devolver" el boleto.
- 🧠 Detalle fino: ¿qué pasa si decrementas en Redis pero **falla** guardar en la DB?
  Piensa el **orden** de las operaciones y cómo reconcilias. (No hay magia, es diseño.)
- Subir de nivel: un **script Lua** que "checa y decrementa" en **una sola** operación
  atómica del lado de Redis. 🧠 Opcional, pero es 💼 oro de entrevista.
- Compara con **SQS** (de tu `AWS.md`): la cola **serializa** las compras (una a la vez)
  y también evita sobreventa, pero asíncrono (el user espera/poll). Redis atómico es
  **síncrono e instantáneo**. 🧠 Saber cuándo cada uno = nivel senior.
- ⚠️ **NO uses un lock** (Redlock) si un `DECR` basta. Los locks son más lentos y más
  fáciles de romper. El **contador atómico** es la herramienta correcta aquí.

💼 **Para entrevista:** "race condition en check-then-write", "operación atómica vs lock",
"Redis es single-threaded, por eso el `DECR` es seguro", "lo probé con k6 y medí la
sobreventa". Con contar bien esta épica, ganas muchas entrevistas de backend.

## Cómo lo probarías (k6 es protagonista)
- Script de k6 con muchos VUs golpeando `/buy` de un evento con cupo chico (ej. 100).
- 🧠 ¿Cómo cuentas cuántos se vendieron **de verdad** para comprobar que no pasó de 100?
  (sumar los `200 OK`, o revisar el estado final.)
- Corre k6 **dos veces**: contra la versión con bug (ves >100) y contra la arreglada
  (exacto 100). **Guarda ambos resultados** — es tu evidencia y tu historia de entrevista.

## Decisiones abiertas (para ti) 🧠
1. ¿`DECR` simple o script Lua? ¿Por qué?
2. ¿Quién carga el inventario inicial a Redis y cuándo? (al crear el evento, o *lazy*)
3. ¿Cómo reconcilias Redis (rápido) con la DB (persistente)?
4. ¿Dejas comprar varios boletos de un jalón? (`DECRBY n` y manejar "no alcanzan").
