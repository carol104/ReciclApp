# ProyectoResiduos-Admin

Módulo administrativo para gestión de alertas y notificaciones push ciudadanas.

## Incluye
- API admin para crear, editar, cancelar y despachar alertas.
- API pública para registrar tokens de dispositivos móviles.
- Envío push con Expo Push API.
- Alertas configurables (severidad, tags, fecha programada, expiración, estado).
- Scheduler automático (cada minuto) para enviar alertas programadas.
- Panel web funcional en `/`.

## Requisitos
- Node.js 18+

## Configuración
1. Copia entorno:

```bash
Copy-Item .env.example .env
```

2. Instala dependencias:

```bash
npm install
```

3. Ejecuta en desarrollo:

```bash
npm run dev
```

Servidor por defecto: `http://localhost:4100`

## Seguridad básica
Las rutas admin requieren header:

- `x-admin-key: <ADMIN_API_KEY>`

## Endpoints
### Público
- `POST /api/public/device-tokens`
- `GET /api/public/alerts/active`

### Admin
- `GET /api/admin/alerts`
- `POST /api/admin/alerts`
- `PATCH /api/admin/alerts/:id`
- `POST /api/admin/alerts/:id/dispatch`
- `POST /api/admin/notifications/send`

## Ejemplo rápido de alerta
```json
{
  "title": "Contenedor saturado en Centro",
  "message": "Evita la zona del parque central por acumulación de residuos.",
  "severity": "critical",
  "scheduledFor": "2026-03-23T18:30:00.000Z",
  "expiresAt": "2026-03-24T00:00:00.000Z",
  "tags": ["centro", "ciudadanos"],
  "sendPush": true,
  "status": "scheduled"
}
```
