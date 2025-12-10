# Script completo para preparar el deploy de producción
# Este script compila Angular y prepara la estructura correcta para Ferozo

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Preparación Completa para Producción" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Compilar Angular
Write-Host "1. Compilando Angular para producción..." -ForegroundColor Yellow
Set-Location frontend
npm run build -- --configuration production
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar Angular" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# 2. Limpiar archivos antiguos de la raíz
Write-Host "2. Limpiando archivos antiguos..." -ForegroundColor Yellow
$oldFiles = @("index.html", "main-*.js", "styles-*.css", "favicon.ico", "assets")
foreach ($pattern in $oldFiles) {
    Get-ChildItem -Path "." -Filter $pattern -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse
}

# 3. Copiar frontend compilado a la raíz
Write-Host "3. Copiando frontend compilado a la raíz..." -ForegroundColor Yellow
$frontendBuildPaths = @(
    "frontend\dist\browser\browser",
    "frontend\dist\browser",
    "frontend\dist\frontend\browser"
)

$copied = $false
foreach ($path in $frontendBuildPaths) {
    if (Test-Path $path) {
        $indexFile = Join-Path $path "index.html"
        if (Test-Path $indexFile) {
            Get-ChildItem -Path $path | ForEach-Object {
                Copy-Item -Path $_.FullName -Destination "." -Recurse -Force
            }
            Write-Host "   ✓ Frontend copiado desde: $path" -ForegroundColor Green
            $copied = $true
            break
        }
    }
}

if (-not $copied) {
    Write-Host "Error: No se encontró el build de Angular" -ForegroundColor Red
    exit 1
}

# 4. Asegurar que api/ existe y tiene los archivos correctos
Write-Host "4. Verificando carpeta api/..." -ForegroundColor Yellow
if (-not (Test-Path "api")) {
    New-Item -ItemType Directory -Path "api" | Out-Null
}

# 5. Asegurar que db/ existe
Write-Host "5. Verificando carpeta db/..." -ForegroundColor Yellow
if (-not (Test-Path "db")) {
    New-Item -ItemType Directory -Path "db" | Out-Null
    New-Item -ItemType File -Path "db\.gitkeep" -Force | Out-Null
}

# 6. Verificar .htaccess
Write-Host "6. Verificando .htaccess..." -ForegroundColor Yellow
if (-not (Test-Path ".htaccess")) {
    Write-Host "   ⚠ .htaccess no encontrado en la raíz" -ForegroundColor Yellow
}

# 7. Verificar api/.htaccess
if (-not (Test-Path "api\.htaccess")) {
    Write-Host "   ⚠ api/.htaccess no encontrado" -ForegroundColor Yellow
}

# 8. Verificación final
Write-Host ""
Write-Host "7. Verificación final..." -ForegroundColor Yellow
$essentials = @(
    "index.html",
    "api\index.php",
    "api\config.php",
    ".htaccess"
)

$allPresent = $true
foreach ($file in $essentials) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file (FALTA)" -ForegroundColor Red
        $allPresent = $false
    }
}

if (-not $allPresent) {
    Write-Host ""
    Write-Host "ERROR: Faltan archivos esenciales" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "¡Preparación completada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Estructura lista para producción:" -ForegroundColor Yellow
Write-Host "  ✓ index.html (en la raíz)" -ForegroundColor White
Write-Host "  ✓ main-*.js, styles-*.css (en la raíz)" -ForegroundColor White
Write-Host "  ✓ api/ (con todos los archivos PHP)" -ForegroundColor White
Write-Host "  ✓ db/ (carpeta para base de datos)" -ForegroundColor White
Write-Host "  ✓ .htaccess (en la raíz)" -ForegroundColor White
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Revisa que NO haya carpeta 'public_html' anidada" -ForegroundColor White
Write-Host "2. Haz commit y push:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host "   git commit -m 'Preparar estructura para producción'" -ForegroundColor Cyan
Write-Host "   git push origin main" -ForegroundColor Cyan
Write-Host "3. En Ferozo, configura:" -ForegroundColor White
Write-Host "   - Directorio: (vacío o '/')" -ForegroundColor Cyan
Write-Host "   - Ferozo desplegará desde la raíz del repositorio" -ForegroundColor Cyan
Write-Host ""

