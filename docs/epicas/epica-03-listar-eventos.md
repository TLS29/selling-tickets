# Épica 3 — Ver / listar eventos (primer Redis: caché)

> **Cómo leer este doc:** va el **QUÉ** y el **PARA QUÉ**, con *pistas* del CÓMO.
> Lo marcado con 🧠 lo decides tú. (Leyenda completa en el `README`.)

---

## Objetivo
El público puede **ver la lista de eventos y el detalle** de uno. Como es lectura
pesada (mucha gente viendo, pocos cambios), introducimos **caché con Redis** para no
pegarle a la base de datos en cada request.

## Por qué es la Épica 3
Tu **primer contacto con Redis**, a propósito **suave y de bajo riesgo**: caché de lectura.
Si el caché falla, a lo mucho lees de la DB (lento, pero **no incorrecto**). Aquí agarras
la mecánica de Redis (conexión, `get`/`set`, TTL, serializar JSON) **sin** el estrés de la
concurrencia, que llega en la Épica 4.

## Alcance
**Entra:**
- `GET /events` (lista) y `GET /events/:id` (detalle).
- Caché en Redis con **TTL**.
- Estrategia de invalidación básica.

**NO entra:**
- El "quedan exactamente X boletos" en tiempo real (eso es de la compra; aquí el cupo
  puede venir cacheado/aproximado).

## Criterios de aceptación
- [ ] El segundo request al mismo recurso responde **desde caché** (más rápido).
- [ ] El caché **expira solo** (hay TTL).
- [ ] Si creo/edito un evento, el cambio se refleja en un tiempo razonable.

## Pistas técnicas (no son órdenes)
- ⭐ Patrón estrella: **cache-aside** (lazy loading). El flujo: busca en Redis → si está
  (*hit*), regresa → si no (*miss*), lee DB, **guarda en Redis con TTL**, regresa.
  🧠 *Tú escribes ese flujo.*
- Comandos que rondan: `GET`, `SET clave valor EX <segundos>`. Guardas **JSON serializado**.
- 🧠 La pregunta difícil de caché: **invalidación**. ¿Confías solo en el TTL (simple, pero
  puede mostrar datos viejos unos segundos) o invalidas al editar (más fresco, más complejo)?
  No hay respuesta única — decide y **justifica** por qué.
- En tu hexagonal: el caché es **detalle de infra**. 🧠 ¿Lo metes como un adapter que
  *envuelve* al repo (patrón decorator) o lo llamas desde el caso de uso? Piensa cuál
  ensucia menos el dominio.
- Local: el mismo `docker run -p 6379:6379 redis`. Una sola instancia basta.

💼 **Para entrevista:** "cache-aside", "TTL vs invalidación activa", y "el caché **nunca**
es la fuente de verdad, solo una copia rápida". Frases que te posicionan.

## Cómo lo probarías
- Pega **dos veces** al detalle y compara la latencia (la 2ª debe ser más rápida).
  🧠 ¿Cómo lo demuestras? (un log del tiempo, o checar si pegó a la DB.)
- 🧠 ¿k6 aquí? Podrías, para ver el caché aguantando lecturas. Pero el k6 que de verdad
  importa es el de la Épica 4.

## Decisiones abiertas (para ti) 🧠
1. ¿TTL de cuántos segundos? ¿Por qué ese número?
2. ¿Invalidación por TTL o activa al editar?
3. ¿Caché como *decorator* del repo o dentro del caso de uso?
4. ¿Qué `key` usas? (`event:123`, `events:list`…)
