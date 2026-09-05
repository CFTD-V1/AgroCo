# AGROCO

**Plataforma web + app movil para la gestion de lotes agricolas y generacion de planes de fertilizacion optimizados para el cultivo de arroz.**

![Laravel](https://img.shields.io/badge/Laravel-10-red) ![PHP](https://img.shields.io/badge/PHP-8.1%2B-777BB4) ![Angular](https://img.shields.io/badge/Angular-18-DD0031) ![Capacitor](https://img.shields.io/badge/Capacitor-7-119EFF) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192)

---

## Que es AgroCo y para que sirve

AgroCo es un sistema integral desarrollado para pequeños y medianos agricultores de arroz. Centraliza en un solo lugar toda la información productiva del agricultor y convierte los resultados de un **analisis de suelo de laboratorio** en un **plan de fertilizacion concreto y accionable**.

El problema que resuelve: los planes de fertilizacion suelen ser genericos o dificiles de interpretar. AgroCo los calcula con base en las propiedades reales del suelo (pH, CEC, saturacion de bases, macro y micronutrientes) y la meta de rendimiento del agricultor, y entrega:

- Las **dosis objetivo** de nutrientes (N, P2O5, K2O, S, Ca, Mg y micronutrientes).
- **Productos comerciales recomendados** (urea, DAP, KCl, yeso, cal, kieserita, etc.) en kg/ha.
- Un **cronograma de aplicacion por fases fenologicas** (siembra, macollamiento, espigamiento).
- El plan en **PDF descargable** con link firmado y con vencimiento.
- Una **asistente virtual** (chatbot) con respuestas contextuales sobre el cultivo.

## Funcionalidades principales

### Autenticacion y usuarios

- Registro con validacion estricta de documento (CC/CE/TI/PAS/NIT), nombre completo y ocupacion.
- Login con asignacion de token Bearer (Laravel Sanctum) y rate limiting por IP/documento.
- Perfil con foto de avatar, cambio de contrasena y datos de contacto.
- Panel de administracion por rol (`is_admin`): usuarios, analisis, planes y resumen general.

### Gestion de lotes

- CRUD completo de lotes: nombre, area (ha), cultivo, fecha de siembra y mas.

### Analisis de suelo

- Registro manual de analisis hasta **5 por lote**.
- Campos completos: pH, CEC, conductividad electrica, materia organica, P, S, cationes de intercambio (Ca, Mg, K, Na), micronutrientes (B, Fe, Cu, Mn, Zn), saturacion de bases y meta de rendimiento.

### Planes de fertilizacion

- Motor de calculo propio (`FertilizationCalculator`) con logica agronomica (detalles en la seccion de arquitectura).
- Generacion de PDF via `dompdf` y **descarga con link firmado** (`signed`) que expira en 24 horas.

### Asistente virtual (chatbot)

- Deteccion de intenciones por palabras clave (config `<repo>/agroco-backend/config/chatbot.php`).
- Historial de conversacion, sugerencias de preguntas y respuestas contextuales por usuario.

### Precio del mercado del arroz

- Endpoint que consulta precios del arroz en COP/tonelada, con cache, conversion de unidades (kg, carga), historial de 120 dias y valor de respaldo automatico.

## Tecnologias utilizadas

### Backend - `agroco-backend/`

- **PHP 8.1+** con **Laravel 10**.
- **Laravel Sanctum** para autenticacion por tokens.
- **PostgreSQL** como base de datos (compatible con SQLite en pruebas).
- **barryvdh/laravel-dompdf** para generacion de PDF.
- **maatwebsite/excel** y **PhpSpreadsheet** para exportaciones en Excel.
- **Laravel Lang**, **Guzzle** y **PHPUnit** para pruebas de funcionalidad (Feature tests).

### Frontend - `agroco-frontend/`

- **Angular 18** con **TypeScript** y **RxJS**.
- **SCSS**, animaciones de fondo y diseno responsive.
- **Capacitor 7** para compilacion a **app Android nativa**.

## Estructura del proyecto

```
AgroCo/
├── agroco-backend/                 # API REST (Laravel 10)
│   ├── app/
│   │   ├── Http/Controllers/       # Auth, Lot, SoilAnalysis, FertilizerPlan, Chatbot, Admin, Recommendation
│   │   ├── Models/                 # User, Lot, SoilAnalysis, FertilizerPlan, ChatMessage
│   │   └── Services/
│   │       ├── FertilizationCalculator.php   # Motor agronomico de fertilizacion
│   │       └── Chatbot/ChatbotService.php    # Asistente virtual por intents
│   ├── config/
│   │   ├── nutrients.php           # Objetivos nutricionales y fuentes de fertilizantes
│   │   └── chatbot.php             # Intenciones y respuestas del chatbot
│   ├── database/
│   │   ├── migrations/             # users, lots, soil_analyses, fertilizer_plans, chat_messages, etc.
│   │   └── seeders/
│   ├── routes/api.php              # Endpoints versionados bajo /api/v1
│   └── tests/Feature/              # Pruebas de auth, lotes, analisis, plan y chatbot
├── agroco-frontend/                # SPA Angular 18 + Capacitor
│   ├── src/app/
│   │   ├── pages/                  # login, register, dashboard, lots, analyses, admin, profile
│   │   ├── services/               # api, auth, admin, toast
│   │   ├── guards/                 # auth, guest, admin
│   │   └── components/             # chat-widget, fondo animado, toast, topbar
│   └── android/                    # Proyecto Android generado por Capacitor
└── docs/
    ├── api-overview.md             # Documentacion de la API
    └── agroco-backend.postman_collection.json   # Coleccion Postman
```

## Motor de fertilizacion (como calcula)

El `FertilizationCalculator` (en `app/Services/FertilizationCalculator.php`) construye el plan a partir del analisis de suelo:

1. **Nitrogeno (N)**: segun la meta de rendimiento, `N = 80 + 5 x rendimiento (t/ha)`, redondeado a multiplos de 5 y con minimo de 60 kg/ha.
2. **Fosforo (P2O5)** y **Potasio (K2O)**: por clasificacion del suelo (bajo/medio/alto) -> 60/45/30 y 130/100/80 kg/ha respectivamente.
3. **Azufre (S)**: 20 kg/ha cuando el nivel es bajo o medio.
4. **Calcio y Magnesio**: por deficit de saturacion de bases frente a metas (% de la CEC), con limites practicos por campana.
5. **Micronutrientes (Zn, Mn, B, Cu, Fe)**: se recomiendan cuando estan bajo el nivel critico, con dosis de suelo o foliares segun el caso.
6. **Materia organica**: recomendacion de compost o abono organico cuando es menor a 3 %.
7. **Productos comerciales**: convierte las metas de nutrientes a dosis de fertilizantes comerciales usando el porcentaje de nutriente de cada fuente (`config/nutrients.php`).
8. **Cronograma**: fracciona las aplicaciones por fases fenologicas (siembra, macollamiento, espigamiento) y genera el PDF final.

## API v1 (resumen)

Prefijo `/api/v1`. Las rutas protegidas requieren autenticacion con `Authorization: Bearer <token>` (Laravel Sanctum).

| Area | Endpoints |
| --- | --- |
| **Autenticacion** | `POST /register`, `POST /login`, `POST /logout`, `GET /me`, `PUT /profile`, `POST /profile/photo`, `POST /password/change`, `GET /avatar/{user}` |
| **Lotes** | `GET|POST /lots`, `GET /lots/{lot}`, `PUT /lots/{lot}`, `DELETE /lots/{lot}` |
| **Analisis de suelo** | `GET /soil-analyses`, `POST /lots/{lot}/soil-analyses`, `GET|PUT|DELETE /soil-analyses/{analysis}` |
| **Planes de fertilizacion** | `POST /soil-analyses/{analysis}/plan/generate`, `GET /fert-plans/{plan}/download/{token}` |
| **Chatbot** | `POST /assistant/chat` |
| **Mercado** | `GET /market/rice`, `GET /market/rice/history` |
| **Recursos auxiliares** | `GET /rice/requirements` (publico) |
| **Administracion** | `GET /admin/summary`, gestion de usuarios, analisis y planes |

Referencia completa en [`docs/api-overview.md`](docs/api-overview.md) y coleccion Postman incluida en `docs/`.

## Instalacion y puesta en marcha

### Backend

```bash
cd agroco-backend
composer install
cp .env.example .env
php artisan key:generate
# Edita .env: DB_CONNECTION, DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan migrate --seed
php artisan serve          # http://localhost:8000
```

### Frontend

```bash
cd agroco-frontend
npm install
# Ajusta apiUrl en src/environments/ si tu backend no esta en localhost:8000
npm start                  # http://localhost:4200
```

### App Android (Capacitor)

```bash
cd agroco-frontend
npm run build -- --configuration production
npx cap copy && npx cap open android
```

> En el emulador Android usa `http://10.0.2.2:8000` como URL del API; en un dispositivo fisico, la IP LAN de tu PC.

## Pruebas

```bash
cd agroco-backend && php artisan test
```

Las pruebas de funcionalidad cubren autenticacion y seguridad, validacion de lotes, validacion de analisis de suelo, generacion de planes de fertilizacion y el chatbot.

## Licencia

MIT