# Guía de Despliegue en GitHub y Vercel
## Orsai - Plataforma de Fútbol Interactiva

**Autor:** Tomás Álvarez Arzuaga  
**Fecha:** 10/12/2025

---

## ⚠️ IMPORTANTE: Limitación de Vercel

**Vercel NO ejecuta PHP**. Vercel está diseñado principalmente para:
- Frontend estático (React, Vue, Angular)
- Serverless Functions (Node.js, Python, Go)
- **NO soporta PHP directamente**

### Soluciones para el Backend PHP:

1. **Railway** (Recomendado): https://railway.app/
   - Soporta PHP nativamente
   - Base de datos incluida
   - Gratis con límites

2. **Render**: https://render.com/
   - Soporta PHP
   - Base de datos PostgreSQL/MySQL
   - Plan gratuito disponible

3. **Heroku**: https://www.heroku.com/
   - Soporta PHP
   - Requiere tarjeta de crédito para plan gratuito

4. **000webhost / InfinityFree**: Hosting PHP gratuito
   - Hosting tradicional PHP
   - SQLite soportado

---

## 📦 Qué Subir a GitHub

### ✅ SÍ INCLUIR en el repositorio:

```
orsai/
├── api/                          ✅ INCLUIR TODO (código fuente)
│   ├── config.php               ✅ (sin API keys reales)
│   ├── db.php                   ✅
│   ├── jwt.php                  ✅
│   ├── index.php                ✅
│   ├── init_db.php              ✅
│   ├── upload_profile_picture.php ✅
│   ├── set_admin.php            ✅
│   ├── check_user_role.php      ✅
│   ├── generate_fake_comments.php ✅
│   ├── add_karma_system.php     ✅
│   ├── add_indexes.php          ✅
│   └── update_users_table.php   ✅
│
├── db/                           ✅ INCLUIR (carpeta vacía o con .gitkeep)
│   └── .gitkeep                 ✅ (para mantener la carpeta en Git)
│
├── frontend/                     ✅ INCLUIR TODO (sin node_modules ni dist)
│   ├── src/                     ✅ TODO
│   ├── angular.json             ✅
│   ├── package.json             ✅
│   ├── package-lock.json        ✅
│   ├── tsconfig.json            ✅
│   ├── tsconfig.app.json        ✅
│   ├── tsconfig.spec.json       ✅
│   ├── .gitignore              ✅
│   └── README.md                ✅
│
├── public/                       ✅ INCLUIR (si tiene contenido)
│
├── .gitignore                   ✅ INCLUIR (muy importante)
├── README.md                    ✅ INCLUIR
├── DOCUMENTO_TECNICO_DEFENSA.md ✅ INCLUIR
├── INSTRUCCIONES.md             ✅ INCLUIR
├── GUIA_PRESENTACION_EXAMEN.md  ✅ INCLUIR
├── GUIA_DESPLIEGUE_GITHUB_VERCEL.md ✅ INCLUIR (este archivo)
└── Pautas Examen.md             ✅ INCLUIR
```

### ❌ NO INCLUIR en el repositorio:

```
❌ node_modules/          (se instala con npm install)
❌ frontend/node_modules/ (se instala con npm install)
❌ dist/                  (se genera al compilar)
❌ frontend/dist/         (se genera al compilar)
❌ db/*.sqlite            (base de datos con datos)
❌ db/*.db                (base de datos)
❌ .env                   (variables de entorno con secrets)
❌ .env.local             (configuración local)
❌ uploads/               (archivos subidos por usuarios)
❌ *.log                  (archivos de log)
❌ .DS_Store              (archivos del sistema)
❌ Thumbs.db              (archivos del sistema)
❌ .vscode/               (configuración del editor)
❌ .idea/                 (configuración del editor)
```

---

## 🔧 Configuración de .gitignore

Asegúrate de que tu `.gitignore` en la raíz incluya:

