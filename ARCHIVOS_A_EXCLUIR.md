# Archivos a Excluir del Archivo de Entrega

## ❌ NO INCLUIR (Reducen el tamaño del archivo)

### 1. node_modules/ (MUY PESADO - ~500MB-1GB)
```
frontend/node_modules/
```
**Razón**: Se instala automáticamente con `npm install`. No es necesario incluirlo.

### 2. dist/ (PESADO - ~50-100MB)
```
frontend/dist/
```
**Razón**: Se genera al compilar con `ng build`. No es código fuente.

### 3. Base de Datos (Se crea automáticamente)
```
db/*.sqlite
db/*.db
```
**Razón**: Se crea al ejecutar `init_db.php`. No es necesario incluirlo.

### 4. Archivos del Sistema
```
.DS_Store          (Mac)
Thumbs.db          (Windows)
desktop.ini        (Windows)
```
**Razón**: Archivos del sistema operativo, no son parte del proyecto.

### 5. Archivos Temporales y Logs
```
*.log
*.tmp
*.cache
*.swp
```
**Razón**: Archivos temporales que no son necesarios.

### 6. Configuración de Editores
```
.vscode/
.idea/
*.sublime-project
```
**Razón**: Configuración personal del editor, no es parte del proyecto.

### 7. Archivos de Git (si usas control de versiones)
```
.git/
.gitignore
```
**Razón**: Información de control de versiones, no necesaria para la entrega.

### 8. Archivos Comprimidos
```
*.zip (excepto el archivo de entrega final)
*.rar
*.7z
```
**Razón**: Evitar archivos comprimidos dentro del archivo comprimido.

---

## ✅ SÍ INCLUIR (Esenciales)

### Código Fuente
- ✅ `api/` - Todo el código PHP
- ✅ `frontend/src/` - Todo el código TypeScript/Angular
- ✅ `frontend/angular.json` - Configuración de Angular
- ✅ `frontend/package.json` - Dependencias
- ✅ `frontend/package-lock.json` - Versiones exactas
- ✅ `frontend/tsconfig.json` - Configuración TypeScript

### Documentación
- ✅ `README.md` - Documentación principal
- ✅ `DOCUMENTO_TECNICO_DEFENSA.md` - Análisis técnico
- ✅ `INSTRUCCIONES.md` - Guía de instalación
- ✅ `GUIA_PRESENTACION_EXAMEN.md` - Esta guía

### Estructura
- ✅ `db/` - Carpeta (aunque esté vacía)
- ✅ `public/` - Si tiene contenido

---

## 📦 Tamaño Esperado del Archivo Final

- **Con node_modules**: ~500MB - 1GB ❌ (NO incluir)
- **Sin node_modules, con dist**: ~50-100MB ⚠️ (Mejor sin dist)
- **Solo código fuente**: ~2-5MB ✅ (IDEAL)

---

## 🚀 Cómo Preparar el Archivo

### Opción 1: Usar el Script PowerShell
```powershell
.\preparar_entrega.ps1
```

### Opción 2: Manualmente
1. Crear carpeta `entrega/`
2. Copiar todo EXCEPTO:
   - `frontend/node_modules/`
   - `frontend/dist/`
   - `db/*.sqlite`
3. Comprimir la carpeta `entrega/`

### Opción 3: Usar .gitignore
Si usas Git, el archivo `.gitignore` ya está configurado para excluir estos archivos.

