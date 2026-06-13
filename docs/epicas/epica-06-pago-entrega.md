# Épica 6 — Pago + entrega del boleto (idempotencia, S3, SES)

> **Cómo leer este doc:** va el **QUÉ** y el **PARA QUÉ**, con *pistas* del CÓMO.
> Lo marcado con 🧠 lo decides tú. (Leyenda completa en el `README`.)

---

## Objetivo
El usuario **paga** y **recibe su boleto** (un PDF/QR) de forma segura. Garantizamos que
un **retry no cobre dos veces** (idempotencia) y entregamos el boleto vía **S3**.

## Por qué es la Épica 6
Cierra el flujo de compra de punta a punta. Introduce tres cosas muy del mundo real:
**idempotencia** (crítica en pagos), **almacenamiento de archivos** (S3) y
**notificaciones** (SES/email).

## Alcance
**Entra:**
- Confirmar pago (puedes **simularlo**, no necesitas pasarela real).
- Generar el boleto (PDF/QR) y guardarlo en **S3**.
- Dar acceso al boleto vía **presigned URL**.
- **Idempotencia** para no doble-cobrar.
- *(Opcional)* mandarlo por correo con **SES**.

**NO entra:**
- Integración real con Stripe/pasarela, antifraude.

## Criterios de aceptación
- [ ] Si el mismo request de pago llega dos veces (retry), se procesa **una sola vez**.
- [ ] El boleto se guarda en S3 y el usuario lo descarga con un **link temporal**.
- [ ] El bucket **no** es público.

## Pistas técnicas (no son órdenes)
- **Idempotencia con Redis:** el cliente manda un `Idempotency-Key` único; tú haces
  `SET key NX` 🧠 — si **ya existía**, es un duplicado, **no reproceses**. (Es el mismo
  `NX` de la Épica 5, otro uso. ¿Ves cómo el patrón se repite?)
- **S3:** ⚠️ **nunca** hagas el bucket público. El concepto correcto es ⭐ **presigned URL**:
  generas un link **firmado y temporal** para que el user **suba o baje directo a S3**
  sin pasar por tu server ni exponer credenciales. *Este es EL concepto de S3 de entrevista.*
- 🧠 ¿Generas el PDF/QR en tu server y lo subes, o el front sube algo? Para boletos, lo
  generas tú.
- **SES:** mandar el correo con el link. Pennies. 🧠 Opcional para el MVP — el boleto en
  S3 ya es entregable sin correo.
- En hexagonal: "guardar archivo" y "mandar correo" son **ports** con adapters S3/SES.
  🧠 El **dominio** dice "entrega el boleto"; **no sabe** que por debajo es S3.

💼 **Para entrevista:** ⭐ **presigned URLs** (subir/bajar sin exponer credenciales),
"bucket privado siempre", e **idempotencia en pagos con una key + `SET NX`**. Estos tres
te hacen ver con experiencia real.

## Cómo lo probarías
- Manda el pago **dos veces** con la misma key → confirma **un solo** cargo.
- Sube un boleto → genera la presigned URL → ábrela → confirma que el acceso **directo**
  al bucket está cerrado.

## Decisiones abiertas (para ti) 🧠
1. ¿Simulas el pago o integras una pasarela en sandbox?
2. ¿Dónde se genera el `Idempotency-Key`, front o back?
3. ¿PDF, QR, o ambos? ¿Quién los genera?
4. ¿Entregas solo por S3, o también por SES?
