# Tododo ✅

Gestor de tareas moderno con vistas en lista y kanban. Inspirado en Recordatorios de macOS y TickTick.

**Stack:** React + TypeScript · Tailwind · Node.js · Express · PostgreSQL · Prisma · Docker

---

## Características

- 📋 Vista de lista y vista Kanban con drag & drop
- 🗂️ Columnas Kanban personalizables (renombrar, añadir, borrar)
- 📁 Listas renombrables con color e icono
- 🏷️ Categorías por tarea con colores
- 📎 Adjuntar archivos a tareas
- 🔗 URL y descripción por tarea
- ⏰ Fecha y hora límite
- 🌐 Multiidioma: Español / Inglés
- 📱 Responsive — escritorio y móvil
- 🔒 Autenticación con contraseñas cifradas (bcrypt)
- 📲 Instalable como PWA

---

## Instalación en servidor con Portainer

### 1. Prerrequisitos

- Docker + Portainer en el servidor Linux
- Las imágenes se publican automáticamente en GitHub Container Registry (GHCR) al hacer push a `main`

### 2. Crear el stack en Portainer

1. Abre Portainer → **Stacks → Add stack**
2. Pega el contenido de [`portainer-stack.yml`](./portainer-stack.yml) en el editor
3. En **Environment variables**, añade:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `POSTGRES_PASSWORD` | **Requerido** — contraseña de la BD | `Mi$3cret0Fuerte!` |
| `JWT_SECRET` | **Requerido** — secreto del token | *(ver abajo)* |
| `APP_PORT` | Puerto expuesto (default: `3000`) | `3000` |
| `POSTGRES_DB` | Nombre de la BD (default: `tododo`) | `tododo` |
| `POSTGRES_USER` | Usuario de la BD (default: `tododo`) | `tododo` |

**Generar `JWT_SECRET`:**
```bash
openssl rand -base64 48
```

4. Haz clic en **Deploy the stack**

La app quedará disponible en `http://tu-servidor:3000`

---

## Desarrollo local

```bash
# Clona el repo
git clone https://github.com/TU_USUARIO/tododo.git
cd tododo

# Copia las variables de entorno
cp .env.example .env
# Edita .env con tus valores

# Levanta todo con Docker Compose
docker compose up --build

# La app estará en http://localhost:3000
```

### Sin Docker (frontend + backend por separado)

```bash
# Backend (requiere PostgreSQL local)
cd backend
npm install
npx prisma db push
npm run dev        # → http://localhost:4000

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

---

## CI/CD

Al hacer push a `main`, GitHub Actions construye y publica automáticamente las imágenes Docker en GHCR:

- `ghcr.io/TU_USUARIO/tododo-backend:latest`
- `ghcr.io/TU_USUARIO/tododo-frontend:latest`

Portainer puede configurarse para hacer **re-pull automático** de las imágenes cuando se publiquen.
