# TalentoNet - Sistema de Gestión de Talento Humano y Nómina

Sistema completo de gestión de recursos humanos, nómina, afiliaciones y seguridad social desarrollado con arquitectura moderna cloud-native.

## Arquitectura

- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Message Queue**: RabbitMQ
- **Storage**: AWS S3 (MinIO en desarrollo)
- **Container**: Docker + Kubernetes
- **CI/CD**: GitHub Actions

## Monorepo Structure

```
TalentoNet/
├── packages/
│   ├── backend/          # API NestJS
│   └── frontend/         # React SPA
├── infra/
│   ├── k8s/              # Kubernetes manifests
│   └── docker-compose.yml
├── .github/workflows/     # CI/CD
└── scripts/              # Utility scripts
```

## Quick Start

### Prerrequisitos

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose
- PostgreSQL 16+ (o usar Docker Compose)

### Instalación

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp packages/backend/.env.example packages/backend/.env
# Editar packages/backend/.env con valores reales

# 3. Iniciar servicios con Docker Compose
pnpm docker:up

# 4. Ejecutar migraciones
pnpm migrate

# 5. Cargar datos de prueba (empleados, vacantes, candidatos, afiliaciones)
pnpm seed:load

# 6. Iniciar desarrollo
pnpm dev
```

> **💡 Windows:** También puedes usar `.\scripts\setup.ps1` para automatizar todo el proceso.
> 
> **💡 Linux/macOS:** También puedes usar `./scripts/setup.sh` (recuerda dar permisos: `chmod +x scripts/setup.sh`)

La aplicación estará disponible en:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/api/docs
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

## Scripts Disponibles

```bash
# Desarrollo
pnpm dev                 # Inicia backend + frontend
pnpm build               # Construye todos los paquetes
pnpm test                # Ejecuta todos los tests
pnpm lint                # Linting de código

# Base de datos
pnpm migrate             # Ejecuta migraciones
pnpm seed:load           # Carga datos de prueba (empleados, vacantes, afiliaciones)
pnpm db:reset            # Resetea BD completamente y recarga datos

# Docker
pnpm docker:up           # Inicia contenedores
pnpm docker:down         # Detiene contenedores
```

> **Nota:** Para más detalles sobre gestión de datos, ver [scripts/README.md](scripts/README.md)

## Testing

```bash
# Backend
cd packages/backend
pnpm test                # Unit tests
pnpm test:e2e            # Integration tests
pnpm test:cov            # Coverage

# Frontend
cd packages/frontend
pnpm test                # Unit tests con Vitest
pnpm cypress:open        # E2E tests con Cypress
```

## Autenticación

Usuarios de prueba (después de ejecutar `pnpm seed:load`):

- **Admin**: admin@talentonet.com / Password123!
- **RH**: rh@talentonet.com / Password123!

**Datos de prueba incluidos:**
- 30 empleados con contratos y afiliaciones
- 2 vacantes abiertas (Desarrollador Full Stack y Analista de RRHH)
- 4 candidatos en diferentes estados del proceso
- 3 entrevistas programadas/completadas
- Proveedores de seguridad social (ARL, EPS, AFP, Cajas)
- **Empleado**: empleado1@talentonet.com / ChangeMe123!

## API Documentation

Swagger UI disponible en: http://localhost:3000/api/docs

Principales endpoints:

- `POST /api/v1/auth/login` - Autenticación JWT
- `GET /api/v1/auth/me` - Perfil usuario
- `GET /api/v1/employees` - Listar empleados (paginado)
- `POST /api/v1/employees` - Crear empleado
- `GET /api/v1/employees/:id` - Obtener empleado
- `PATCH /api/v1/employees/:id` - Actualizar empleado
- `DELETE /api/v1/employees/:id` - Desactivar empleado

## Deployment

### Docker

```bash
docker-compose -f infra/docker-compose.yml up -d
```

### Kubernetes

```bash
# Crear namespace
kubectl create namespace talentonet

# Aplicar secrets (editar valores reales primero)
kubectl apply -f infra/k8s/secrets.yaml

# Deploy
kubectl apply -f infra/k8s/postgres-statefulset.yaml
kubectl apply -f infra/k8s/backend-deployment.yaml
kubectl apply -f infra/k8s/frontend-deployment.yaml
kubectl apply -f infra/k8s/ingress.yaml

# Verificar
kubectl get pods -n talentonet
kubectl get services -n talentonet
```

### CI/CD - GitHub Actions

El proyecto incluye pipelines automáticos:

1. **CI** (`.github/workflows/ci.yml`): Lint → Test → Build
2. **CD** (`.github/workflows/cd.yml`): Build Docker → Push Registry → Deploy K8s

**Secrets requeridos en GitHub**:
- `KUBECONFIG`: Configuración de cluster Kubernetes (base64)

## Configuración

### Variables de Entorno Backend

Ver `packages/backend/.env.example` para la lista completa. Principales:

```env
NODE_ENV=production
PORT=3000
DB_HOST=postgres-service
DB_USERNAME=talentonet
DB_PASSWORD=CHANGE_ME
JWT_SECRET=CHANGE_ME_MIN_32_CHARS
RABBITMQ_URL=amqp://user:pass@rabbitmq:5672
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=talentonet-documents
```
