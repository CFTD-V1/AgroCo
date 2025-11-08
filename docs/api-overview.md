## AgroCo API v1 – Resumen de Endpoints

Todas las rutas están versionadas bajo el prefijo `/api/v1`. Las rutas protegidas requieren autenticación con token Bearer de Laravel Sanctum (`Authorization: Bearer <token>`).

### Autenticación y sesión

| Método | Ruta | Autenticación | Descripción |
| --- | --- | --- | --- |
| POST | `/api/v1/register` | Pública | Crea un usuario. Validación estricta de nombre completo, documento y ocupación. |
| POST | `/api/v1/login` | Pública | Autentica con nombre completo + documento. Aplica rate limiting por IP y documento. |
| POST | `/api/v1/logout` | Token | Revoca el token actual. |
| GET | `/api/v1/me` | Token | Devuelve el perfil del usuario autenticado. |
| POST | `/api/v1/password/change` | Token | Cambia la contraseña (requiere `current_password` y `new_password`). |

### Lotes

| Método | Ruta | Autenticación | Descripción |
| --- | --- | --- | --- |
| GET | `/api/v1/lots` | Token | Lista lotes del usuario. Parámetro `include=analyses,plan` para cargar relaciones. |
| POST | `/api/v1/lots` | Token | Crea un lote (`name`, `area_ha`, `crop`, etc.). |
| GET | `/api/v1/lots/{lot}` | Token | Muestra un lote; acepta `include=analyses,plan`. |
| PUT | `/api/v1/lots/{lot}` | Token | Actualiza un lote existente. |
| DELETE | `/api/v1/lots/{lot}` | Token | Elimina un lote y sus relaciones. |

### Análisis de suelo

| Método | Ruta | Autenticación | Descripción |
| --- | --- | --- | --- |
| GET | `/api/v1/soil-analyses` | Token | Lista los análisis del usuario (`include=plan` opcional). |
| POST | `/api/v1/lots/{lot}/soil-analyses` | Token | Crea un análisis asociado al lote. Valida rangos y máximo 5 análisis por lote. |
| GET | `/api/v1/soil-analyses/{analysis}` | Token | Muestra un análisis con su plan si existe. |
| PUT | `/api/v1/soil-analyses/{analysis}` | Token | Actualiza datos del análisis. |
| DELETE | `/api/v1/soil-analyses/{analysis}` | Token | Borra el análisis (y el plan asociado). |

### Planes de fertilización

| Método | Ruta | Autenticación | Descripción |
| --- | --- | --- | --- |
| POST | `/api/v1/soil-analyses/{analysis}/plan/generate` | Token | Genera/actualiza el plan con PDF. Envía correo si el usuario tiene e-mail verificado. |
| GET | `/api/v1/fert-plans/{plan}/download/{token}` | Link firmado | Descarga el PDF usando token y firma temporal. |

### Chatbot y recursos auxiliares

| Método | Ruta | Autenticación | Descripción |
| --- | --- | --- | --- |
| POST | `/api/v1/assistant/chat` | Token | Devuelve respuesta del chatbot contextual. |
| GET | `/api/v1/rice/requirements` | Pública | Lee requerimientos configurados en `config/nutrients.php`. |

### Notas

- **Throttle**: el login tiene límites por IP y documento (ver `AuthController`).
- **Descargas firmadas**: los links de planes expiran (24h por defecto) y verifican token único.
- **Pruebas**: ver `tests/Feature` para ejemplos completos de uso.

