# Guía de Deployment en DonWeb/Ferozo Hosting

## Configuración en el Panel de DonWeb

### Datos para Git Deployment:

- **Repositorio**: `git@github.com:TomyAlv/Orsai2.git`
- **Rama**: `main`
- **Directorio**: `public_html/` (dejar vacío o especificar la ruta completa)

### ⚠️ IMPORTANTE

**El directorio de implementación debe estar completamente vacío antes del primer deploy.**

## Estructura del Proyecto en el Hosting

Después del deployment, la estructura será:

```
public_html/
├── api/                    # Backend PHP
│   ├── index.php
│   ├── config.php
│   ├── db.php
│   ├── jwt.php
│   ├── init_db.php
│   └── ... (otros archivos PHP)
├── db/                     # Base de datos SQLite (se crea automáticamente)
│   └── .gitkeep
├── index.html              # Aplicación Angular compilada
├── main.js                 # JavaScript de Angular
├── styles.css              # Estilos compilados
├── favicon.ico
└── .htaccess              # Configuración de routing y seguridad
```

## Pasos Post-Deployment

### 1. Inicializar Base de Datos

Después del primer deploy, accede a:
```
https://tudominio.com/api/init_db.php
```

Esto creará:
- La base de datos SQLite en `db/orsai.sqlite`
- Todas las tablas necesarias

### 2. Configurar Permisos

Asegúrate de que la carpeta `db/` tenga permisos de escritura:
- Permisos recomendados: **755** o **775**
- Puedes configurarlo desde el panel de DonWeb o vía FTP

### 3. Configurar API Key de API-Football (Opcional)

Si quieres sincronizar partidos reales:
1. Edita `api/config.php` vía FTP o panel de archivos
2. Configura tu API key:
   ```php
   define('API_FOOTBALL_KEY', 'tu_api_key_aqui');
   ```

### 4. Verificar Funcionamiento

1. **Frontend**: Accede a `https://tudominio.com`
2. **API**: Verifica con `https://tudominio.com/api/index.php?action=ping`
3. **Base de datos**: Verifica que `db/orsai.sqlite` se haya creado

## Configuración de Build Automático

Si DonWeb/Ferozo soporta build automático, puedes configurar:

### Script de Build (si está disponible):

```bash
cd frontend
npm install
npm run build -- --configuration production
cp -r dist/frontend/browser/* ../public_html/
cp ../.htaccess ../public_html/
cp -r ../api ../public_html/
mkdir -p ../public_html/db
```

## Solución de Problemas

### Error 404 en rutas de Angular

- Verifica que `.htaccess` esté en la raíz de `public_html/`
- Verifica que `mod_rewrite` esté habilitado en Apache
- Contacta al soporte de DonWeb si persiste

### Error al acceder a la API

- Verifica que los archivos PHP estén en `public_html/api/`
- Verifica permisos de la carpeta `api/` (debe ser 755)
- Verifica que PHP esté habilitado en el hosting

### Error al crear base de datos

- Verifica permisos de escritura en `db/` (chmod 755 o 775)
- Verifica que SQLite esté habilitado en PHP
- Contacta al soporte si SQLite no está disponible

### CORS Errors

- El `.htaccess` en `api/` ya incluye headers CORS
- Si persisten, ajusta `Access-Control-Allow-Origin` en `api/.htaccess` con tu dominio específico

## URLs Importantes

- **Aplicación**: `https://tudominio.com`
- **API Ping**: `https://tudominio.com/api/index.php?action=ping`
- **Inicializar BD**: `https://tudominio.com/api/init_db.php`
- **Panel Admin**: `https://tudominio.com/admin` (después de iniciar sesión)

## Notas de Seguridad

- La base de datos SQLite está protegida por `.htaccess`
- Los archivos de configuración están protegidos
- Ajusta CORS en producción para permitir solo tu dominio
- Considera usar HTTPS (SSL) para mayor seguridad

## Actualizaciones Futuras

Para actualizar la aplicación:

1. Haz cambios en tu repositorio local
2. Haz commit y push a GitHub
3. En DonWeb, el sistema detectará los cambios y hará el deploy automático
4. Si es necesario, ejecuta `init_db.php` nuevamente para actualizar la estructura de BD

