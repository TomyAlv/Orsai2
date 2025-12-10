# Script para preparar public_html para deploy vía Git en Ferozo/DonWeb
# Este script compila Angular y prepara la carpeta public_html con todos los archivos necesarios

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Preparando public_html para Git Deploy" -ForegroundColor Cyan
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

# 2. Limpiar y crear carpeta public_html
Write-Host "2. Preparando carpeta public_html..." -ForegroundColor Yellow
if (Test-Path "public_html") {
    Remove-Item -Path "public_html" -Recurse -Force
}
New-Item -ItemType Directory -Path "public_html" | Out-Null
New-Item -ItemType Directory -Path "public_html\api" | Out-Null
New-Item -ItemType Directory -Path "public_html\db" | Out-Null

# 3. Copiar backend PHP
Write-Host "3. Copiando archivos del backend..." -ForegroundColor Yellow
Copy-Item -Path "api\*" -Destination "public_html\api\" -Recurse -Force -Exclude "*.log","*.tmp"

# 4. Copiar frontend compilado
Write-Host "4. Copiando frontend compilado..." -ForegroundColor Yellow
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
                Copy-Item -Path $_.FullName -Destination "public_html\" -Recurse -Force
            }
            Write-Host "   Frontend copiado desde: $path" -ForegroundColor Green
            $copied = $true
            break
        }
    }
}

if (-not $copied) {
    Write-Host "Error: No se encontró el build de Angular" -ForegroundColor Red
    Write-Host "   Buscado en:" -ForegroundColor Yellow
    foreach ($path in $frontendBuildPaths) {
        Write-Host "   - $path" -ForegroundColor Gray
    }
    exit 1
}

# 5. Copiar archivos de configuración
Write-Host "5. Copiando archivos de configuración..." -ForegroundColor Yellow
Copy-Item -Path ".htaccess" -Destination "public_html\.htaccess" -Force
Copy-Item -Path "api\.htaccess" -Destination "public_html\api\.htaccess" -Force
New-Item -ItemType File -Path "public_html\db\.gitkeep" -Force | Out-Null

# 6. Verificación
Write-Host "6. Verificando archivos esenciales..." -ForegroundColor Yellow
$essentials = @(
    "public_html\index.html",
    "public_html\api\index.php",
    "public_html\api\config.php",
    "public_html\.htaccess"
)

$allPresent = $true
foreach ($file in $essentials) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file" -ForegroundColor Red
        $allPresent = $false
    }
}

if (-not $allPresent) {
    Write-Host "Error: Faltan archivos esenciales" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "¡Preparación completada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Revisa el contenido de 'public_html'" -ForegroundColor White
Write-Host "2. Haz commit y push a GitHub:" -ForegroundColor White
Write-Host "   git add public_html/" -ForegroundColor Cyan
Write-Host "   git commit -m 'Preparar public_html para deploy'" -ForegroundColor Cyan
Write-Host "   git push origin main" -ForegroundColor Cyan
Write-Host "3. En Ferozo, configura:" -ForegroundColor White
Write-Host "   - Repositorio: git@github.com:TomyAlv/Orsai2.git" -ForegroundColor Cyan
Write-Host "   - Rama: main" -ForegroundColor Cyan
Write-Host "   - Directorio: public_html" -ForegroundColor Cyan
Write-Host ""
