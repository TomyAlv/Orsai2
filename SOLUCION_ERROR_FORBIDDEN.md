# 🔧 Solución al Error "Forbidden" en DonWeb/Ferozo

## Problema

Después de subir el proyecto vía Git a Ferozo/DonWeb, al intentar acceder a `orsai.online` aparece el error:

```
Forbidden
You don't have permission to access this resource.
```

## Causa

El deploy vía Git subió toda la estructura del repositorio, pero los archivos compilados de Angular no están en la raíz de `public_html`. Los archivos están en:
- `public_html/frontend/dist/browser/` (o similar)
- Pero NO hay `index.html` en la raíz de `public_html`

## Solución

Se ha creado una carpeta `public_html/` en el repositorio con todos los archivos necesarios en la estructura correcta.

### Paso 1: Preparar los archivos localmente

Ejecuta el script de preparación:

```powershell
.\prepare_git_deploy.ps1
```

Este script:
1. Compila Angular para producción
2. Crea la carpeta `public_html/` con la estructura correcta
3. Copia todos los archivos necesarios:
   - Frontend compilado (index.html, main.js, styles.css) en la raíz
   - Backend PHP en `api/`
   - Archivos `.htaccess` de configuración
   - Carpeta `db/` vacía para la base de datos

### Paso 2: Hacer commit y push

```bash
git add public_html/
git commit -m "Preparar public_html para deploy - soluciona error Forbidden"
git push origin main
```

### Paso 3: Configurar Ferozo/DonWeb

En el panel de Ferozo, configura el deploy de Git:

- **Repositorio**: `git@github.com:TomyAlv/Orsai2.git`
- **Rama**: `main`
- **Directorio**: `public_html` ⚠️ **IMPORTANTE**: Debe ser `public_html` (sin barra final)

### Paso 4: Esperar el deploy automático

Ferozo detectará el push y desplegará automáticamente. Espera unos minutos.

### Paso 5: Verificar

1. Accede a `https://orsai.online` → Debe cargar la aplicación Angular
2. Accede a `https://orsai.online/api/init_db.php` → Debe crear la base de datos
3. Verifica que `https://orsai.online/api/index.php?action=ping` responda JSON

## Estructura Esperada en public_html

Después del deploy, `public_html/` debe tener:

```
public_html/
├── index.html          ← Aplicación Angular (DEBE estar en la raíz)
├── main-*.js           ← JavaScript compilado
├── styles-*.css        ← Estilos compilados
├── favicon.ico
├── .htaccess           ← Configuración de routing
├── api/                ← Backend PHP
│   ├── index.php
│   ├── config.php
│   ├── db.php
│   ├── jwt.php
│   └── .htaccess
└── db/                 ← Carpeta para base de datos (vacía)
    └── .gitkeep
```

## Si el Error Persiste

### Verificar estructura en el servidor

1. Accede al **File Manager** de DonWeb/Ferozo
2. Verifica que en `public_html/` haya un archivo `index.html` en la raíz
3. Si no está, el deploy no funcionó correctamente

### Verificar configuración de Git en Ferozo

1. Ve a **Git** en el panel de Ferozo
2. Verifica que el **Directorio** esté configurado como `public_html` (sin barra final)
3. Si está vacío o tiene otro valor, cámbialo a `public_html`

### Verificar permisos

1. La carpeta `db/` debe tener permisos de escritura (755 o 775)
2. Los archivos PHP deben tener permisos de lectura (644)

### Re-deploy manual

Si el deploy automático no funciona:

1. Elimina todo el contenido de `public_html/` en el servidor (excepto `.git` si existe)
2. Haz un nuevo push o fuerza el re-deploy desde el panel de Ferozo

## Notas Importantes

- ✅ La carpeta `public_html/` ahora está en el repositorio Git
- ✅ Cada vez que hagas cambios, ejecuta `.\prepare_git_deploy.ps1` antes de hacer commit
- ✅ El script compila Angular automáticamente y prepara todo
- ✅ No necesitas subir archivos manualmente, todo se hace vía Git

## Comandos Rápidos

```bash
# Preparar para deploy
.\prepare_git_deploy.ps1

# Commit y push
git add public_html/
git commit -m "Actualizar deploy"
git push origin main
```

¡Listo! 🚀

