# Scripts de TalentoNet

Este directorio contiene scripts para gestionar el proyecto TalentoNet.

##  Soporte Multi-Plataforma

**Windows (PowerShell):** Usa scripts `.ps1` / `.psm1`  
**Linux/macOS/WSL (Bash):** Usa scripts `.sh`

---

## Estructura del Directorio

```
scripts/
├── modules/                    # Módulos
│   ├── *.psm1                  # Módulos PowerShell (Windows)
│   ├── *.sh                    # Módulos Bash (Linux/macOS)
│   ├── docker-utils.*          # Gestión de Docker
│   ├── db-utils.*              # PostgreSQL, migraciones, seeds
│   ├── node-utils.*            # Node.js y pnpm
│   ├── env-utils.*             # Variables de entorno
│   ├── minio-utils.*           # MinIO
│   ├── output-utils.*          # Salida formateada
│   ├── workflow-utils.*        # Flujos de trabajo completos
│   └── README.md               # Documentación de módulos
│
├── examples/                   # Scripts de ejemplo
│   ├── seed-filtering-examples.ps1
│   ├── load-basic-data.ps1
│   └── README.md
│
├── Windows (PowerShell)
│   ├── setup.ps1               #   Setup inicial completo
│   ├── reset-db.ps1            #   Resetear base de datos
│   ├── seed-data.ps1           #   Cargar datos de prueba
│   ├── run-migrations.ps1      #   Ejecutar solo migraciones
│   ├── dev-helper.ps1          #   Menú interactivo
│   └── check-status.ps1        #   Verificar estado del sistema
│
├── Linux/macOS (Bash)
│   ├── setup.sh                #   Setup inicial completo
│   ├── reset-db.sh             #   Resetear base de datos
│   ├── seed-data.sh            #   Cargar datos de prueba
│   ├── run-migrations.sh       #   Ejecutar solo migraciones
│   └── check-status.sh         #   Verificar estado del sistema
│
└── Documentación
    ├── README.md               # Esta guía
    ├── modules/README.md       # Docs de módulos
```

---

##  Scripts Principales (Windows PowerShell)


### `setup.ps1` - Setup Inicial Completo
Configura el proyecto desde cero usando módulos reutilizables.

**Uso:**
```powershell
.\scripts\setup.ps1
```

**Qué hace:**
-   Verifica prerequisitos (Node.js, pnpm, Docker)
-   Instala dependencias con pnpm
-   Configura archivos .env
-   Inicia servicios Docker (PostgreSQL, RabbitMQ, MinIO)
-   Ejecuta migraciones de base de datos
-   Carga datos de prueba (auto-detecta todos los seeds)
-   Configura bucket de MinIO

---

### `reset-db.ps1` - Resetear Base de Datos
Elimina todos los datos y los recarga desde cero.

**ADVERTENCIA:** Esto eliminará TODOS los datos.

**Uso:**
```powershell
.\scripts\reset-db.ps1
```

**Qué hace:**
- Elimina todas las tablas
- Ejecuta todas las migraciones
- Carga datos de prueba

---

### `seed-data.ps1` - Cargar Datos de Prueba
Carga solo los datos de prueba sin alterar la estructura.

**Uso:**
```powershell
.\scripts\seed-data.ps1
```

**Qué hace:**
-  Auto-detecta todos los archivos .sql en `packages/backend/seeds/`
-  Ejecuta seeds en orden alfabético
-  Muestra resumen de resultados

---

### `run-migrations.ps1` - Ejecutar Solo Migraciones
Ejecuta únicamente las migraciones sin tocar seeds.

**Uso:**
```powershell
.\scripts\run-migrations.ps1
```

**Qué hace:**
-  Ejecuta archivos de migración en orden
-  Muestra resumen de migraciones aplicadas

---

### `dev-helper.ps1` - Menú Interactivo
Menú interactivo con todas las operaciones comunes.

**Uso:**
```powershell
.\scripts\dev-helper.ps1
```

**Opciones disponibles:**
1.  Setup inicial completo
2.  Iniciar servicios Docker
3.  Detener servicios Docker
4.  Ejecutar migraciones
5.  Cargar datos de prueba
6.  Resetear base de datos
7.  Verificar estado del sistema
8.  Inicializar archivos .env
9.  Configurar bucket MinIO

---

### `check-status.ps1` - Verificar Estado
Verifica el estado de Docker, contenedores y PostgreSQL.

**Uso:**
```powershell
.\scripts\check-status.ps1
```

---

##  Módulos y Documentación

### Módulos Disponibles

Ver documentación completa en [`modules/README.md`](modules/README.md)

- **docker-utils.ps1** - Gestión de Docker y contenedores
- **db-utils.ps1** - PostgreSQL, migraciones y seeds (con auto-detección)
- **node-utils.ps1** - Node.js y pnpm
- **env-utils.ps1** - Archivos .env
- **minio-utils.ps1** - MinIO y buckets
- **output-utils.ps1** - Salida formateada con colores
- **workflow-utils.ps1** - Flujos de trabajo completos de alto nivel


---

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
