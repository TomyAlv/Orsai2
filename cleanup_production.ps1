# Script para limpiar archivos innecesarios del servidor de producción
# Este script identifica archivos que NO deben estar en producción

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Limpieza de Archivos de Producción" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Archivos y carpetas que NO deben estar en producción
$excludePatterns = @(
    # Carpetas de desarrollo
    "frontend",
    ".git",
    "node_modules",
    "public_html",  # Carpeta anidada que no debería existir
    
    # Archivos de desarrollo
    "*.ps1",
    "*.sh",
    "*.md",
    "*.log",
    ".gitignore",
    ".gitlab-ci.yml",
    "ferozo.json",
    "ARCHIVOS_A_EXCLUIR.md",
    "CHECKLIST_PRESENTACION.md",
    "deploy_donweb.md",
    "DOCUMENTO_TECNICO_DEFENSA.md",
    "GUIA_PRESENTACION_EXAMEN.md",
    "INSTRUCCIONES.md",
    "INSTRUCCIONES_DONWEB.md",
    "INSTRUCCIONES_ZIP.md",
    "LISTA_ARCHIVOS_ENTREGA.md",
    "Pautas Examen.md",
    "PREPARACION_EXAMEN_COMPLETA.md",
    "README.md",
    "README_DEPLOY.md",
    "RESUMEN_PRESENTACION.md",
    "SOLUCION_*.md",
    "preparar_entrega.ps1",
    "prepare_git_deploy.ps1",
    "fix_ferozo_deploy.ps1",
    "build_for_hosting.ps1",
    "deploy_setup.sh",
    "sync_to_htdocs.ps1"
)

Write-Host "Archivos que deben ser eliminados del servidor:" -ForegroundColor Yellow
Write-Host ""

$filesToDelete = @()

# Buscar archivos a eliminar
Get-ChildItem -Path "." -Recurse -File | ForEach-Object {
    $file = $_
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    
    foreach ($pattern in $excludePatterns) {
        if ($relativePath -like $pattern -or $relativePath -match $pattern) {
            $filesToDelete += $file
            Write-Host "  ✗ $relativePath" -ForegroundColor Red
            break
        }
    }
}

# Buscar carpetas a eliminar
Get-ChildItem -Path "." -Directory | ForEach-Object {
    $dir = $_
    $relativePath = $dir.FullName.Replace((Get-Location).Path + "\", "")
    
    if ($relativePath -in @("frontend", ".git", "node_modules", "public_html")) {
        $filesToDelete += $dir
        Write-Host "  ✗ $relativePath/" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Total de archivos/carpetas a eliminar: $($filesToDelete.Count)" -ForegroundColor Yellow
Write-Host ""
Write-Host "NOTA: Este script solo muestra los archivos. Para eliminarlos del servidor:" -ForegroundColor Cyan
Write-Host "1. Usa el File Manager de DonWeb/Ferozo" -ForegroundColor White
Write-Host "2. Elimina manualmente los archivos listados arriba" -ForegroundColor White
Write-Host "3. O ejecuta este script en el servidor (si tienes acceso SSH)" -ForegroundColor White
Write-Host ""