```gitignore
# Node modules
node_modules/
frontend/node_modules/

# Build outputs
dist/
frontend/dist/
*.js.map

# Base de datos (NO subir datos reales)
db/*.sqlite
db/*.db
db/*.sqlite-journal

# Archivos de entorno (NO subir API keys)
.env
.env.local
.env.*.local

# Archivos del sistema
.DS_Store
Thumbs.db
desktop.ini

# Archivos temporales
*.tmp
*.log
*.cache
*.swp
*.swo
*~

# Configuración de editores
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# Archivos comprimidos
*.zip
*.rar
*.7z

# Archivos de backup
*.bak
*.backup

# Uploads (si son muchos)
uploads/profile_pictures/*.jpg
uploads/profile_pictures/*.png
```

---

## 📝 Pasos para Subir a GitHub

### 1. Preparar el Repositorio

```bash
# En la carpeta raíz del proyecto (orsai/)
cd C:\Users\Tomas\Desktop\orsai

# Inicializar Git (si no está inicializado)
git init

# Agregar todos los archivos (respetando .gitignore)
git add .

# Hacer commit inicial
git commit -m "Initial commit: Orsai - Plataforma de Fútbol Interactiva"
```

### 2. Crear Repositorio en GitHub

1. Ve a https://github.com
2. Clic en "New repository"
3. Nombre: `orsai` (o el que prefieras)
4. Descripción: "Plataforma de Fútbol Interactiva - Trabajo Final Programación Web 1"
5. **NO marques** "Initialize with README" (ya tienes uno)
6. Clic en "Create repository"

### 3. Conectar y Subir

```bash
# Agregar el repositorio remoto (reemplaza USERNAME con tu usuario)
git remote add origin https://github.com/USERNAME/orsai.git

# Cambiar a rama main (si estás en master)
git branch -M main

# Subir el código
git push -u origin main
```

---

## 🚀 Despliegue del Frontend en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. Ve a https://vercel.com
2. Inicia sesión con tu cuenta de GitHub
3. Clic en "Add New Project"
4. Selecciona tu repositorio `orsai`
5. **Configuración importante**:
   - **Framework Preset**: Angular
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (Angular 21 usa `production` por defecto) o `ng build --configuration production`
   - **Output Directory**: `dist/frontend/browser` (Angular 21 con `@angular/build:application` genera aquí por defecto)
   - **Install Command**: `npm install`
   
   **Nota**: Si Vercel no detecta automáticamente el output directory, puedes verificar ejecutando `npm run build` localmente y ver dónde se genera la carpeta `dist/`

6. **Variables de Entorno**:
   ```
   API_BASE_URL=https://tu-backend-en-railway.app/api
   ```
   (Ajusta según donde despliegues el backend)

7. Clic en "Deploy"

### Opción 2: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# En la carpeta frontend
cd frontend

# Iniciar despliegue
vercel

# Seguir las instrucciones
```

---

## 🔧 Configurar Variables de Entorno en Vercel

1. En el dashboard de Vercel, ve a tu proyecto
2. Settings → Environment Variables
3. Agregar:
   - **Key**: `API_BASE_URL`
   - **Value**: URL de tu backend (ej: `https://orsai-backend.railway.app/api`)
   - **Environment**: Production, Preview, Development

4. Actualizar `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiBaseUrl: (typeof process !== 'undefined' && process.env && process.env['API_BASE_URL']) 
    ? process.env['API_BASE_URL'] 
    : 'https://tu-backend.railway.app/api'
};
```

**Nota**: Vercel inyecta las variables de entorno en `process.env` durante el build. Asegúrate de que estén configuradas en el dashboard de Vercel.

---

## 🗄️ Despliegue del Backend PHP

### Opción Recomendada: Railway

1. Ve a https://railway.app
2. Inicia sesión con GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Selecciona tu repositorio `orsai`
5. **Configuración**:
   - **Root Directory**: `api`
   - **Build Command**: (vacío, PHP no necesita build)
   - **Start Command**: (Railway detecta PHP automáticamente)
   - **Port**: 80 o el que Railway asigne

6. **Variables de Entorno**:
   ```
   API_FOOTBALL_KEY=tu_api_key_aqui
   JWT_SECRET=tu_secret_jwt_aqui
   ```

7. **Base de Datos**:
   - Railway puede crear una base de datos PostgreSQL
   - O puedes usar SQLite (archivo en el servidor)

