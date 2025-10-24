# TalentoNet - Sistema de Gestión de Talento Humano y Nómina

Sistema completo de gestión de recursos humanos, nómina, afiliaciones y seguridad social desarrollado con arquitectura moderna cloud-native.

## 🏗️ Arquitectura

- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Message Queue**: RabbitMQ
- **Storage**: AWS S3 (MinIO en desarrollo)
- **Container**: Docker + Kubernetes
- **CI/CD**: GitHub Actions

## 📦 Monorepo Structure

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

## 🚀 Quick Start

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

# 5. Cargar datos de prueba (seed)
pnpm seed

# 6. Iniciar desarrollo
pnpm dev
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/api/docs
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

## 📝 Scripts Disponibles

```bash
# Desarrollo
pnpm dev                 # Inicia backend + frontend
pnpm build               # Construye todos los paquetes
pnpm test                # Ejecuta todos los tests
pnpm lint                # Linting de código

# Base de datos
pnpm migrate             # Ejecuta migraciones
pnpm seed                # Carga datos de prueba

# Docker
pnpm docker:up           # Inicia contenedores
pnpm docker:down         # Detiene contenedores
```

## 🧪 Testing

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

## 🔐 Autenticación

Usuarios de prueba (después de ejecutar seed):

- **Admin**: admin@talentonet.com / Password123!
- **RH**: rh@talentonet.com / Password123!
- **Empleado**: empleado1@talentonet.com / ChangeMe123!

## 📚 API Documentation

Swagger UI disponible en: http://localhost:3000/api/docs

Principales endpoints:

- `POST /api/v1/auth/login` - Autenticación JWT
- `GET /api/v1/auth/me` - Perfil usuario
- `GET /api/v1/employees` - Listar empleados (paginado)
- `POST /api/v1/employees` - Crear empleado
- `GET /api/v1/employees/:id` - Obtener empleado
- `PATCH /api/v1/employees/:id` - Actualizar empleado
- `DELETE /api/v1/employees/:id` - Desactivar empleado

## 🚢 Deployment

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

## 🔧 Configuración

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

## 🛠️ Integraciones

### Yéminus (Afiliaciones)

Stub implementado en `packages/backend/src/integrations/yeminus.adapter.ts`. Configurar:

```env
YEMINUS_API_URL=https://api.yeminus.com/v1
YEMINUS_API_KEY=your_api_key
YEMINUS_MAX_RETRIES=3
```

### PILA (Archivos Planos)

Generación de archivos planos para operadores. Configurar:

```env
PILA_OPERATOR_CODE=001
PILA_COMPANY_NIT=900123456
```

## 📊 Monitoreo

- **Logs**: Centralizados vía stdout/stderr (capturar con EFK/Loki)
- **Health Checks**: `/api/v1/health` (configurado en K8s probes)
- **Metrics**: Prometheus-ready (agregar @nestjs/prometheus en futuro)

## 🤝 Contribuir

1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Propietario - Todos los derechos reservados

## 🙋 Soporte

- **Documentación API**: http://localhost:3000/api/docs
- **Issues**: GitHub Issues
- **Email**: soporte@talentonet.com
