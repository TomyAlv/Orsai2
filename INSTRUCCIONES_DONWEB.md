# 📋 Instrucciones Rápidas para DonWeb/Ferozo

## Configuración en el Panel de DonWeb

### Paso 1: Configurar Git Deployment

En el panel de DonWeb, ve a **Ferozo Host** → **Git** y configura:

```
Repositorio: git@github.com:TomyAlv/Orsai2.git
Rama: main
Directorio: public_html/
```

**⚠️ IMPORTANTE**: Asegúrate de que `public_html/` esté **completamente vacío** antes de hacer el primer deploy.

### Paso 2: Esperar el Deploy

El sistema de DonWeb/Ferozo:
1. Clonará el repositorio
2. Ejecutará el build (si está configurado)
3. Desplegará los archivos en `public_html/`

### Paso 3: Inicializar la Base de Datos

Después del deploy, accede a:
```
https://tudominio.com/api/init_db.php
```

Esto creará la base de datos SQLite y todas las tablas necesarias.

### Paso 4: Configurar Permisos

Asegúrate de que la carpeta `db/` tenga permisos de escritura:
- **Permisos**: 755 o 775
- Configúralo desde el panel de DonWeb o vía FTP

## Si el Deploy Automático No Funciona

### Opción A: Build Manual Local

1. Ejecuta el script de build:
   ```powershell
   .\build_for_hosting.ps1
   ```

2. Esto creará `deploy_public_html/` con todos los archivos listos

3. Sube el contenido de `deploy_public_html/` a `public_html/` vía FTP

### Opción B: Build en el Servidor

Si DonWeb permite ejecutar comandos:

1. Conecta vía SSH al servidor
2. Navega a `public_html/`
3. Ejecuta:
   ```bash
   cd frontend
   npm install
   npm run build -- --configuration production
   ```

## Verificación Post-Deploy

1. **Frontend**: `https://tudominio.com` → Debe cargar la aplicación
2. **API**: `https://tudominio.com/api/index.php?action=ping` → Debe responder JSON
3. **Base de datos**: Verifica que `db/orsai.sqlite` exista

## Estructura Esperada

```
public_html/
├── api/              # Backend PHP
├── db/               # Base de datos (se crea automáticamente)
├── index.html        # Aplicación Angular
├── main.js           # JavaScript compilado
├── styles.css        # Estilos
└── .htaccess         # Configuración de routing
```

## Solución de Problemas Rápidos

| Problema | Solución |
|----------|----------|
| Error 404 en rutas | Verifica que `.htaccess` esté en la raíz |
| API no responde | Verifica permisos de `api/` (755) |
| No se crea BD | Verifica permisos de `db/` (755 o 775) |
| CORS errors | Ya está configurado en `api/.htaccess` |

## Contacto

Si tienes problemas, revisa:
- `README_DEPLOY.md` - Guía completa
- `deploy_donweb.md` - Detalles técnicos
- Logs del panel de DonWeb

