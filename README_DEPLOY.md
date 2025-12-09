# 🚀 Guía de Deployment en DonWeb/Ferozo

## Configuración Rápida en el Panel de DonWeb

### Datos para Git Deployment:

```
Repositorio: git@github.com:TomyAlv/Orsai2.git
Rama: main
Directorio: public_html/
```

**⚠️ IMPORTANTE**: El directorio `public_html/` debe estar **completamente vacío** antes del primer deploy.

## Opción 1: Deploy Automático vía Git (Recomendado)

Si DonWeb/Ferozo soporta build automático:

1. Configura el repositorio en el panel
2. El sistema detectará los cambios automáticamente
3. Los archivos se desplegarán en `public_html/`

## Opción 2: Deploy Manual

Si necesitas preparar los archivos manualmente:

### Windows (PowerShell):

```powershell
.\build_for_hosting.ps1
```

Esto creará un directorio `deploy_public_html/` con todos los archivos listos.

### Linux/Mac:

```bash
chmod +x deploy_setup.sh
./deploy_setup.sh
```

Luego sube el contenido de `deploy_public_html/` a `public_html/` vía FTP.

## Estructura Final en el Hosting

```
public_html/
├── api/                    # Backend PHP
│   ├── index.php
│   ├── config.php
│   ├── db.php
│   ├── jwt.php
│   ├── init_db.php
│   └── .htaccess
├── db/                     # Base de datos (se crea automáticamente)
│   └── .gitkeep
├── index.html              # Aplicación Angular
├── main.js                 # JavaScript compilado
├── styles.css              # Estilos compilados
├── favicon.ico
└── .htaccess              # Configuración de routing
```

## Pasos Post-Deployment

### 1. Inicializar Base de Datos

Accede a:
```
https://tudominio.com/api/init_db.php
```

Esto creará la base de datos SQLite y todas las tablas.

### 2. Configurar Permisos

Asegúrate de que la carpeta `db/` tenga permisos de escritura:
- **Permisos recomendados**: 755 o 775
- Configúralo desde el panel de DonWeb o vía FTP

### 3. Configurar API Key (Opcional)

Si quieres sincronizar partidos reales:

1. Edita `api/config.php` vía FTP o panel de archivos
2. Configura tu API key de API-Football:
   ```php
   define('API_FOOTBALL_KEY', 'tu_api_key_aqui');
   ```

### 4. Verificar Funcionamiento

- **Frontend**: `https://tudominio.com`
- **API**: `https://tudominio.com/api/index.php?action=ping`
- **Base de datos**: Verifica que `db/orsai.sqlite` se haya creado

## Solución de Problemas

### Error 404 en rutas de Angular

- ✅ Verifica que `.htaccess` esté en la raíz de `public_html/`
- ✅ Verifica que `mod_rewrite` esté habilitado en Apache
- ✅ Contacta al soporte de DonWeb si persiste

### Error al acceder a la API

- ✅ Verifica que los archivos PHP estén en `public_html/api/`
- ✅ Verifica permisos de la carpeta `api/` (debe ser 755)
- ✅ Verifica que PHP esté habilitado

### Error al crear base de datos

- ✅ Verifica permisos de escritura en `db/` (chmod 755 o 775)
- ✅ Verifica que SQLite esté habilitado en PHP
- ✅ Contacta al soporte si SQLite no está disponible

### CORS Errors

- ✅ El `.htaccess` en `api/` ya incluye headers CORS
- ✅ Si persisten, ajusta `Access-Control-Allow-Origin` en `api/.htaccess`

## URLs Importantes

- **Aplicación**: `https://tudominio.com`
- **API Ping**: `https://tudominio.com/api/index.php?action=ping`
- **Inicializar BD**: `https://tudominio.com/api/init_db.php`
- **Panel Admin**: `https://tudominio.com/admin` (después de iniciar sesión)

## Actualizaciones

Para actualizar la aplicación:

1. Haz cambios en tu repositorio local
2. Haz commit y push a GitHub
3. En DonWeb, el sistema detectará los cambios automáticamente
4. Si es necesario, ejecuta `init_db.php` nuevamente

## Notas de Seguridad

- ✅ La base de datos SQLite está protegida por `.htaccess`
- ✅ Los archivos de configuración están protegidos
- ✅ Ajusta CORS en producción para permitir solo tu dominio
- ✅ Considera usar HTTPS (SSL) para mayor seguridad

