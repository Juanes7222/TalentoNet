# Módulos de Scripts de TalentoNet

Este directorio contiene módulos reutilizables de PowerShell para los scripts de gestión de TalentoNet.

## 📦 Módulos Disponibles

### 1. `docker-utils.ps1` - Utilidades de Docker

Funciones para gestionar contenedores Docker y Docker Compose.

**Funciones principales:**
- `Test-DockerInstalled` - Verifica si Docker está instalado
- `Test-DockerRunning` - Verifica si Docker Desktop está corriendo
- `Wait-ForDockerReady` - Espera interactivamente a que Docker esté listo
- `Test-ContainerRunning` - Verifica si un contenedor específico está corriendo
- `Start-DockerServices` - Inicia servicios con docker-compose
- `Stop-DockerServices` - Detiene servicios Docker

**Ejemplo de uso:**
```powershell
Import-Module ".\modules\docker-utils.ps1"

if (-not (Test-DockerRunning)) {
    Wait-ForDockerReady
}

Start-DockerServices -Services @("postgres", "rabbitmq")
```

---

### 2. `db-utils.ps1` - Utilidades de Base de Datos

Funciones para gestionar PostgreSQL, migraciones y seeds.

**Funciones principales:**
- `Invoke-SqlFile` - Ejecuta un archivo SQL en PostgreSQL
- `Invoke-SqlCommand` - Ejecuta un comando SQL directo
- `Invoke-Migrations` - Ejecuta todas las migraciones en orden
- `Invoke-Seeds` - Ejecuta archivos de seed en orden
- `Reset-Database` - Elimina todas las tablas y recrea el esquema
- `Wait-ForPostgres` - Espera a que PostgreSQL esté listo
- `Get-SeedFiles` - Obtiene automáticamente archivos de seed

**Ejemplo de uso:**
```powershell
Import-Module ".\modules\db-utils.ps1"

# Ejecutar migraciones
$result = Invoke-Migrations -MigrationsPath "packages\backend\migrations" -Verbose $true

# Obtener seeds automáticamente (RECOMENDADO)
$seedFiles = Get-SeedFiles -SeedsPath "packages\backend\seeds"
$seedResult = Invoke-Seeds -SeedFiles $seedFiles -ShowDetails $true

# O especificar seeds manualmente
$seedFiles = @(
    "packages\backend\seeds\001_seed_employees.sql",
    "packages\backend\seeds\002_recruitment_data.sql"
)
$seedResult = Invoke-Seeds -SeedFiles $seedFiles -ShowDetails $true

# Filtrar seeds específicos
$allSeeds = Get-SeedFiles -SeedsPath "packages\backend\seeds"
$onlyEmployees = $allSeeds | Where-Object { $_ -like "*employee*" }
Invoke-Seeds -SeedFiles $onlyEmployees -ShowDetails $true

# Resetear base de datos
Reset-Database -Verbose $true
```

---

### 3. `node-utils.ps1` - Utilidades de Node.js

Funciones para verificar y gestionar Node.js y pnpm.

**Funciones principales:**
- `Test-NodeInstalled` - Verifica si Node.js está instalado
- `Test-PnpmInstalled` - Verifica si pnpm está instalado
- `Install-Pnpm` - Instala pnpm globalmente
- `Install-Dependencies` - Instala dependencias con pnpm
- `Test-Prerequisites` - Verifica todos los prerequisitos del proyecto

**Ejemplo de uso:**
```powershell
Import-Module ".\modules\node-utils.ps1"

# Verificar e instalar prerequisitos
if (-not (Test-Prerequisites -InstallPnpm $true)) {
    exit 1
}

# Instalar dependencias
Install-Dependencies
```

---

### 4. `env-utils.ps1` - Utilidades de Variables de Entorno

Funciones para gestionar archivos `.env`.

**Funciones principales:**
- `Initialize-EnvFile` - Copia .env.example a .env
- `Initialize-BackendEnv` - Inicializa .env del backend
- `Initialize-FrontendEnv` - Inicializa .env del frontend
- `Initialize-AllEnvFiles` - Inicializa todos los archivos .env

**Ejemplo de uso:**
```powershell
Import-Module ".\modules\env-utils.ps1"

# Inicializar todos los archivos .env
Initialize-AllEnvFiles

# O inicializar uno específico
Initialize-BackendEnv -Force $false
```

---

### 5. `minio-utils.ps1` - Utilidades de MinIO

Funciones para gestionar MinIO y buckets.

**Funciones principales:**
- `Initialize-MinioBucket` - Crea y configura un bucket en MinIO
- `Test-MinIOReady` - Verifica si MinIO está listo

**Ejemplo de uso:**
```powershell
Import-Module ".\modules\minio-utils.ps1"

# Crear bucket con lectura pública
Initialize-MinioBucket -BucketName "talentonet-documents" -PublicRead $true
```

---

### 6. `output-utils.ps1` - Utilidades de Salida

Funciones para mostrar mensajes formateados en consola.

**Funciones principales:**
- `Write-Header` - Muestra un encabezado con formato
- `Write-Section` - Muestra un título de sección
- `Write-Success` - Muestra mensaje de éxito (✅)
- `Write-Error` - Muestra mensaje de error (❌)
- `Write-Warning` - Muestra mensaje de advertencia (⚠️)
- `Write-Info` - Muestra mensaje informativo (ℹ️)
- `Write-Step` - Muestra un paso de un proceso
- `Write-Summary` - Muestra un resumen con formato
- `Confirm-Action` - Solicita confirmación al usuario

