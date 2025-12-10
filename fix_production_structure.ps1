# Script para corregir la estructura de producción
# Este script mueve los archivos de public_html/ a la raíz (para Ferozo)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Corrigiendo Estructura de Producción" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar si existe public_html anidada
if (Test-Path "public_html\public_html") {
    Write-Host "1. Moviendo archivos de public_html/public_html/ a la raíz..." -ForegroundColor Yellow
    
    $nestedPublicHtml = "public_html\public_html"
    Get-ChildItem -Path $nestedPublicHtml | ForEach-Object {
        $target = $_.Name
        if ($target -ne "public_html") {  # Evitar recursión
            Move-Item -Path $_.FullName -Destination "." -Force
            Write-Host "   ✓ Movido: $target" -ForegroundColor Green
        }
    }
    
    # Eliminar carpeta anidada vacía
    if ((Get-ChildItem -Path $nestedPublicHtml -ErrorAction SilentlyContinue | Measure-Object).Count -eq 0) {
        Remove-Item -Path $nestedPublicHtml -Force -ErrorAction SilentlyContinue
        Write-Host "   ✓ Eliminada carpeta anidada vacía" -ForegroundColor Green
    }
} else {
    Write-Host "1. No se encontró carpeta public_html anidada" -ForegroundColor Gray
}

# 2. Verificar estructura correcta
Write-Host ""
Write-Host "2. Verificando estructura..." -ForegroundColor Yellow

$requiredFiles = @(
    "index.html",
    "api\index.php",
    "api\config.php",
    ".htaccess"
)

$allPresent = $true
foreach ($file in $requiredFiles) {
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
    Write-Host "Ejecuta: .\prepare_git_deploy.ps1 primero" -ForegroundColor Yellow
    exit 1
}

# 3. Verificar que no haya archivos innecesarios
Write-Host ""
Write-Host "3. Verificando archivos innecesarios..." -ForegroundColor Yellow

$unnecessaryFiles = @(
    "frontend",
    ".git",
    "*.ps1",
    "*.md"
)

$foundUnnecessary = $false
foreach ($pattern in $unnecessaryFiles) {
    $files = Get-ChildItem -Path "." -Filter $pattern -ErrorAction SilentlyContinue
    if ($files) {
        foreach ($file in $files) {
            Write-Host "   ⚠ $($file.Name) (debe eliminarse del servidor)" -ForegroundColor Yellow
            $foundUnnecessary = $true
        }
    }
}

if ($foundUnnecessary) {
    Write-Host ""
    Write-Host "ADVERTENCIA: Hay archivos innecesarios en producción" -ForegroundColor Yellow
    Write-Host "Ejecuta: .\cleanup_production.ps1 para ver la lista completa" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Verificación completada" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

