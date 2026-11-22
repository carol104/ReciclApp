# PrioTask — app móvil

Aplicación de reciclaje con Expo SDK 54, React Native 0.81.5, React 19.1 y TypeScript. Incluye login, registro, inicio con estadísticas, solicitudes de recolección, búsqueda externa en Google Maps, historial, puntos y recompensas de demostración. El diseño utiliza verde bosque, menta y fondos claros.

La documentación completa de **requisitos, tecnologías, instalación, uso, backend, API y solución de problemas** está en el [README principal de PrioTask](../README.md).

## Inicio rápido

Requiere Node.js 20.19.4 o superior y npm. Desde esta carpeta:

```powershell
npm ci
npm start
```

Para web: `npm run web`. Para Android: `npm run android`, con un emulador o dispositivo disponible. Para el simulador iOS: `npm run ios` en macOS con Xcode. También puedes escanear el QR con Expo Go compatible con el SDK del proyecto. No necesitas instalar Expo CLI globalmente ni configurar un backend para la demo.

## Recorrido de prueba

1. Crea una cuenta con nombre, correo y contraseña de al menos 6 caracteres.
2. En **Recolectar**, guarda una solicitud de 5 kg con una dirección, fecha desde hoy (`AAAA-MM-DD`) y horario.
3. En **Historial**, pulsa **Simular entrega completada** y confirma: obtendrás 100 puntos.
4. En **Inicio**, consulta tus kilos, puntos, entregas y progreso hacia 10 kg.
5. En **Premios**, simula el canje de semillas por 100 puntos. Se descontarán del saldo y el canje quedará registrado.
6. En **Mapa**, selecciona un material y opcionalmente una ciudad; abre Google Maps para consultar resultados reales.

Las solicitudes y premios son simulaciones locales: no contactan recolectores ni entregan productos. La ilustración del mapa no usa GPS. Los datos se conservan por usuario en este dispositivo; no se sincronizan con otros equipos o con el panel. Las contraseñas se almacenan sin cifrar, únicamente como parte de la autenticación de demostración.

## Código principal

- `App.tsx`: punto de entrada, proveedores y barra de estado.
- `navigation/RootNavigator.tsx`: navegación según la sesión.
- `screens/`: login, registro y secciones de reciclaje.
- `context/AuthContext.tsx`: estado global de autenticación.
- `services/authService.ts`: cuentas y sesión mediante AsyncStorage.
- `services/recyclingService.ts`: solicitudes, estados, puntos, canjes y persistencia por usuario.
- `components/CustomInput.tsx` y `CustomButton.tsx`: controles reutilizables.
- `utils/validation.ts`: esquemas de validación con Yup.
- `tests/recycling.test.cjs`: pruebas de las reglas de reciclaje.

El punto de entrada es `expo/AppEntry`. La carpeta `app/` y algunos componentes de Expo Router pertenecen a la plantilla y no participan en el flujo activo.

## Verificación

```powershell
npx tsc --noEmit
node --test tests/recycling.test.cjs
npx expo export --platform web --platform android --output-dir dist-preview
```

La exportación genera bundles, no un APK. Para limpiar la caché utiliza `npm start -- --clear`. El script `reset-project` modifica carpetas de la plantilla y no debe utilizarse como solución de caché.

Consulta también la [guía de uso](GUIA_USO.md).
