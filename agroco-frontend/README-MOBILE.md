AgroCo móvil (Android) con Capacitor
====================================

Requisitos
- Node 18+ y npm
- Android Studio + SDKs

Instalación de Capacitor (una sola vez)
1. Instala dependencias de Capacitor y Android:
   - npm i @capacitor/core @capacitor/cli @capacitor/android
2. Inicializa Capacitor (si aún no lo hiciste):
   - npx cap init AgroCo com.agroco.app --web-dir=dist/agroco-frontend
3. Agrega la plataforma Android:
   - npx cap add android

Build y sincronización
1. Compila Angular (producción):
   - npm run build -- --configuration production
2. Copia web al proyecto nativo:
   - npx cap copy
3. Abre Android Studio:
   - npx cap open android

Red/API (importante)
- Emulador: usa http://10.0.2.2:8000 como base del backend (equivale a localhost del host).
- Dispositivo físico: usa la IP LAN de tu PC, p. ej. http://192.168.1.50:8000
- Si el backend es HTTP (no HTTPS):
  - En AndroidManifest.xml agrega dentro de <application>:
    android:usesCleartextTraffic="true"
  - O define una Network Security Config para tus dominios/IPs.
- CORS en Laravel: permite orígenes capacitor://localhost, http://localhost, http://10.0.2.2 y/o tu IP LAN.

Iteración
- Tras cambios en Angular:
  - npm run build && npx cap copy (o npx cap sync)
- Depuración:
  - chrome://inspect/#devices (WebView) + Logcat en Android Studio.