8. Railway te dará una URL como: `https://orsai-backend.railway.app`

### Alternativa: Render

1. Ve a https://render.com
2. "New" → "Web Service"
3. Conecta tu repositorio de GitHub
4. **Configuración**:
   - **Name**: `orsai-backend`
   - **Environment**: PHP
   - **Build Command**: (vacío)
   - **Start Command**: `php -S 0.0.0.0:$PORT`
   - **Root Directory**: `api`

5. Agregar variables de entorno
6. Render te dará una URL

---

## 🔗 Conectar Frontend y Backend

### 1. Actualizar environment.prod.ts en Frontend

```typescript
// frontend/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: (typeof process !== 'undefined' && process.env && process.env['API_BASE_URL']) 
    ? process.env['API_BASE_URL'] 
    : 'https://orsai-backend.railway.app/api'
};
```

**Importante**: 
- `environment.ts` es para desarrollo (localhost)
- `environment.prod.ts` es para producción (Vercel)
- Angular usa automáticamente `environment.prod.ts` cuando haces `ng build --configuration production`

### 2. Configurar CORS en Backend

En `api/index.php`, asegúrate de que los headers CORS permitan tu dominio de Vercel:

```php
header('Access-Control-Allow-Origin: https://tu-app.vercel.app');
// O para desarrollo:
header('Access-Control-Allow-Origin: *');
```

### 3. Actualizar config.php en Backend

```php
// api/config.php
define('API_FOOTBALL_KEY', getenv('API_FOOTBALL_KEY') ?: 'tu_api_key_por_defecto');
define('DB_PATH', getenv('DB_PATH') ?: __DIR__ . '/../db/orsai.sqlite');
```

---

## ✅ Checklist Final

### Antes de Subir a GitHub:

- [ ] Verificar que `.gitignore` esté configurado correctamente
- [ ] No incluir `node_modules/` ni `dist/`
- [ ] No incluir archivos `.sqlite` con datos reales
- [ ] No incluir `.env` con API keys reales
- [ ] Revisar que `config.php` tenga valores de ejemplo (no reales)
- [ ] Incluir todos los archivos `.md` de documentación
- [ ] Incluir `package.json` y `package-lock.json`

### Para Despliegue en Vercel:

- [ ] Frontend compila correctamente (`npm run build --configuration production`)
- [ ] Variables de entorno configuradas en Vercel (API_BASE_URL)
- [ ] `environment.prod.ts` configurado para usar variables de entorno
- [ ] Backend desplegado en Railway/Render
- [ ] CORS configurado en backend para permitir dominio de Vercel
- [ ] API keys configuradas como variables de entorno en Railway/Render
- [ ] Base de datos inicializada en el servidor del backend

---

## 🐛 Solución de Problemas

### Error: "Cannot find module" en Vercel

**Solución**: Asegúrate de que `package.json` esté en la raíz de `frontend/` y que Vercel esté configurado con `Root Directory: frontend`

### Error: "API not found" en Frontend

**Solución**: 
1. Verifica que la variable de entorno `API_BASE_URL` esté configurada en Vercel
2. Verifica que el backend esté funcionando (haz un ping a la URL)
3. Verifica CORS en el backend

### Error: "Database not found" en Backend

**Solución**: 
- En Railway/Render, asegúrate de que la carpeta `db/` tenga permisos de escritura
- O migra a PostgreSQL/MySQL si SQLite no funciona

---

## 📚 Recursos Adicionales

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **GitHub Docs**: https://docs.github.com

---

## 💡 Recomendación Final

Para el examen, puedes:

1. **Subir todo a GitHub** (respetando .gitignore)
2. **Desplegar frontend en Vercel** (gratis y fácil)
3. **Desplegar backend en Railway** (gratis con límites)
4. **O usar hosting PHP tradicional** (000webhost, InfinityFree) para el backend

**Nota**: Si solo necesitas mostrar el proyecto para el examen, puedes:
- Desplegar solo el frontend en Vercel
- Usar un backend local o en hosting PHP tradicional
- O usar datos mock/estáticos para la demostración

---

**Última actualización**: 10/12/2025

