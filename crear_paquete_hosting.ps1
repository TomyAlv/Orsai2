# Script PowerShell para crear paquete de archivos para hosting
# Excluye archivos innecesarios según .gitignore y mejores prácticas

Write-Host "Creando paquete para hosting..." -ForegroundColor Green

# Nombre del archivo comprimido
$fecha = Get-Date -Format "yyyyMMdd_HHmmss"
$nombreArchivo = "orsai_hosting_$fecha.zip"
$carpetaTemporal = "temp_hosting_package"

# Limpiar si existe carpeta temporal anterior
if (Test-Path $carpetaTemporal) {
    Remove-Item -Path $carpetaTemporal -Recurse -Force
}

# Crear carpeta temporal
New-Item -ItemType Directory -Path $carpetaTemporal | Out-Null
New-Item -ItemType Directory -Path "$carpetaTemporal\frontend" | Out-Null
New-Item -ItemType Directory -Path "$carpetaTemporal\api" | Out-Null

Write-Host "Copiando archivos del frontend..." -ForegroundColor Yellow

# Copiar frontend (excluyendo node_modules, dist, .angular, etc.)
$frontendExcluir = @(
    "node_modules",
    "dist",
    ".angular",
    ".vscode",
    ".idea",
    "*.log",
    "*.tmp",
    ".env",
    ".env.local"
)

Get-ChildItem -Path "frontend" -Recurse | Where-Object {
    $excluir = $false
    foreach ($patron in $frontendExcluir) {
        if ($_.FullName -like "*\$patron\*" -or $_.Name -like $patron) {
            $excluir = $true
            break
        }
    }
    -not $excluir
} | Copy-Item -Destination {
    $_.FullName.Replace("$PWD\frontend", "$PWD\$carpetaTemporal\frontend")
} -Force

Write-Host "Copiando archivos del API..." -ForegroundColor Yellow

# Copiar API (excluyendo archivos temporales y sensibles)
$apiExcluir = @(
    "*.log",
    "*.tmp",
    ".env",
    "test_*.php",
    "*.sqlite",
    "*.sqlite-journal",
    "*.db",
    ".htaccess.bak",
    "Dockerfile",
    "Procfile",
    "railway.json",
    "nixpacks.toml",
    "runtime.txt",
    "start.sh",
    "vercel.json",
    "server.php"
)

Get-ChildItem -Path "api" -Recurse | Where-Object {
    $excluir = $false
    foreach ($patron in $apiExcluir) {
        if ($_.FullName -like "*\$patron" -or $_.Name -like $patron) {
            $excluir = $true
            break
        }
    }
    -not $excluir
} | Copy-Item -Destination {
    $_.FullName.Replace("$PWD\api", "$PWD\$carpetaTemporal\api")
} -Force

# Crear directorio db vacío en api
New-Item -ItemType Directory -Path "$carpetaTemporal\api\db" -Force | Out-Null
Copy-Item -Path "api\db\.gitkeep" -Destination "$carpetaTemporal\api\db\.gitkeep" -ErrorAction SilentlyContinue

Write-Host "Copiando archivos de configuración necesarios..." -ForegroundColor Yellow

# Copiar archivos importantes de la raíz
$archivosRaiz = @(
    ".gitignore",
    "README.md"
)

foreach ($archivo in $archivosRaiz) {
    if (Test-Path $archivo) {
        Copy-Item -Path $archivo -Destination "$carpetaTemporal\$archivo" -Force
    }
}

# Crear archivo de instrucciones para hosting
$instrucciones = @"
INSTRUCCIONES PARA HOSTING
==========================

ESTRUCTURA DE ARCHIVOS:
- frontend/     -> Aplicación Angular (compilar antes de subir)
- api/          -> Backend PHP

PASOS PARA DESPLEGAR:

1. FRONTEND (Angular):
   - Instalar dependencias: cd frontend && npm install
   - Compilar para producción: npm run build
   - Subir la carpeta 'dist' al hosting web
   - Configurar el servidor para que apunte a index.html

2. BACKEND (PHP):
   - Subir toda la carpeta 'api' al servidor
   - Asegurarse de que PHP 8.2+ esté instalado
   - Configurar permisos de escritura en api/db/
   - Configurar variables de entorno:
     * API_FOOTBALL_KEY=tu_api_key
     * JWT_SECRET=tu_secret_jwt
   - Si usas Apache, el .htaccess ya está incluido
   - Si usas otro servidor, configurar rewrite rules para index.php

3. BASE DE DATOS:
   - La base de datos SQLite se creará automáticamente en api/db/
   - Asegurar permisos de escritura en api/db/

4. CORS:
   - Verificar que el backend permita el dominio del frontend
   - Editar api/index.php si es necesario

5. CONFIGURACIÓN:
   - Editar frontend/src/environments/environment.prod.ts
   - Cambiar apiBaseUrl a la URL de tu backend

NOTAS:
- No incluir node_modules (instalar en el servidor)
- No incluir dist (generar con npm run build)
- No incluir archivos .env (configurar en el servidor)
- No incluir bases de datos .sqlite (se crean automáticamente)
"@

$instrucciones | Out-File -FilePath "$carpetaTemporal\INSTRUCCIONES_HOSTING.txt" -Encoding UTF8

Write-Host "Comprimiendo archivos..." -ForegroundColor Yellow

# Eliminar archivo zip anterior si existe
if (Test-Path $nombreArchivo) {
    Remove-Item -Path $nombreArchivo -Force
}

# Comprimir usando .NET Compression (disponible en PowerShell)
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($carpetaTemporal, $nombreArchivo)

# Limpiar carpeta temporal
Remove-Item -Path $carpetaTemporal -Recurse -Force

Write-Host "`n¡Paquete creado exitosamente!" -ForegroundColor Green
Write-Host "Archivo: $nombreArchivo" -ForegroundColor Cyan
Write-Host "Tamaño: $((Get-Item $nombreArchivo).Length / 1MB) MB" -ForegroundColor Cyan
Write-Host "`nUbicación: $PWD\$nombreArchivo" -ForegroundColor Yellow

