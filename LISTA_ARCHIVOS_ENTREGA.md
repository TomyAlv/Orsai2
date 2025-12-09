# Lista de Archivos para la Entrega
## Trabajo Final - Programación Web 1

---

## ✅ ARCHIVOS A INCLUIR (Total: ~2-5 MB)

### Backend (api/)
```
✅ api/config.php
✅ api/db.php
✅ api/jwt.php
✅ api/index.php
✅ api/init_db.php
✅ api/upload_profile_picture.php
✅ api/set_admin.php
✅ api/check_user_role.php
✅ api/add_karma_system.php
✅ api/add_indexes.php
✅ api/update_users_table.php
✅ api/generate_fake_comments.php
✅ api/info.php (si existe)
```

### Frontend (frontend/)
```
✅ frontend/src/                    (TODO el código fuente)
✅ frontend/angular.json
✅ frontend/package.json
✅ frontend/package-lock.json
✅ frontend/tsconfig.json
✅ frontend/tsconfig.app.json
✅ frontend/tsconfig.spec.json
✅ frontend/README.md
```

### Base de Datos
```
✅ db/                              (carpeta, puede estar vacía)
```

### Documentación
```
✅ README.md
✅ DOCUMENTO_TECNICO_DEFENSA.md
✅ INSTRUCCIONES.md
✅ Pautas Examen.md                 (referencia)
```

### Otros
```
✅ public/                          (si tiene contenido)
✅ sync_to_htdocs.ps1               (script útil)
```

---

## ❌ ARCHIVOS A EXCLUIR (Reducen el tamaño)

### Muy Pesados
```
❌ frontend/node_modules/           (~500MB-1GB)
❌ frontend/dist/                    (~50-100MB)
```

### Se Generan Automáticamente
```
❌ db/*.sqlite                       (se crea con init_db.php)
❌ db/*.db
❌ db/*.sqlite-journal
```

### Archivos del Sistema
```
❌ .DS_Store                         (Mac)
❌ Thumbs.db                         (Windows)
❌ desktop.ini                       (Windows)
❌ .git/                             (si usas Git)
❌ .gitignore
```

### Archivos Temporales
```
❌ *.log
❌ *.tmp
❌ *.cache
❌ *.swp
```

### Configuración de Editores
```
❌ .vscode/
❌ .idea/
❌ *.sublime-project
```

### Archivos Comprimidos
```
❌ *.zip (excepto el archivo de entrega)
❌ *.rar
❌ *.7z
```

---

## 📦 ESTRUCTURA FINAL DEL ZIP

```
orsai_trabajo_final_Tomas_Alvarez_Arzuaga.zip
│
├── api/                    (~200 KB)
│   └── [12 archivos PHP]
│
├── db/                     (vacía o con .gitkeep)
│
├── frontend/               (~2-4 MB)
│   ├── src/                (~2-3 MB)
│   ├── package.json        (~5 KB)
│   ├── package-lock.json   (~200 KB)
│   └── [archivos config]
│
├── README.md               (~24 KB)
├── DOCUMENTO_TECNICO_DEFENSA.md (~48 KB)
├── INSTRUCCIONES.md        (~5 KB)
└── Pautas Examen.md        (~4 KB)

TOTAL: ~2-5 MB ✅
```

---

## 🚀 CÓMO CREAR EL ARCHIVO

### Opción 1: Script Automático
```powershell
.\preparar_entrega.ps1
```

### Opción 2: Manual
1. Crear carpeta `entrega/`
2. Copiar archivos según lista de arriba
3. Excluir archivos según lista de exclusión
4. Comprimir carpeta `entrega/`

---

## ✅ VERIFICACIÓN

Después de crear el ZIP:

1. ✅ Descomprimir en carpeta nueva
2. ✅ Verificar estructura de carpetas
3. ✅ Verificar que no falte ningún archivo
4. ✅ Verificar tamaño (< 10 MB)
5. ✅ Probar instalación siguiendo INSTRUCCIONES.md

---

**El archivo está listo cuando pasa todas las verificaciones.** ✅

