# 🚀 Instrucciones para Desplegar Frontend en Render

## ⚠️ IMPORTANTE: Compilar Frontend Antes de Desplegar

El backend PHP ahora sirve tanto la API como el frontend compilado. Para que funcione correctamente, **debes compilar el frontend antes de hacer commit y push a GitHub**.

## 📋 Pasos para Desplegar

### 1. Compilar el Frontend

Ejecuta uno de estos comandos:

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File build_and_deploy.ps1
```

**Linux/Mac:**
```bash
bash build_and_deploy.sh
```

**O manualmente:**
```bash
cd frontend
npm install
npm run build -- --configuration=development
cd ..
```

### 2. Verificar que se Compiló Correctamente

Verifica que exista:
```
frontend/dist/frontend/browser/index.html
```

### 3. Hacer Commit y Push

```bash
git add frontend/dist/
git commit -m "Compilar frontend para deployment"
git push origin main
```

**Nota**: Normalmente `dist/` está en `.gitignore`, pero en este caso necesitamos incluirlo para que Render pueda usarlo al construir la imagen Docker.

### 4. Render Detectará los Cambios

Render detectará automáticamente el nuevo commit y hará un redeploy. El backend ahora:
- Servirá el frontend cuando accedas a la raíz (`/`)
- Servirá la API cuando uses `?action=...`

## 🔧 Cómo Funciona

El archivo `api/index.php` fue modificado para:
1. Si no hay parámetro `action` y es una petición GET → servir el frontend
2. Si hay parámetro `action` → procesar como API y devolver JSON

## 🐛 Solución de Problemas

### Error: "Frontend no encontrado"

Si ves este mensaje en Render:
```json
{"error":"Frontend no encontrado","message":"El frontend no ha sido compilado..."}
```

**Solución:**
1. Compila el frontend localmente
2. Haz commit de `frontend/dist/`
3. Push a GitHub
4. Render hará redeploy automáticamente

### El Frontend No se Actualiza

1. Verifica que `frontend/dist/` esté en el repositorio
2. Verifica que el Dockerfile copie correctamente:
   ```dockerfile
   COPY frontend/dist/frontend/browser /app/frontend/dist/frontend/browser
   ```

### Build Falla por Budgets

Si el build falla por exceder budgets, compila con configuración de desarrollo:
```bash
npm run build -- --configuration=development
```

## 📝 Notas

- El frontend compilado se incluye en el repositorio para que Render lo use
- Cada vez que cambies el frontend, debes recompilar y hacer commit
- El Dockerfile copia los archivos compilados al contenedor
- Render construye la imagen Docker con el frontend incluido

