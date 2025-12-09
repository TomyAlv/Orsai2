# Script para sincronizar archivos del proyecto a htdocs de XAMPP
# Ejecutar desde PowerShell: .\sync_to_htdocs.ps1

Write-Host "Sincronizando archivos a htdocs..." -ForegroundColor Green

$source = "C:\Users\Tomas\Desktop\orsai"
$destination = "C:\xampp\htdocs\orsai"

# Copiar API
Write-Host "Copiando archivos de API..." -ForegroundColor Yellow
Copy-Item -Path "$source\api\*" -Destination "$destination\api\" -Force -Recurse

# Copiar base de datos (solo estructura, no sobrescribir datos existentes)
Write-Host "Copiando base de datos..." -ForegroundColor Yellow
if (-not (Test-Path "$destination\db")) {
    New-Item -ItemType Directory -Path "$destination\db" -Force | Out-Null
}
Copy-Item -Path "$source\db\orsai.sqlite" -Destination "$destination\db\" -Force -ErrorAction SilentlyContinue

Write-Host "Sincronización completada!" -ForegroundColor Green
Write-Host "Los archivos están disponibles en: http://localhost/orsai/" -ForegroundColor Cyan






