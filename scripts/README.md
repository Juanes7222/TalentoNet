# Scripts de Base de Datos - TalentoNet

Este directorio contiene scripts para gestionar la base de datos y datos de prueba.

> ** Compatibilidad Multiplataforma:** Todos los scripts están disponibles en versiones para Windows (`.ps1`) y Linux/macOS (`.sh`). Los comandos `pnpm` detectan automáticamente tu sistema operativo y ejecutan el script correcto.

##  Scripts Disponibles

### Windows (PowerShell)

#### `setup.ps1`
Script principal de inicialización.

**Uso:**
```powershell
.\scripts\setup.ps1
```

#### `seed-data.ps1` 
Carga datos de prueba sin borrar datos existentes.

**Uso:**
```powershell
.\scripts\seed-data.ps1
# o desde pnpm (detecta el OS)
pnpm seed:load
```

#### `reset-db.ps1`
** DESTRUCTIVO**: Resetea BD completamente.

**Uso:**
```powershell
.\scripts\reset-db.ps1
# o desde pnpm (detecta el OS)
pnpm db:reset
```

### Linux/macOS (Bash)

#### `setup.sh`, `seed-data.sh`, `reset-db.sh`
Equivalentes a los scripts PowerShell para sistemas Unix.

**Uso:**
```bash
chmod +x scripts/*.sh

# Ejecutar scripts
./scripts/setup.sh
./scripts/seed-data.sh

# Reset con confirmación interactiva
./scripts/reset-db.sh

# Reset sin confirmación (automático)
./scripts/reset-db.sh --force

# O usar comandos pnpm (detecta el OS y pide confirmación)
pnpm seed:load
pnpm db:reset
```

**Datos que cargan los seeds:**
- 30 empleados con contratos activos
- Afiliaciones a EPS, AFP, ARL y Cajas de Compensación
- 2 vacantes abiertas (Desarrollador Full Stack y Analista de RRHH)
- 4 candidatos en diferentes estados del proceso
- 3 entrevistas programadas/completadas
- Proveedores de seguridad social (ARL, EPS, AFP, Cajas)

##  Comandos pnpm (Multiplataforma)

Los siguientes comandos funcionan en **Windows, Linux y macOS**:

| Comando | Descripción | Confirmación |
|---------|-------------|--------------|
| `pnpm seed:load` | Carga datos de prueba (sin borrar existentes) | No requiere |
| `pnpm db:reset` | Resetea BD completamente y recarga datos | **Sí** - Pide escribir "SI" |
| `pnpm docker:up` | Inicia servicios Docker | No requiere |
| `pnpm docker:down` | Detiene servicios Docker | No requiere |
| `pnpm migrate` | Ejecuta migraciones pendientes | No requiere |

> **Nota:** 
> - Los comandos `pnpm seed:load` y `pnpm db:reset` detectan automáticamente tu sistema operativo y ejecutan el script correcto (`.ps1` en Windows, `.sh` en Linux/macOS).
> - El comando `pnpm db:reset` **siempre pedirá confirmación** escribiendo "SI" en mayúsculas para evitar borrados accidentales.

## Usuarios de Prueba

Después de ejecutar los seeds, estarán disponibles:

| Email | Contraseña | Rol |
|-------|------------|-----|
| `admin@talentonet.com` | `Password123!` | Administrador |
| `rh@talentonet.com` | `Password123!` | Recursos Humanos |
| `empleadoX@talentonet.com` | (hash automático) | Empleado (X = 1-30) |

## Archivos de Seeds

Los archivos SQL están en `packages/backend/seeds/`:

1. **001_seed_employees.sql**
   - Usuarios admin y RH
   - 30 empleados con información personal completa
   - Contratos laborales actuales
   - Afiliaciones básicas a EPS, AFP, ARL
   - Nóminas de los últimos 3 meses

2. **002_recruitment_data.sql**
   - Vacantes abiertas
   - Candidatos en proceso
   - Entrevistas programadas/completadas
   - Historial de cambios de estado

3. **003_affiliations_data.sql**
   - Proveedores de ARL (SURA, Positiva, Bolívar, Liberty)
   - Proveedores de EPS (Sanitas, Compensar, Nueva EPS, etc.)
   - Proveedores de AFP (Porvenir, Protección, Colfondos, Old Mutual)
   - Cajas de Compensación (Compensar, Colsubsidio, Cafam, etc.)
   - Afiliaciones de ejemplo con cifrado

## Solución de Problemas

### Docker no está corriendo
```powershell
# Abre Docker Desktop y espera a que esté listo (icono verde)
# Luego ejecuta:
pnpm docker:up
```

### PostgreSQL no responde
```powershell
# Reinicia el contenedor
docker restart talentonet-postgres

# O reinicia todos los servicios
pnpm docker:down
pnpm docker:up
```

### Los seeds fallan con "ya existen datos"
Esto es normal si ejecutas `seed-data.ps1` múltiples veces. Los seeds tienen protecciones para no duplicar datos.

Si necesitas empezar desde cero:
```powershell
pnpm db:reset
```

### Permisos en PostgreSQL
Si hay errores de permisos, verifica las credenciales en `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=talentonet
DB_PASSWORD=talentonet_secret
DB_DATABASE=talentonet_db
```

## Notas

- Los seeds ejecutan en orden numérico (001, 002, 003)
- Las contraseñas usan bcrypt con salt rounds = 10
- Los números de afiliación en el seed 003 usan cifrado (en producción se cifran con clave del entorno)
- Cada seed incluye validaciones para evitar duplicados

## Flujo de Trabajo Recomendado

### Primera vez (setup completo)
```powershell
.\scripts\setup.ps1
```

### Desarrollo diario
```powershell
pnpm docker:up      # Inicia servicios
pnpm dev            # Inicia backend + frontend
```

### Agregar más datos de prueba
```powershell
pnpm seed:load
```

### Empezar desde cero
```powershell
pnpm db:reset
```

### Detener servicios
```powershell
pnpm docker:down
```
