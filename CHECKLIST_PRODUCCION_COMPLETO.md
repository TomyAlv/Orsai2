# ✅ Checklist Completo para Producción - orsai.online

## 🔍 Problemas Identificados

1. ❌ **API devuelve código PHP en lugar de JSON** - `.htaccess` corregido
2. ❌ **Carpeta `public_html/public_html/` anidada** - Estructura incorrecta
3. ❌ **Archivos innecesarios en producción** - `frontend/`, `.git/`, `.md`, scripts

## 📋 Checklist de Verificación

### 1. Estructura de Archivos

- [ ] `index.html` está en la raíz de `public_html/`
- [ ] `main-*.js` está en la raíz de `public_html/`
- [ ] `styles-*.css` está en la raíz de `public_html/`
- [ ] `api/index.php` existe y es accesible
- [ ] `api/config.php` existe
- [ ] `.htaccess` está en la raíz de `public_html/`
- [ ] `api/.htaccess` existe
- [ ] `db/` existe (puede estar vacía inicialmente)

### 2. Archivos a ELIMINAR del Servidor

- [ ] `public_html/public_html/` (carpeta anidada completa)
- [ ] `public_html/frontend/` (carpeta completa)
- [ ] `public_html/.git/` (carpeta completa)
- [ ] Todos los archivos `.md` (excepto si quieres mantener alguno)
- [ ] Todos los scripts `.ps1` y `.sh`
- [ ] `public_html/.gitignore`
- [ ] `public_html/.gitlab-ci.yml`
- [ ] `public_html/ferozo.json`

### 3. Verificación de API

#### 3.1. Ping de API
```
https://orsai.online/api/index.php?action=ping
```
**Resultado esperado:**
```json
{"status":"ok","message":"API orsai funcionando","time":"2025-12-10T..."}
```
- [ ] Responde JSON válido
- [ ] NO devuelve código PHP

#### 3.2. Script de Diagnóstico
```
https://orsai.online/api/test_api.php
```
**Verificar:**
- [ ] `allow_url_fopen` habilitado o cURL disponible
- [ ] SimpleXML disponible
- [ ] Acceso a ESPN RSS funciona
- [ ] Base de datos existe y es accesible
- [ ] Permisos de escritura en `db/`

#### 3.3. API de Noticias
```
https://orsai.online/api/index.php?action=news
```
**Resultado esperado:**
```json
{"status":"ok","news":[...]}
```
- [ ] Responde JSON válido
- [ ] Contiene array de noticias
- [ ] NO devuelve código PHP

#### 3.4. API de Partidos
```
https://orsai.online/api/index.php?action=matches
```
**Resultado esperado:**
```json
{"status":"ok","matches":[...]}
```
- [ ] Responde JSON válido
- [ ] NO devuelve código PHP

### 4. Verificación del Frontend

#### 4.1. Página Principal
```
https://orsai.online
```
- [ ] Carga correctamente
- [ ] Muestra noticias de ESPN
- [ ] Muestra lista de partidos (puede estar vacía)
- [ ] NO hay errores en la consola (F12)

#### 4.2. Consola del Navegador (F12)
- [ ] NO hay errores de JavaScript
- [ ] Las peticiones a `/api/` devuelven JSON
- [ ] NO hay errores CORS
- [ ] Las URLs son `https://orsai.online/api/...` (NO `localhost`)

### 5. Base de Datos

#### 5.1. Inicialización
```
https://orsai.online/api/init_db.php
```
**Resultado esperado:**
```json
{"status":"ok","message":"Tablas creadas"}
```
- [ ] Base de datos inicializada
- [ ] Tablas creadas correctamente

#### 5.2. Permisos
- [ ] Carpeta `db/` tiene permisos 755 o 775
- [ ] Archivo `db/orsai.sqlite` tiene permisos 644 o 664

### 6. Configuración de .htaccess

#### 6.1. Raíz (`public_html/.htaccess`)
- [ ] Reglas de API están ANTES de reglas de Angular
- [ ] RewriteEngine On
- [ ] Regla para `/api/` redirige a `api/index.php`

#### 6.2. API (`public_html/api/.htaccess`)
- [ ] Headers CORS configurados
- [ ] Archivos sensibles protegidos

## 🛠️ Pasos de Corrección

### Paso 1: Limpiar Estructura del Servidor

1. Accede al **File Manager** de DonWeb/Ferozo
2. Elimina manualmente:
   - `public_html/public_html/` (carpeta completa)
   - `public_html/frontend/` (carpeta completa)
   - `public_html/.git/` (carpeta completa)
   - Todos los archivos `.md`
   - Todos los scripts `.ps1` y `.sh`

### Paso 2: Verificar Archivos Esenciales

Asegúrate de que existan:
- `public_html/index.html`
- `public_html/api/index.php`
- `public_html/.htaccess`
- `public_html/api/.htaccess`

### Paso 3: Inicializar Base de Datos

1. Accede a: `https://orsai.online/api/init_db.php`
2. Verifica que responda: `{"status":"ok","message":"Tablas creadas"}`

### Paso 4: Verificar Permisos

1. Carpeta `db/`: 755 o 775
2. Archivo `db/orsai.sqlite`: 644 o 664

### Paso 5: Probar APIs

1. **Ping**: `https://orsai.online/api/index.php?action=ping`
2. **Diagnóstico**: `https://orsai.online/api/test_api.php`
3. **Noticias**: `https://orsai.online/api/index.php?action=news`
4. **Partidos**: `https://orsai.online/api/index.php?action=matches`

### Paso 6: Probar Frontend

1. Accede a: `https://orsai.online`
2. Abre la consola (F12)
3. Verifica que no haya errores
4. Verifica que las peticiones a `/api/` funcionen

## 🐛 Solución de Problemas

### Problema: API devuelve código PHP

**Causa:** PHP no se está ejecutando o `.htaccess` no funciona

**Solución:**
1. Verifica que `.htaccess` esté en la raíz de `public_html/`
2. Verifica que las reglas de API estén ANTES de las de Angular
3. Contacta al soporte de DonWeb si PHP no está habilitado

### Problema: Error CORS

**Causa:** Headers CORS no configurados correctamente

**Solución:**
1. Verifica `api/.htaccess` tiene headers CORS
2. Verifica `api/index.php` tiene headers CORS en PHP

### Problema: Base de datos no existe

**Causa:** No se ha inicializado la base de datos

**Solución:**
1. Accede a: `https://orsai.online/api/init_db.php`
2. Verifica permisos de la carpeta `db/`

### Problema: No se obtienen noticias

**Causa:** `allow_url_fopen` deshabilitado o cURL no disponible

**Solución:**
1. Verifica con `test_api.php`
2. El código ya usa cURL como respaldo
3. Contacta al soporte si ambos fallan

## 📝 Notas Finales

1. **Ferozo despliega desde la raíz del repositorio** - NO necesitas carpeta `public_html/` en el repo
2. **Los archivos compilados deben estar en la raíz** - No en subcarpetas
3. **Elimina archivos de desarrollo** - No son necesarios en producción
4. **Mantén solo lo esencial** - Frontend compilado, API PHP, base de datos

## ✅ Estado Final Esperado

Después de completar todos los pasos:

- ✅ `https://orsai.online` carga correctamente
- ✅ `https://orsai.online/api/index.php?action=ping` responde JSON
- ✅ `https://orsai.online/api/index.php?action=news` trae noticias
- ✅ `https://orsai.online/api/index.php?action=matches` trae partidos
- ✅ No hay errores en la consola del navegador
- ✅ Estructura limpia sin archivos innecesarios

¡Listo! 🚀

