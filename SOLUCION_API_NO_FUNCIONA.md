# 🔧 Solución: APIs No Funcionan en Producción

## Problema

Las APIs no están trayendo datos en producción (`orsai.online`), pero funcionan correctamente en local:
- API de ESPN para noticias → No trae noticias
- API de partidos/equipos/torneos → No trae partidos

## Posibles Causas

### 1. Problema con `.htaccess` y Routing

El `.htaccess` puede no estar redirigiendo correctamente las peticiones a `/api/index.php`.

**Solución**: Verificar que el `.htaccess` tenga las reglas correctas (ya corregido).

### 2. `allow_url_fopen` Deshabilitado

Muchos servidores de hosting deshabilitan `allow_url_fopen` por seguridad, lo que impide que PHP acceda a URLs externas (ESPN RSS, API-Football).

**Solución**: Usar cURL como método alternativo (ya implementado en el código).

### 3. Base de Datos No Inicializada

Si la base de datos no existe en el servidor, las consultas fallarán.

**Solución**: Ejecutar `https://orsai.online/api/init_db.php`

### 4. Permisos de Escritura

La carpeta `db/` debe tener permisos de escritura para crear la base de datos.

**Solución**: Configurar permisos 755 o 775 en la carpeta `db/`

### 5. CORS o Headers

Aunque CORS está configurado, puede haber conflictos con los headers del servidor.

## Diagnóstico

### Paso 1: Ejecutar Script de Diagnóstico

Accede a: `https://orsai.online/api/test_api.php`

Este script verificará:
- ✅ `allow_url_fopen` habilitado
- ✅ cURL disponible
- ✅ SimpleXML disponible
- ✅ Acceso a ESPN RSS
- ✅ Base de datos existente y accesible
- ✅ Permisos de escritura en `db/`

### Paso 2: Verificar API Directamente

Prueba estos endpoints directamente en el navegador:

1. **Ping de API**:
   ```
   https://orsai.online/api/index.php?action=ping
   ```
   Debe responder: `{"status":"ok","message":"API orsai funcionando",...}`

2. **Noticias**:
   ```
   https://orsai.online/api/index.php?action=news
   ```
   Debe responder con un array de noticias o un error específico.

3. **Partidos**:
   ```
   https://orsai.online/api/index.php?action=matches
   ```
   Debe responder con un array de partidos (puede estar vacío si no hay partidos sincronizados).

### Paso 3: Verificar Consola del Navegador

Abre las herramientas de desarrollador (F12) y revisa:
- **Console**: Busca errores de JavaScript o CORS
- **Network**: Verifica las peticiones a `/api/`:
  - ¿Se están haciendo las peticiones?
  - ¿Qué código de respuesta devuelven? (200, 404, 500, etc.)
  - ¿Hay errores CORS?

## Soluciones Implementadas

### 1. Script de Diagnóstico

Se creó `api/test_api.php` que verifica todos los componentes necesarios.

### 2. Mejora en `.htaccess`

Se corrigió la regla de rewrite para la API.

### 3. Manejo de Errores Mejorado

El código ya tiene manejo de errores con cURL como respaldo si `allow_url_fopen` está deshabilitado.

## Pasos para Resolver

### Si `allow_url_fopen` está deshabilitado:

1. **Contacta al soporte de DonWeb/Ferozo** y solicita habilitar `allow_url_fopen` en `php.ini`
2. O **usa cURL** (ya implementado como respaldo)

### Si la base de datos no existe:

1. Accede a: `https://orsai.online/api/init_db.php`
2. Debe mostrar: `{"status":"ok","message":"Tablas creadas"}`

### Si hay problemas de permisos:

1. Desde el File Manager de DonWeb, verifica permisos de `db/`
2. Debe ser **755** o **775**
3. Si no puedes cambiarlo, contacta al soporte

### Si hay errores CORS:

1. Verifica que `api/.htaccess` tenga los headers CORS correctos
2. Verifica que `api/index.php` tenga los headers CORS en PHP

## Verificación Final

Después de aplicar las soluciones:

1. ✅ `https://orsai.online/api/test_api.php` → Todos los checks en verde
2. ✅ `https://orsai.online/api/index.php?action=ping` → Responde OK
3. ✅ `https://orsai.online/api/index.php?action=news` → Trae noticias
4. ✅ `https://orsai.online/api/index.php?action=matches` → Responde (puede estar vacío)
5. ✅ `https://orsai.online` → Muestra noticias y partidos

## ⚠️ Problemas Adicionales Identificados

### Estructura del Servidor

Según las capturas del servidor, hay problemas de estructura:

1. **Carpeta `public_html/public_html/` anidada** - Estructura incorrecta
2. **Archivos innecesarios en producción**:
   - `frontend/` (código fuente, no necesario)
   - `.git/` (repositorio Git, no necesario)
   - Archivos `.md` (documentación, no necesaria)
   - Scripts `.ps1` y `.sh` (scripts de desarrollo)

### Solución para Estructura

1. **Lee**: `GUIA_LIMPIEZA_PRODUCCION.md` para instrucciones detalladas
2. **Usa**: `CHECKLIST_PRODUCCION_COMPLETO.md` para verificación paso a paso
3. **Ejecuta**: `prepare_production_deploy.ps1` para preparar el deploy correcto

### Nota sobre Ferozo

Ferozo despliega desde la **raíz del repositorio**, NO desde una carpeta `public_html/` dentro del repo. Los archivos deben estar directamente en la raíz del repositorio.

## Contacto con Soporte

Si después de seguir estos pasos el problema persiste, contacta al soporte de DonWeb/Ferozo con:

1. El resultado de `test_api.php`
2. Los logs de error de PHP (si están disponibles)
3. Los errores de la consola del navegador

¡Buena suerte! 🚀

