# Script para preparar el proyecto para deployment en DonWeb/Ferozo
# Este script compila Angular y prepara la estructura para public_html

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Preparando proyecto para DonWeb/Ferozo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Compilar Angular para producción
Write-Host "1. Compilando Angular para producción..." -ForegroundColor Yellow
Set-Location frontend
npm run build -- --configuration production
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar Angular" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# 2. Crear directorio de deployment
Write-Host "2. Creando estructura para public_html..." -ForegroundColor Yellow
$deployDir = "deploy_public_html"
if (Test-Path $deployDir) {
    Remove-Item -Path $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null
New-Item -ItemType Directory -Path "$deployDir/api" | Out-Null
New-Item -ItemType Directory -Path "$deployDir/db" | Out-Null

# 3. Copiar backend PHP
Write-Host "3. Copiando archivos del backend..." -ForegroundColor Yellow
Copy-Item -Path "api\*" -Destination "$deployDir\api\" -Recurse -Exclude "*.log","*.tmp"

# 4. Copiar frontend compilado
Write-Host "4. Copiando frontend compilado..." -ForegroundColor Yellow
$frontendDist1 = "frontend\dist\frontend\browser"
$frontendDist2 = "frontend\dist\browser"
$frontendDist = $null

if (Test-Path $frontendDist1) {
    $frontendDist = $frontendDist1
    Write-Host "   Usando estructura: $frontendDist1" -ForegroundColor Gray
} elseif (Test-Path $frontendDist2) {
    $frontendDist = $frontendDist2
    Write-Host "   Usando estructura: $frontendDist2" -ForegroundColor Gray
}

if ($frontendDist -and (Test-Path $frontendDist)) {
    Get-ChildItem -Path $frontendDist | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination "$deployDir\" -Recurse
    }
    Write-Host "   Frontend copiado exitosamente" -ForegroundColor Green
} else {
    Write-Host "Error: No se encontró el directorio de build de Angular" -ForegroundColor Red
    Write-Host "   Buscado en: $frontendDist1" -ForegroundColor Yellow
    Write-Host "   Buscado en: $frontendDist2" -ForegroundColor Yellow
    Write-Host "   Ejecuta primero: cd frontend && npm run build -- --configuration production" -ForegroundColor Yellow
    exit 1
}

# 5. Crear .htaccess para routing de Angular
Write-Host "5. Creando .htaccess para routing..." -ForegroundColor Yellow
$htaccessContent = @"
# Habilitar rewrite engine
RewriteEngine On

# Si el archivo o directorio existe, servirlo directamente
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Redirigir todas las rutas a index.html (para Angular routing)
RewriteRule ^(?!api/).*$ index.html [L]

# Permitir acceso a la API
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ api/index.php?action=$1 [QSA,L]

# Configuración de seguridad
<FilesMatch "\.(sqlite|db|log)$">
    Deny from all
</FilesMatch>

# Headers de seguridad
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Compresión
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache para archivos estáticos
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
"@
Set-Content -Path "$deployDir\.htaccess" -Value $htaccessContent

# 6. Crear .htaccess para la carpeta api
$apiHtaccess = @"
# Permitir acceso a archivos PHP
<FilesMatch "\.php$">
    SetHandler application/x-httpd-php
</FilesMatch>

# Denegar acceso a archivos sensibles
<FilesMatch "^(config|db|jwt)\.php$">
    Deny from all
</FilesMatch>

# CORS para desarrollo (ajustar en producción)
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
"@
Set-Content -Path "$deployDir\api\.htaccess" -Value $apiHtaccess

# 7. Crear archivo .gitkeep para db (carpeta debe existir pero vacía)
New-Item -ItemType File -Path "$deployDir\db\.gitkeep" -Force | Out-Null

# 8. Actualizar environment.prod.ts con ruta relativa
Write-Host "6. Actualizando configuración de producción..." -ForegroundColor Yellow
$envProdContent = @"
export const environment = {
  production: true,
  apiBaseUrl: '/api'
};
"@
Set-Content -Path "frontend\src\environments\environment.prod.ts" -Value $envProdContent

# 9. Crear README de deployment
$deployReadme = @"
# Instrucciones de Deployment en DonWeb/Ferozo

## Estructura Preparada

Este directorio contiene todos los archivos listos para subir a public_html:

- `api/` - Backend PHP
- `db/` - Carpeta para base de datos (vacía, se creará automáticamente)
- `index.html` - Aplicación Angular compilada
- `.htaccess` - Configuración de routing y seguridad

## Pasos para Deployment

1. **Subir archivos a public_html**:
   - Sube TODO el contenido de este directorio a `public_html/` en tu hosting
   - Asegúrate de que la carpeta `db/` tenga permisos de escritura (chmod 755)

2. **Configurar base de datos**:
   - Accede a: `https://tudominio.com/api/init_db.php`
   - Esto creará la base de datos SQLite en `db/orsai.sqlite`

3. **Configurar API key de API-Football** (opcional):
   - Edita `api/config.php` y configura tu API key

4. **Verificar permisos**:
   - La carpeta `db/` debe tener permisos de escritura
   - La carpeta `api/` debe tener permisos de lectura

## Configuración en DonWeb/Ferozo

En el panel de Git:
- **Repositorio**: git@github.com:TomyAlv/Orsai2.git
- **Rama**: main
- **Directorio**: public_html/

**IMPORTANTE**: El directorio debe estar vacío antes del primer deploy.

## Notas

- La aplicación Angular está compilada y lista para producción
- El routing de Angular funciona mediante .htaccess
- La API está en `/api/`
- Todas las rutas de Angular se redirigen a `index.html`
"@
Set-Content -Path "$deployDir\README_DEPLOY.md" -Value $deployReadme

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "¡Preparación completada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Directorio listo para deployment: $deployDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Revisa el contenido de '$deployDir'" -ForegroundColor White
Write-Host "2. Sube todo el contenido a public_html/ en DonWeb" -ForegroundColor White
Write-Host "3. Ejecuta: https://tudominio.com/api/init_db.php" -ForegroundColor White
Write-Host "4. Verifica que la carpeta db/ tenga permisos de escritura" -ForegroundColor White
Write-Host ""

