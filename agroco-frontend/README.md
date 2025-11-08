# AGROCO Frontend (Angular)

Frontend Angular para el backend Laravel del proyecto AGROCO.

## Requisitos

- Node.js 18+
- Backend corriendo en `http://localhost:8000` (o ajusta `src/environments`)

## Configuración y arranque

1) Instalar dependencias:

```
npm install
```

2) Ajustar URL del API si es necesario:

Edita `src/environments/environment.development.ts:1` y/o `src/environments/environment.ts:1` con tu `apiUrl`.

3) Iniciar en desarrollo:

```
npm start
```

Abre `http://localhost:4200`.

## Funcionalidades

- Autenticación (registro, login, logout, perfil, cambio de contraseña)
- Gestión de lotes (listar, crear, editar, eliminar)
- Análisis de suelo (listar, crear) y generación de plan de fertilización (descarga PDF con link firmado)
- Requerimientos del arroz leídos desde el backend
- Asistente virtual en burbuja tipo Messenger
- UI limpia con animaciones de fondo (campo de arroz)

## Comandos

- `npm start` → `ng serve`
- `npm run build` → Compila a `dist/agroco-frontend`

## Notas

- El token se guarda en `localStorage` como `agroco_token` y se envía como `Authorization: Bearer <token>`.
- CORS en el backend debe permitir el origen del front. En este repo viene abierto por defecto.
