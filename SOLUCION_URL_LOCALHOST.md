# 🔧 Solución: URLs de localhost en Producción

## Problema

El error `ERR_BLOCKED_BY_CLIENT` y las URLs `http://localhost/orsai/api/` en la consola indican que:

1. **El código compilado de Angular está usando la URL de desarrollo** (`http://localhost/orsai/api`) en lugar de la URL de producción (`/api`)
2. Esto causa que el navegador intente hacer peticiones a `localhost` desde `orsai.online`, lo cual no puede funcionar

## Causa

El build de producción no se aplicó correctamente, o los archivos compilados en la raíz del repositorio son de una versión anterior con la configuración de desarrollo.

## Solución Implementada

1. ✅ Recompilado Angular con configuración de producción
2. ✅ Actualizados los archivos en la raíz del repositorio:
   - `index.html`
   - `main-*.js` (JavaScript compilado)
   - `styles-*.css` (Estilos compilados)
   - `favicon.ico`

## Verificación

Después del deploy (2-5 minutos), verifica:

1. **Abre las herramientas de desarrollador (F12)**
2. **Ve a la pestaña Network**
3. **Recarga la página**
4. **Busca las peticiones a la API**:
   - ✅ Deben ser a: `https://orsai.online/api/index.php?action=...`
   - ❌ NO deben ser a: `http://localhost/orsai/api/...`

5. **Verifica la consola**:
   - ✅ No debe haber errores `ERR_BLOCKED_BY_CLIENT` relacionados con localhost
   - ✅ Las peticiones deben completarse correctamente

## Si el Problema Persiste

### Opción 1: Limpiar Cache del Navegador

1. Presiona `Ctrl + Shift + Delete` (o `Cmd + Shift + Delete` en Mac)
2. Selecciona "Caché" o "Cached images and files"
3. Haz clic en "Borrar datos"
4. Recarga la página con `Ctrl + F5` (forzar recarga)

### Opción 2: Verificar Archivos en el Servidor

1. Accede al File Manager de DonWeb/Ferozo
2. Verifica que `index.html` y `main-*.js` estén actualizados (fecha reciente)
3. Si no están actualizados, espera unos minutos más para el deploy

### Opción 3: Verificar Build Manualmente

Si necesitas recompilar manualmente:

```powershell
# 1. Compilar Angular
cd frontend
npm run build -- --configuration production

# 2. Copiar archivos a la raíz
cd ..
$browserPath = "frontend\dist\browser\browser"
if (Test-Path $browserPath) {
    Copy-Item -Path "$browserPath\*" -Destination "." -Recurse -Force
}

# 3. Commit y push
git add index.html main-*.js styles-*.css favicon.ico
git commit -m "Actualizar build de producción"
git push origin main
```

## Prevención

Para evitar este problema en el futuro:

1. **Siempre usa el script de preparación**:
   ```powershell
   .\prepare_git_deploy.ps1
   .\fix_ferozo_deploy.ps1
   ```

2. **Verifica el environment.prod.ts** antes de compilar:
   ```typescript
   export const environment = {
     production: true,
     apiBaseUrl: '/api'  // ← Debe ser relativo, NO localhost
   };
   ```

3. **Después de compilar, verifica que no haya "localhost" en los archivos**:
   ```powershell
   Select-String -Path "index.html", "main-*.js" -Pattern "localhost"
   ```
   No debe encontrar nada.

¡Listo! 🚀

