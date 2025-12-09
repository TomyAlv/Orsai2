# Script para preparar el archivo de entrega del trabajo final
# Excluye node_modules, dist y otros archivos innecesarios

$nombreArchivo = "orsai_trabajo_final_Tomas_Alvarez_Arzuaga.zip"
$carpetaTemporal = "entrega_temporal"

Write-Host "Preparando archivo de entrega..." -ForegroundColor Green

# Crear carpeta temporal
if (Test-Path $carpetaTemporal) {
    Remove-Item -Path $carpetaTemporal -Recurse -Force
}
New-Item -ItemType Directory -Path $carpetaTemporal | Out-Null

Write-Host "Copiando archivos necesarios..." -ForegroundColor Yellow

# Copiar estructura del proyecto
$carpetasACopiar = @(
    "api",
    "db",
    "frontend\src",
    "frontend\angular.json",
    "frontend\package.json",
    "frontend\package-lock.json",
    "frontend\tsconfig.json",
    "frontend\tsconfig.app.json",
    "frontend\tsconfig.spec.json",
    "frontend\README.md",
    "public"
)

foreach ($item in $carpetasACopiar) {
    $origen = Join-Path "." $item
    if (Test-Path $origen) {
        $destino = Join-Path $carpetaTemporal $item
        $destinoDir = Split-Path $destino -Parent
        if (-not (Test-Path $destinoDir)) {
            New-Item -ItemType Directory -Path $destinoDir -Force | Out-Null
        }
        Copy-Item -Path $origen -Destination $destino -Recurse -Force
        Write-Host "  Copiado: $item" -ForegroundColor Gray
    }
}

# Copiar archivos de documentación
$archivosDoc = @(
    "README.md",
    "DOCUMENTO_TECNICO_DEFENSA.md",
    "INSTRUCCIONES.md",
    "Pautas Examen.md",
    "GUIA_PRESENTACION_EXAMEN.md"
)

foreach ($archivo in $archivosDoc) {
    if (Test-Path $archivo) {
        Copy-Item -Path $archivo -Destination $carpetaTemporal -Force
        Write-Host "  Copiado: $archivo" -ForegroundColor Gray
    }
}

# Eliminar archivos innecesarios si se copiaron
$archivosAEliminar = @(
    "frontend\node_modules",
    "frontend\dist",
    "db\*.sqlite",
    "db\*.db"
)

foreach ($patron in $archivosAEliminar) {
    $ruta = Join-Path $carpetaTemporal $patron
    if (Test-Path $ruta) {
        Remove-Item -Path $ruta -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  Eliminado: $patron" -ForegroundColor Gray
    }
}

Write-Host "`nCreando archivo ZIP..." -ForegroundColor Yellow

# Eliminar ZIP anterior si existe
if (Test-Path $nombreArchivo) {
    Remove-Item -Path $nombreArchivo -Force
}

# Crear ZIP
Compress-Archive -Path "$carpetaTemporal\*" -DestinationPath $nombreArchivo -Force

# Limpiar carpeta temporal
Remove-Item -Path $carpetaTemporal -Recurse -Force

$tamaño = (Get-Item $nombreArchivo).Length / 1MB
Write-Host "`n✅ Archivo creado: $nombreArchivo" -ForegroundColor Green
Write-Host "   Tamaño: $([math]::Round($tamaño, 2)) MB" -ForegroundColor Green
Write-Host "`nEl archivo está listo para entregar." -ForegroundColor Green

