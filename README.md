# SpendWise — Gestor de Gastos

Aplicación web para registrar ingresos y egresos personales en quetzales (Q), con dashboard de gráficas, inicio de sesión con correo/contraseña y con Google.

- **Frontend:** Angular 22 (standalone components + signals), Chart.js
- **Backend:** Node.js + Express 5 + TypeScript
- **Base de datos:** PostgreSQL con Prisma 7

```
Gestor_De_Gastos_Final/
├── backend/    API REST (autenticación y transacciones)
├── frontend/   Aplicación Angular
└── docs/       Manuales de usuario
```

## Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | **22.22.3 o superior**, o Node 24 LTS (Angular 22 no arranca con versiones anteriores) |
| pnpm | **10** o superior (`npm install -g pnpm@10`) |
| PostgreSQL | 14 o superior, con una base creada llamada `gestor_de_gastos` |

## 1. Configurar Google (una sola vez)

1. Entrar a [Google Cloud Console](https://console.cloud.google.com/) → **APIs y servicios** → **Credenciales**.
2. Abrir el **ID de cliente de OAuth 2.0** (tipo *Aplicación web*).
3. En **Orígenes de JavaScript autorizados** agregar:
   - `http://localhost:4200`
   - `http://localhost`
4. Guardar. Los cambios pueden tardar unos minutos en aplicarse.
5. Copiar el **ID de cliente** y ponerlo en los dos lugares (deben ser idénticos):
   - `backend/.env` → `GOOGLE_CLIENT_ID`
   - `frontend/src/environments/environment.ts` → `googleClientId`

> Si el botón de Google muestra un error como *"origin not allowed"* o *"The given origin is not allowed"*, falta el paso 3.

## 2. Backend

```bash
cd backend
pnpm install
cp .env.example .env        # en Windows: copy .env.example .env
```

Editar `backend/.env` con los datos reales (usuario/contraseña de PostgreSQL, una `JWT_SECRET` larga y aleatoria, y el `GOOGLE_CLIENT_ID`).

Luego crear las tablas y generar el cliente de Prisma:

```bash
pnpm prisma migrate dev     # aplica la migración y genera el cliente
pnpm dev                    # servidor en http://localhost:3000 (se reinicia al guardar)
```

> **Si ya tenía la base de datos de la versión anterior**, la estructura cambió. Ejecute `pnpm prisma migrate reset` (borra los datos de prueba y crea todo de nuevo).

Verificar que funciona: abrir http://localhost:3000/api/health → debe responder `{"status":"ok"}`.

## 3. Frontend

En otra terminal:

```bash
cd frontend
pnpm install
pnpm start                  # http://localhost:4200
```

## Endpoints de la API

| Método | Ruta | Descripción | Requiere token |
|---|---|---|---|
| POST | `/api/auth/register` | Crear cuenta (`username`, `email`, `password`) | No |
| POST | `/api/auth/login` | Iniciar sesión (`email`, `password`) | No |
| POST | `/api/auth/google` | Iniciar sesión / registrarse con Google (`credential`) | No |
| GET | `/api/auth/me` | Datos del usuario actual | Sí |
| GET | `/api/transactions` | Listar transacciones del usuario | Sí |
| POST | `/api/transactions` | Crear transacción | Sí |
| PUT | `/api/transactions/:id` | Editar transacción | Sí |
| DELETE | `/api/transactions/:id` | Eliminar transacción | Sí |

Cuerpo de una transacción:

```json
{
  "descripcion": "Supermercado",
  "monto": 250.75,
  "tipo": "egreso",
  "categoria": "Alimentación",
  "fecha": "2026-09-20"
}
```

El token se envía en el header `Authorization: Bearer <token>`.

## Cómo funciona el inicio de sesión con Google

1. El frontend muestra el botón oficial de Google y recibe un *ID token* (`credential`).
2. Lo envía a `POST /api/auth/google`.
3. El backend verifica con Google que el token es auténtico, que no expiró y que fue emitido para nuestro Client ID.
4. Si el usuario no existe se crea automáticamente; si ya existía con ese correo (registrado con contraseña) se vincula su cuenta de Google.
5. El backend responde con **su propio JWT**, igual que en el login normal.

## Seguridad

- Contraseñas cifradas con bcrypt (mínimo 8 caracteres).
- Secretos (`JWT_SECRET`, conexión a BD) solo en `.env`, que no se sube a Git.
- Cada usuario solo puede ver, editar y borrar sus propias transacciones.
- Los errores internos se registran en el servidor y no se envían al cliente.

## Problemas comunes

| Síntoma | Solución |
|---|---|
| `Falta la variable de entorno ...` al iniciar el backend | Crear `backend/.env` a partir de `.env.example` |
| `The Angular CLI requires a minimum Node.js version` | Actualizar Node a 22.22.3+ o 24 LTS |
| `packages field missing or empty` al hacer `pnpm install` | Actualizar pnpm a la versión 10 |
| "No se pudo conectar con el servidor" en la app | El backend no está encendido (`pnpm dev` en `backend/`) |
| Error de Google *origin not allowed* | Revisar el paso 1.3 (orígenes autorizados) |
| Error de migración o *drift detected* | `pnpm prisma migrate reset` en `backend/` |