**Ejemplo de uso:**
```powershell
Import-Module ".\modules\output-utils.ps1"

Write-Header "Mi Script" -Color Cyan
Write-Section "Configuración" -Icon "⚙️"
Write-Success "Operación completada"
Write-Warning "Esto es una advertencia"
Write-Error "Ocurrió un error"

# Solicitar confirmación
if (Confirm-Action "Esto eliminará todos los datos") {
    # Hacer algo
}

# Mostrar resumen
Write-Summary -Title "Resultados" -Items @{
    "Total" = "10"
    "Exitosos" = "8"
    "Fallidos" = "2"
}
```

---

## 🔧 Cómo Usar los Módulos

### En Scripts PowerShell

```powershell
# Al inicio de tu script, importa los módulos que necesites
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Import-Module "$ScriptPath\modules\docker-utils.ps1" -Force
Import-Module "$ScriptPath\modules\db-utils.ps1" -Force
Import-Module "$ScriptPath\modules\output-utils.ps1" -Force

# Ahora puedes usar las funciones
Write-Header "Mi Script Personalizado"

if (-not (Test-DockerRunning)) {
    Write-Error "Docker no está corriendo"
    exit 1
}

Invoke-Migrations -MigrationsPath "packages\backend\migrations"
```

### En PowerShell Interactivo

```powershell
# Importar módulos
Import-Module ".\scripts\modules\docker-utils.ps1"
Import-Module ".\scripts\modules\db-utils.ps1"

# Usar funciones
Test-DockerRunning
Invoke-Migrations -MigrationsPath "packages\backend\migrations" -Verbose $true
```

---

## 📋 Convenciones

### Nomenclatura de Funciones
- Verbos aprobados de PowerShell: `Get`, `Set`, `Test`, `Invoke`, `Start`, `Stop`, `Wait`, `Initialize`
- Formato: `Verb-NounDescription`
- Ejemplos: `Test-DockerRunning`, `Invoke-Migrations`, `Write-Success`

### Parámetros
- Todos los parámetros tienen valores por defecto cuando es posible
- Parámetros booleanos para control de comportamiento (`-Verbose`, `-Silent`, `-Force`)
- Documentación con bloques de comentarios `<#...#>`

### Valores de Retorno
- Funciones `Test-*` retornan `$true` o `$false`
- Funciones `Invoke-*` retornan hashtables con resultados:
  ```powershell
  @{
      Success = 5
      Failed = 2
      Total = 7
  }
  ```
- Funciones de acción retornan `$true` en éxito, `$false` en error

### Mensajes
- Usar funciones de `output-utils.ps1` para consistencia
- Emojis para mejor experiencia visual
- Colores según tipo de mensaje (Green=éxito, Red=error, Yellow=advertencia)

---

## 🚀 Scripts Modulares vs. Scripts Originales

### Scripts Modulares (Nuevos)
- `setup-modular.ps1` - Setup inicial usando módulos
- `reset-db-modular.ps1` - Reset de BD usando módulos
- `seed-data-modular.ps1` - Carga de seeds usando módulos
- `run-migrations.ps1` - Solo ejecutar migraciones

### Scripts Originales (Legado)
- `setup.ps1` - Script original monolítico
- `reset-db.ps1` - Script original monolítico
- `seed-data.ps1` - Script original monolítico

**Recomendación:** Usar las versiones modulares para mejor mantenibilidad.

---

## 📝 Creando Nuevos Scripts

Para crear un nuevo script que use estos módulos:

```powershell
# mi-nuevo-script.ps1
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Importar solo los módulos que necesites
Import-Module "$ScriptPath\modules\docker-utils.ps1" -Force
Import-Module "$ScriptPath\modules\db-utils.ps1" -Force
Import-Module "$ScriptPath\modules\output-utils.ps1" -Force

Write-Header "Mi Nuevo Script"

# Verificaciones
if (-not (Test-DockerRunning)) {
    Write-Error "Docker no está corriendo"
    exit 1
}

# Lógica del script
Write-Section "Ejecutando tarea..."

# Usar funciones de los módulos
# ...

Write-Success "Script completado!"
```

---

## 🧪 Testing

Para probar los módulos:

```powershell
# Importar módulo
Import-Module ".\scripts\modules\docker-utils.ps1"

# Probar función
Test-DockerRunning
# Salida: True o False

# Probar con verbose
Invoke-Migrations -MigrationsPath "packages\backend\migrations" -Verbose $true
# Salida: Mensajes detallados + hashtable de resultados
```

---

## 🔄 Mantenimiento

### Agregar Nueva Funcionalidad
1. Identificar el módulo apropiado (o crear uno nuevo)
2. Seguir convenciones de nomenclatura
3. Agregar documentación en bloque de comentarios
4. Exportar función con `Export-ModuleMember`
5. Actualizar este README

### Modificar Funciones Existentes
1. Mantener retrocompatibilidad cuando sea posible
2. Agregar parámetros opcionales en lugar de cambiar firmas
3. Actualizar documentación
4. Probar en scripts que usan la función

---

## 📚 Recursos

- [PowerShell Approved Verbs](https://docs.microsoft.com/en-us/powershell/scripting/developer/cmdlet/approved-verbs-for-windows-powershell-commands)
- [PowerShell Modules](https://docs.microsoft.com/en-us/powershell/scripting/developer/module/writing-a-windows-powershell-module)
- [PowerShell Best Practices](https://docs.microsoft.com/en-us/powershell/scripting/developer/cmdlet/cmdlet-development-guidelines)
