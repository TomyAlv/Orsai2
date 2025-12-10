# 🧹 Guía de Limpieza para Producción

## Problema Identificado

En el servidor de producción (`orsai.online`) hay archivos y carpetas que **NO deben estar** en producción:

1. **Carpeta `public_html/public_html/` anidada** - Estructura incorrecta
2. **Carpeta `frontend/`** - Código fuente de Angular (no necesario en producción)
3. **Carpeta `.git/`** - Repositorio Git (no necesario en producción)
4. **Archivos `.md`** - Documentación (no necesaria en producción)
5. **Scripts `.ps1`, `.sh`** - Scripts de desarrollo (no necesarios en producción)

## Estructura Correcta para Producción

La estructura en `public_html/` del servidor debe ser:

```
public_html/
├── index.html              # ✅ Frontend compilado
├── main-*.js               # ✅ JavaScript compilado
├── styles-*.css            # ✅ CSS compilado
├── favicon.ico             # ✅ Favicon
├── assets/                 # ✅ Assets del frontend
├── .htaccess               # ✅ Configuración Apache
├── api/                    # ✅ Backend PHP
│   ├── index.php
│   ├── config.php
│   ├── db.php
│   ├── jwt.php
│   ├── init_db.php
│   ├── test_api.php
│   ├── .htaccess
│   └── ... (otros archivos PHP)
└── db/                     # ✅ Base de datos
    └── orsai.sqlite
```

## Pasos para Limpiar el Servidor

### Opción 1: Usar el File Manager de DonWeb/Ferozo

1. **Accede al File Manager** en el panel de DonWeb/Ferozo
2. **Elimina manualmente**:
   - `public_html/public_html/` (carpeta anidada completa)
   - `public_html/frontend/` (carpeta completa)
   - `public_html/.git/` (carpeta completa)
   - Todos los archivos `.md` (excepto si quieres mantener alguno)
   - Todos los scripts `.ps1` y `.sh`

### Opción 2: Usar Script de Limpieza (si tienes acceso SSH)

Si tienes acceso SSH al servidor, puedes usar el script `cleanup_production.ps1` (adaptado para Linux):

```bash
# Convertir a bash
chmod +x cleanup_production.sh
./cleanup_production.sh
```

## Verificación Post-Limpieza

Después de limpiar, verifica que:

1. ✅ `index.html` está en la raíz de `public_html/`
2. ✅ `api/index.php` existe y es accesible
3. ✅ `.htaccess` está en la raíz de `public_html/`
4. ✅ NO hay carpeta `public_html/public_html/`
5. ✅ NO hay carpeta `frontend/`
6. ✅ NO hay carpeta `.git/`

## Scripts de Preparación

### `prepare_production_deploy.ps1`

Este script:
- Compila Angular para producción
- Copia los archivos compilados a la raíz del repositorio
- Verifica que todos los archivos esenciales estén presentes

**Uso:**
```powershell
.\prepare_production_deploy.ps1
```

### `fix_production_structure.ps1`

Este script:
- Mueve archivos de `public_html/public_html/` a la raíz
- Verifica la estructura correcta
- Identifica archivos innecesarios

**Uso:**
```powershell
.\fix_production_structure.ps1
```

### `cleanup_production.ps1`

Este script:
- Identifica archivos que NO deben estar en producción
- Muestra una lista de archivos a eliminar

**Uso:**
```powershell
.\cleanup_production.ps1
```

## Notas Importantes

1. **NO elimines**:
   - `api/` (necesario para el backend)
   - `db/` (necesario para la base de datos)
   - `.htaccess` (necesario para routing)
   - `index.html` y archivos compilados (necesarios para el frontend)

2. **Sí elimina**:
   - Código fuente de Angular (`frontend/`)
   - Repositorio Git (`.git/`)
   - Documentación (`.md`)
   - Scripts de desarrollo (`.ps1`, `.sh`)

3. **Estructura de Ferozo**:
   - Ferozo despliega desde la **raíz del repositorio**
   - NO necesitas una carpeta `public_html/` en el repositorio
   - Los archivos deben estar directamente en la raíz del repo

## Después de Limpiar

1. **Verifica que la API funcione**:
   ```
   https://orsai.online/api/index.php?action=ping
   ```

2. **Verifica que el frontend cargue**:
   ```
   https://orsai.online
   ```

3. **Ejecuta el diagnóstico**:
   ```
   https://orsai.online/api/test_api.php
   ```

¡Listo! 🚀

