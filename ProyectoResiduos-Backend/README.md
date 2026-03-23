# ProyectoResiduos-Backend

Backend en Express + TypeScript (arquitectura Clean) para autenticación (register/login) usando PostgreSQL.

## Requisitos
- Node.js 18+ (recomendado 20+)
- PostgreSQL

## Configuración
1) Copia el archivo de entorno:

- Windows (PowerShell): `Copy-Item .env.example .env`

2) Edita `.env` con tu `DATABASE_URL` y `JWT_SECRET`.

3) Instala dependencias:

- `npm install`

4) Ejecuta en desarrollo:

- `npm run dev`

## Endpoints
- `POST /auth/register` { fullName, email, password }
- `POST /auth/login` { email, password }

Responden con `{ token, user }`.
