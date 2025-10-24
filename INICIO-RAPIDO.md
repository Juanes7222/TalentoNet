# 🚀 Guía de Inicio Rápido - TalentoNet

## ⚠️ Problemas Solucionados

Los siguientes archivos fueron creados/actualizados para resolver los problemas del setup inicial:

1. ✅ **Script setup.ps1** - Ahora verifica que Docker Desktop esté corriendo
2. ✅ **Script setup.ps1** - Maneja ausencia de pnpm-lock.yaml
3. ✅ **data-source.ts** - Configuración TypeORM para migraciones
4. ✅ **seeds/runner.ts** - Runner para ejecutar seeds
5. ✅ **package.json backend** - Agregado dotenv como dependencia
6. ✅ **Script setup.ps1** - Ejecuta migraciones y seeds directamente con psql

---

## 📋 Pre-requisitos

Antes de ejecutar el setup, asegúrate de tener instalado:

1. **Node.js >= 20.0.0**
   - Descarga: https://nodejs.org
   - Verifica: `node --version`

2. **pnpm >= 8.0.0** (se instala automáticamente si no existe)
   - Verifica: `pnpm --version`

3. **Docker Desktop**
   - Descarga: https://www.docker.com/products/docker-desktop/
   - **IMPORTANTE**: Debe estar CORRIENDO antes del setup
   - Verifica que el ícono esté verde en la bandeja del sistema

---

## 🎯 Pasos para Iniciar

### Paso 1: Asegúrate que Docker Desktop esté corriendo

1. Abre **Docker Desktop**
2. Espera a que el ícono en la bandeja del sistema esté **verde**
3. Verifica con: `docker ps` (debe responder sin errores)

### Paso 2: Ejecuta el script de setup

```powershell
# Desde la raíz del proyecto
.\scripts\setup.ps1
```

El script hará:
- ✅ Verificar prerequisitos (Node, pnpm, Docker)
- ✅ Instalar dependencias (generará pnpm-lock.yaml)
- ✅ Copiar .env.example a .env
- ✅ Iniciar servicios Docker (PostgreSQL, RabbitMQ, MinIO)
- ✅ Ejecutar migraciones SQL
- ✅ Cargar datos de prueba (30 empleados)
- ✅ Configurar bucket de MinIO

### Paso 3: Verifica que los servicios estén corriendo

```powershell
docker ps
```

Deberías ver 3 contenedores:
- `talentonet-postgres` (puerto 5432)
- `talentonet-rabbitmq` (puertos 5672, 15672)
- `talentonet-minio` (puertos 9000, 9001)

### Paso 4: Inicia la aplicación

```powershell
pnpm dev
```

Esto iniciará:
- Backend NestJS en http://localhost:3000
- Frontend React en http://localhost:5173

---

## 🌐 URLs de Acceso

Una vez todo esté corriendo:

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Frontend** | http://localhost:5173 | - |
| **Backend API** | http://localhost:3000 | - |
| **Swagger Docs** | http://localhost:3000/api/docs | - |
| **RabbitMQ Admin** | http://localhost:15672 | guest / guest |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin |

---

## 👤 Usuarios de Prueba

El seed crea 3 usuarios principales:

| Email | Password | Rol | Descripción |
|-------|----------|-----|-------------|
| admin@talentonet.com | Password123! | admin | Acceso total |
| rh@talentonet.com | Password123! | rh | Recursos Humanos |
| empleado1@talentonet.com | Password123! | employee | Empleado regular |

---

## ❌ Solución de Problemas

### Error: "Docker Desktop no está corriendo"

**Solución:**
1. Abre Docker Desktop
2. Espera a que el ícono esté verde
3. Presiona Enter cuando el script lo solicite

### Error: "Cannot install with frozen-lockfile"

**Solución:** Ya está resuelto en el script actualizado. El script detecta la ausencia de pnpm-lock.yaml y lo genera automáticamente.

### Error: "unable to get image" o "cannot find pipe"

**Causa:** Docker Desktop no está corriendo o no está completamente iniciado.

**Solución:**
1. Cierra Docker Desktop
2. Ábrelo nuevamente
3. Espera 1-2 minutos hasta que esté completamente listo
4. Ejecuta `docker ps` para verificar
5. Vuelve a ejecutar `.\scripts\setup.ps1`

### Error: "typeorm-ts-node-commonjs no se reconoce"

**Solución:** Ya está resuelto. El script ahora ejecuta migraciones directamente con `psql` dentro del contenedor de Docker.

### Error al ejecutar migraciones: "relation already exists"

**Causa:** Las migraciones ya fueron ejecutadas anteriormente.

**Solución:** Es seguro ignorar este error. Las tablas ya existen.

### Error al ejecutar seeds: "duplicate key value"

**Causa:** Los seeds ya fueron ejecutados anteriormente.

**Solución:** 
```powershell
# Opción 1: Limpiar base de datos y volver a ejecutar
docker exec -it talentonet-postgres psql -U talentonet -d talentonet_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
.\scripts\setup.ps1

# Opción 2: Continuar sin seeds (ya tienes datos de prueba)
pnpm dev
```

---

## 🧪 Verificar que Todo Funcione

### 1. Verificar Backend

```powershell
# Probar endpoint de salud
curl http://localhost:3000/api/v1/health

# Probar login
curl -X POST http://localhost:3000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@talentonet.com","password":"Password123!"}'
```

### 2. Verificar Base de Datos

```powershell
# Conectar a PostgreSQL
docker exec -it talentonet-postgres psql -U talentonet -d talentonet_db

# Dentro de psql:
# \dt               -- Ver tablas
# SELECT COUNT(*) FROM employees;  -- Debería retornar 30
# \q                -- Salir
```

### 3. Verificar Frontend

Abre http://localhost:5173 en tu navegador. Deberías ver la interfaz de login de TalentoNet.

---

## 🔄 Comandos Útiles

```powershell
# Instalar dependencias
pnpm install

# Iniciar desarrollo (backend + frontend)
pnpm dev

# Ejecutar solo backend
pnpm --filter backend dev

# Ejecutar solo frontend
pnpm --filter frontend dev

# Ejecutar tests
pnpm test

# Ejecutar tests backend
pnpm --filter backend test
pnpm --filter backend test:e2e

# Ejecutar tests frontend
pnpm --filter frontend cypress:open

# Build para producción
pnpm build

# Iniciar servicios Docker
pnpm docker:up

# Detener servicios Docker
pnpm docker:down

# Ver logs de un servicio
docker logs talentonet-postgres
docker logs talentonet-rabbitmq
docker logs talentonet-minio
```

---

## 📚 Próximos Pasos

1. **Familiarízate con la estructura** - Lee `/README.md`
2. **Revisa los pendientes** - Lee `/CHECKLIST.md`
3. **Explora la API** - Visita http://localhost:3000/api/docs
4. **Completa los STUBs** - Ver sección "Implementaciones STUB" en `/ENTREGABLES.md`
5. **Configura el frontend** - Crear `App.tsx`, routing, auth context

---

## 🆘 ¿Necesitas Ayuda?

1. **Documentación completa**: `/README.md`
2. **Lista de pendientes**: `/CHECKLIST.md`
3. **Roadmap técnico**: `/ROADMAP.md`
4. **Gestión de riesgos**: `/RISKS.md`
5. **Índice de archivos**: `/ENTREGABLES.md`

---

**Última actualización:** 24 de octubre de 2025
