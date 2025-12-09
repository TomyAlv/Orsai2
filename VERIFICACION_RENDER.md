# ✅ Verificación de Despliegue en Render

## 🎉 ¡La API está funcionando correctamente!

El mensaje que ves:
```json
{"status":"ok","message":"API orsai funcionando","time":"2025-12-09T18:42:51-03:00"}
```

Es la respuesta del endpoint `ping` de la API, lo que significa que **el backend está desplegado y funcionando correctamente**.

## 🔍 Endpoints para Verificar

Puedes probar estos endpoints en tu URL de Render:

### 1. Ping (ya funcionando)
```
https://tu-url.onrender.com/?action=ping
```
Respuesta esperada: `{"status":"ok","message":"API orsai funcionando",...}`

### 2. Inicializar Base de Datos
```
https://tu-url.onrender.com/init_db.php
```
**⚠️ IMPORTANTE**: Ejecuta esto una vez para crear las tablas de la base de datos.

### 3. Verificar que la API responde
```
https://tu-url.onrender.com/?action=matches
```
Debería devolver una lista de partidos (puede estar vacía si no hay datos).

### 4. Verificar noticias
```
https://tu-url.onrender.com/?action=news
```
Debería devolver noticias de fútbol.

## 📋 Próximos Pasos

### 1. Inicializar la Base de Datos

**IMPORTANTE**: Antes de usar la aplicación, debes inicializar la base de datos:

1. Visita: `https://tu-url.onrender.com/init_db.php`
2. Deberías ver un mensaje de éxito
3. Esto creará todas las tablas necesarias

### 2. Configurar Variables de Entorno

En Render Dashboard → Environment Variables, asegúrate de tener:

```
API_FOOTBALL_KEY=tu_api_key_de_api_football
JWT_SECRET=un_secret_jwt_muy_seguro_y_largo
PORT=10000
```

### 3. Desplegar el Frontend

El backend está funcionando, pero necesitas desplegar el frontend para tener la aplicación completa:

#### Opción A: Vercel (Recomendado para Angular)
1. Ve a https://vercel.com
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/frontend/browser`
   - **Environment Variable**: `API_BASE_URL=https://tu-url.onrender.com`

#### Opción B: Render (Static Site)
1. En Render, crea un nuevo "Static Site"
2. Conecta el mismo repositorio
3. Configura:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist/frontend/browser`

### 4. Conectar Frontend con Backend

Una vez desplegado el frontend, actualiza `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://tu-url.onrender.com'
};
```

Y recompila:
```bash
cd frontend
npm run build
```

## 🧪 Pruebas Rápidas

### Probar Registro de Usuario
```bash
curl -X POST https://tu-url.onrender.com/?action=register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","email":"test@test.com"}'
```

### Probar Login
```bash
curl -X POST https://tu-url.onrender.com/?action=login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

## ✅ Checklist de Verificación

- [x] Backend desplegado en Render
- [x] API respondiendo correctamente (ping funciona)
- [ ] Base de datos inicializada (`init_db.php`)
- [ ] Variables de entorno configuradas
- [ ] Frontend desplegado (Vercel o Render)
- [ ] Frontend conectado al backend
- [ ] CORS configurado correctamente

## 🐛 Solución de Problemas

### Error: "Database not found"
- Ejecuta `init_db.php` una vez
- Verifica permisos de escritura en `api/db/`

### Error: "API_FOOTBALL_KEY not set"
- Configura la variable de entorno en Render Dashboard

### Error: CORS en Frontend
- Verifica que `api/index.php` tenga:
  ```php
  header('Access-Control-Allow-Origin: *');
  ```
- O específica tu dominio de frontend:
  ```php
  header('Access-Control-Allow-Origin: https://tu-frontend.vercel.app');
  ```

## 📝 Notas

- El mensaje JSON que ves es **correcto** - significa que la API está funcionando
- Para ver la aplicación web completa, necesitas desplegar también el frontend
- El backend solo sirve la API, no la interfaz web
- La URL de Render puede tardar unos segundos en "despertar" si está en plan gratuito

