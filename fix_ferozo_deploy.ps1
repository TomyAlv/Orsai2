# Script para mover archivos de public_html/ a la raíz del repositorio
# Esto es necesario porque Ferozo despliega desde la raíz del repo

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ajustando estructura para Ferozo Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que public_html existe
if (-not (Test-Path "public_html")) {
    Write-Host "Error: No se encontró la carpeta public_html" -ForegroundColor Red
    Write-Host "Ejecuta primero: .\prepare_git_deploy.ps1" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar que index.html existe en public_html
if (-not (Test-Path "public_html\index.html")) {
    Write-Host "Error: No se encontró index.html en public_html" -ForegroundColor Red
    Write-Host "Ejecuta primero: .\prepare_git_deploy.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Moviendo archivos de public_html/ a la raíz..." -ForegroundColor Yellow

# 3. Mover archivos del frontend a la raíz
$frontendFiles = @("index.html", "main-*.js", "styles-*.css", "favicon.ico", ".htaccess")
foreach ($pattern in $frontendFiles) {
    $files = Get-ChildItem -Path "public_html" -Filter $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $destPath = Join-Path "." $file.Name
        if (Test-Path $destPath) {
            Remove-Item -Path $destPath -Force
        }
        Move-Item -Path $file.FullName -Destination $destPath -Force
        Write-Host "   ✓ Movido: $($file.Name)" -ForegroundColor Green
    }
}

# 4. Verificar que api/ existe en public_html
if (Test-Path "public_html\api") {
    # Si api/ ya existe en la raíz, eliminarlo primero
    if (Test-Path "api") {
        Write-Host "2. La carpeta api/ ya existe en la raíz, se mantendrá" -ForegroundColor Yellow
    } else {
        Write-Host "2. La carpeta api/ ya está en la raíz" -ForegroundColor Green
    }
} else {
    Write-Host "2. Advertencia: No se encontró api/ en public_html" -ForegroundColor Yellow
}

# 5. Verificar que db/ existe
if (Test-Path "public_html\db") {
    if (-not (Test-Path "db")) {
        New-Item -ItemType Directory -Path "db" -Force | Out-Null
    }
    Write-Host "3. La carpeta db/ ya existe en la raíz" -ForegroundColor Green
}

# 6. Verificación final
Write-Host ""
Write-Host "4. Verificando archivos esenciales en la raíz..." -ForegroundColor Yellow
$essentials = @("index.html", ".htaccess")
$allPresent = $true
foreach ($file in $essentials) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file" -ForegroundColor Red
        $allPresent = $false
    }
}

# Verificar archivos JS y CSS
$jsFiles = Get-ChildItem -Path "." -Filter "main-*.js"
$cssFiles = Get-ChildItem -Path "." -Filter "styles-*.css"
if ($jsFiles) {
    Write-Host "   ✓ $($jsFiles.Name)" -ForegroundColor Green
} else {
    Write-Host "   ✗ main-*.js" -ForegroundColor Red
    $allPresent = $false
}
if ($cssFiles) {
    Write-Host "   ✓ $($cssFiles.Name)" -ForegroundColor Green
} else {
    Write-Host "   ✗ styles-*.css" -ForegroundColor Red
    $allPresent = $false
}

if (-not $allPresent) {
    Write-Host ""
    Write-Host "Error: Faltan archivos esenciales" -ForegroundColor Red
    Write-Host "Ejecuta primero: .\prepare_git_deploy.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "¡Ajuste completado!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Revisa que index.html esté en la raíz del repositorio" -ForegroundColor White
Write-Host "2. Haz commit y push:" -ForegroundColor White
Write-Host "   git add index.html main-*.js styles-*.css favicon.ico .htaccess" -ForegroundColor Cyan
Write-Host "   git commit -m 'Mover archivos de deploy a la raíz para Ferozo'" -ForegroundColor Cyan
Write-Host "   git push origin main" -ForegroundColor Cyan
Write-Host "3. En Ferozo, configura:" -ForegroundColor White
Write-Host "   - Repositorio: git@github.com:TomyAlv/Orsai2.git" -ForegroundColor Cyan
Write-Host "   - Rama: main" -ForegroundColor Cyan
Write-Host "   - Directorio: (dejar vacío o poner '/')" -ForegroundColor Cyan
Write-Host ""

