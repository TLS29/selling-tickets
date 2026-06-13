# Épica 2 — Auth con Cognito

> **Cómo leer este doc:** va el **QUÉ** y el **PARA QUÉ**, con *pistas* del CÓMO.
> Lo marcado con 🧠 lo decides tú. (Leyenda completa en el `README`.)

---

## Objetivo
Los usuarios pueden **registrarse e iniciar sesión**, y la API **protege rutas**
verificando su identidad. Reemplazamos el organizador *stubeado* de la Épica 1
por auth real con **AWS Cognito**.

## Por qué es la Épica 2
En la Épica 1 hardcodeamos el organizador para no bloquear el flujo de crear evento.
Ahora que eso ya jala, metemos auth real. Rebanada vertical:
`registro/login → token → middleware que protege endpoints`.

## Alcance
**Entra:**
- Signup / login vía Cognito y obtención de un **JWT**.
- Middleware en Express que **valida el JWT**.
- Proteger `POST /events`: solo un usuario autenticado lo puede llamar.
- Que el handler sepa **quién** hizo el request (el `sub`/email del token).

**NO entra:**
- Roles/permisos finos, social login (Google/FB), MFA. (Se mencionan como "después".)

## Criterios de aceptación
- [ ] Un usuario puede registrarse y confirmar su cuenta.
- [ ] Un usuario puede loguearse y recibir un JWT.
- [ ] `POST /events` rechaza requests sin token válido (401).
- [ ] Un endpoint protegido sabe qué usuario hizo el request.

## Pistas técnicas (no son órdenes)
- Concepto clave: **User Pool** = directorio de usuarios; te da el JWT al loguear.
  (Existe también el *Identity Pool*, que cambia el JWT por credenciales AWS; 💼 saber
  la diferencia te hace ver bien, pero aquí solo necesitas el User Pool.)
- 🧠 ¿Usas la **Hosted UI** de Cognito (más rápido) o tu propio formulario con el **SDK**
  (aprendes más)? Para tu meta de aprender, el SDK te enseña qué pasa por dentro.
- ⭐ El corazón del backend: un **middleware que valida el JWT**. No "confías" en el token:
  **verificas su firma** contra las **JWKS** públicas del pool (Cognito las expone en una URL).
  Hay lib oficial (`aws-jwt-verify`); 🧠 decide si la usas o lo armas a mano para entender.
- Analogía Express: es como un middleware de `passport`, pero la verdad de "quién eres"
  la firma Cognito, no tu server.
- 🧠 ¿Dónde vive el middleware en tu hexagonal? (Pista: es detalle de `interfaces/http`.
  El **dominio no debería saber** que existe Cognito.)
- Para correr sin desplegar: usa un User Pool real (free tier es generoso) desde tu
  Express **local**. Validas tokens reales sin subir nada a la nube.

💼 **Para entrevista:** "User Pool vs Identity Pool", "validar el JWT verificando la firma
contra las JWKS", "auth como middleware, fuera del dominio". Muy preguntado en Node.

## Cómo lo probarías
- Login → copia el JWT → mándalo en `Authorization: Bearer ...` a `POST /events`.
- Prueba **sin** token y con uno falso/vencido: debe rechazar (401).
- 🧠 ¿Un test del middleware con un token firmado de mentira? Decide tú.

## Decisiones abiertas (para ti) 🧠
1. ¿Hosted UI o SDK propio?
2. ¿Validas el JWT a mano o con `aws-jwt-verify`?
3. ¿Dónde dejas el `userId` en el request para que los handlers lo usen?
4. ¿Ya distingues "organizador" vs "comprador", o todos son iguales por ahora?
