# Resumen del Paquete para Hosting

## 📦 Archivo Creado

El script `crear_paquete_hosting.ps1` ha generado un archivo ZIP con todos los archivos necesarios para subir la aplicación a un hosting tradicional.

**Ubicación del archivo:** `orsai_hosting_[fecha_hora].zip`

## ✅ Archivos Incluidos

### Frontend (Angular)
- ✅ Código fuente completo (`src/`)
- ✅ Archivos de configuración (`angular.json`, `package.json`, `tsconfig.json`)
- ✅ Archivos públicos (`public/`)
- ❌ **NO incluye** `node_modules/` (instalar en el servidor)
- ❌ **NO incluye** `dist/` (generar con `npm run build`)

### Backend (PHP)
- ✅ Todos los archivos PHP necesarios
- ✅ Archivos de configuración (`config.php`, `db.php`, `jwt.php`)
- ✅ Scripts de inicialización (`init_db.php`)
- ✅ `.htaccess` para Apache
- ✅ Carpeta `db/` (vacía, se creará la BD automáticamente)
- ❌ **NO incluye** archivos de Railway/Docker (Dockerfile, Procfile, etc.)
- ❌ **NO incluye** archivos de prueba (`test_*.php`)
- ❌ **NO incluye** bases de datos (`.sqlite`, `.db`)

### Documentación
- ✅ `README.md`
- ✅ `INSTRUCCIONES_HOSTING.txt` (generado automáticamente)
- ✅ `.gitignore`

## ❌ Archivos Excluidos (según .gitignore)

- `node_modules/` - Dependencias de Node.js
- `dist/` - Build de producción (generar en el servidor)
- `*.sqlite`, `*.db` - Bases de datos
- `.env`, `.env.local` - Variables de entorno
- `*.log`, `*.tmp` - Archivos temporales
- `.vscode/`, `.idea/` - Configuración de editores
- `Dockerfile`, `Procfile`, `railway.json` - Archivos de deployment en la nube
- Archivos comprimidos anteriores

## 📋 Pasos para Desplegar en Hosting

### 1. Extraer el archivo ZIP
```bash
unzip orsai_hosting_*.zip
```

### 2. Frontend (Angular)

```bash
cd frontend
npm install
npm run build
```

Luego subir la carpeta `frontend/dist/frontend/browser/` al directorio web del hosting.

### 3. Backend (PHP)

Subir toda la carpeta `api/` al servidor.

**Requisitos:**
- PHP 8.2 o superior
- Extensiones: `pdo`, `pdo_sqlite`
- Permisos de escritura en `api/db/`

**Configurar variables de entorno:**
- Editar `api/config.php` y establecer:
  - `API_FOOTBALL_KEY`
  - `JWT_SECRET`

### 4. Base de Datos

La base de datos SQLite se creará automáticamente al ejecutar la aplicación por primera vez.

Asegurar permisos de escritura en `api/db/`:
```bash
chmod 777 api/db/
```

### 5. Configurar CORS

Si el frontend y backend están en dominios diferentes, editar `api/index.php` para permitir el dominio del frontend.

### 6. Configurar Apache (si aplica)

El archivo `.htaccess` ya está incluido. Asegurarse de que `mod_rewrite` esté habilitado.

## 🔧 Configuración Adicional

### Variables de Entorno

Si el hosting soporta variables de entorno, configurar:
- `API_FOOTBALL_KEY` - Clave de API-Football
- `JWT_SECRET` - Secret para JWT (generar uno seguro)
- `DB_PATH` - Ruta a la base de datos (opcional)

### URL del Backend

Editar `frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://tu-dominio.com/api'
};
```

## 📝 Notas Importantes

1. **No subir archivos sensibles:**
   - No incluir `.env` con API keys reales
   - No incluir bases de datos con datos reales
   - No incluir `node_modules` (instalar en el servidor)

2. **Compilar antes de subir:**
   - El frontend debe compilarse con `npm run build`
   - Solo subir la carpeta `dist/` compilada

3. **Permisos:**
   - `api/db/` debe tener permisos de escritura
   - Archivos PHP deben tener permisos de lectura

4. **Base de datos:**
   - SQLite se crea automáticamente
   - Para producción, considerar migrar a MySQL/PostgreSQL

## 🚀 Alternativas de Hosting

### Hosting PHP Gratuito
- **000webhost**: https://www.000webhost.com/
- **InfinityFree**: https://www.infinityfree.net/
- **Freehostia**: https://www.freehostia.com/

### Hosting PHP de Pago
- **Hostinger**: https://www.hostinger.com/
- **SiteGround**: https://www.siteground.com/
- **Bluehost**: https://www.bluehost.com/

### Hosting en la Nube
- **Railway**: https://railway.app/ (backend PHP)
- **Render**: https://render.com/ (backend PHP)
- **Vercel**: https://vercel.com/ (solo frontend Angular)

## 📞 Soporte

Si tienes problemas al desplegar:
1. Verificar logs del servidor
2. Verificar permisos de archivos
3. Verificar que PHP 8.2+ esté instalado
4. Verificar que las extensiones necesarias estén habilitadas

