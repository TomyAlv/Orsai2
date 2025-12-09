# Script PowerShell para compilar el frontend y preparar para deployment
# Ejecutar antes de hacer commit y push a GitHub

Write-Host "🔨 Compilando frontend..." -ForegroundColor Yellow

Set-Location frontend

# Instalar dependencias si no existen
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
    npm install
}

# Compilar
Write-Host "🏗️ Compilando aplicación..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend compilado correctamente" -ForegroundColor Green
    Write-Host "📦 Los archivos están en frontend/dist/frontend/browser/" -ForegroundColor Cyan
    Write-Host "🚀 Ahora puedes hacer commit y push a GitHub" -ForegroundColor Green
    Write-Host "💡 Render usará estos archivos compilados al construir la imagen Docker" -ForegroundColor Yellow
} else {
    Write-Host "❌ Error al compilar el frontend" -ForegroundColor Red
    exit 1
}

Set-Location ..

