# Preparación Completa para el Examen
## Trabajo Final - Programación Web 1 - UCES

**Autor:** Tomás Álvarez Arzuaga  
**Fecha:** 01/12/2025

---

## 🎯 RESUMEN EJECUTIVO

### Lo que DEBES entregar:

1. **Archivo ZIP** (2-5 MB) con código fuente y documentación
2. **README.md** completo con carátula y toda la información
3. **Código funcional** que se pueda instalar y ejecutar

### Lo que NO debes incluir:

- ❌ `node_modules/` (muy pesado, ~500MB)
- ❌ `dist/` (se genera al compilar)
- ❌ Archivos `.sqlite` (se crean automáticamente)
- ❌ Archivos del sistema (`.DS_Store`, `Thumbs.db`)

---

## 📦 ESTRUCTURA DEL ARCHIVO DE ENTREGA

```
orsai_trabajo_final_Tomas_Alvarez_Arzuaga.zip
│
├── api/                          ✅ TODO (código PHP)
│   ├── index.php
│   ├── db.php
│   ├── jwt.php
│   ├── config.php
│   ├── init_db.php
│   └── ... (todos los archivos PHP)
│
├── db/                           ✅ Carpeta (puede estar vacía)
│
├── frontend/                     ✅ SIN node_modules y dist
│   ├── src/                      ✅ TODO el código fuente
│   ├── package.json              ✅
│   ├── package-lock.json          ✅
│   ├── angular.json              ✅
│   └── tsconfig.json             ✅
│
├── README.md                     ✅ Documentación completa
├── DOCUMENTO_TECNICO_DEFENSA.md  ✅ Análisis técnico
├── INSTRUCCIONES.md              ✅ Guía de instalación
└── Pautas Examen.md              ✅ Referencia
```

**Tamaño esperado**: 2-5 MB

---

## ✅ CHECKLIST DE PREPARACIÓN

### 📋 Una Semana Antes del Examen

- [ ] **Probar instalación completa**:
  - [ ] Instalar en hosting de prueba o XAMPP limpio
  - [ ] Verificar que `init_db.php` funcione
  - [ ] Verificar que `npm install` funcione
  - [ ] Verificar que `ng serve` funcione
  - [ ] Probar todas las funcionalidades

- [ ] **Actualizar documentación**:
  - [ ] Completar carátula en README.md con fecha del examen
  - [ ] Verificar que toda la información esté actualizada
  - [ ] Revisar DOCUMENTO_TECNICO_DEFENSA.md

- [ ] **Crear capturas de pantalla** (opcional pero recomendado):
  - [ ] Página de inicio (modo claro y oscuro)
  - [ ] Listado de partidos
  - [ ] Detalle de partido con comentarios
  - [ ] Perfil de usuario
  - [ ] Panel de administración
  - [ ] Búsqueda de usuarios

### 📋 Día Antes del Examen

- [ ] **Preparar archivo comprimido**:
  - [ ] Ejecutar `.\preparar_entrega.ps1` O crear manualmente
  - [ ] Verificar tamaño (debe ser < 10 MB)
  - [ ] Descomprimir y probar instalación
  - [ ] Verificar que no falte ningún archivo

- [ ] **Subir a Google Classroom**:
  - [ ] Link: https://classroom.google.com/c/NzM5MTAwNTIyMDU2?cjc=udkb7xy
  - [ ] Subir archivo ZIP o enlace a carpeta compartida
  - [ ] Verificar que el enlace sea accesible

- [ ] **Preparar backups**:
  - [ ] Código en pendrive
  - [ ] Código en la nube (Drive/Dropbox)
  - [ ] Documentación impresa o en tablet (opcional)

- [ ] **Repasar conocimientos**:
  - [ ] Arquitectura del sistema
  - [ ] Autenticación JWT
  - [ ] Base de datos y relaciones
  - [ ] Funcionalidades principales
  - [ ] Seguridad implementada

### 📋 Día del Examen

- [ ] Llevar pendrive con código
- [ ] Tener acceso a la nube
- [ ] Llegar con tiempo suficiente
- [ ] Tener credenciales de hosting listas (si aplica)

---

## 🔧 SOLUCIÓN DEL ERROR "Acción no encontrada"

El error indica que el endpoint no se encuentra. Soluciones:

### Solución 1: Verificar que el archivo esté actualizado
```powershell
# El archivo ya se copió automáticamente
# Verificar manualmente si es necesario:
Copy-Item -Path "api\index.php" -Destination "C:\xampp\htdocs\orsai\api\index.php" -Force
```

### Solución 2: Limpiar caché del navegador
- Presionar `Ctrl + F5` para forzar recarga
- O abrir en ventana de incógnito

### Solución 3: Verificar que el endpoint esté en el código
- Abrir: `http://localhost/orsai/api/index.php?action=generate-fake-comments`
- Si da "Método no permitido" → El endpoint existe (correcto)
- Si da "Acción no encontrada" → El archivo no se actualizó

### Solución 4: Verificar autenticación
- Asegurarse de estar logueado como administrador
- Verificar que el token se esté enviando en el header

---

## 📝 README.md - Carátula Requerida

```markdown
# Orsai - Plataforma de Fútbol Interactiva

## Carátula

**Autor:** Tomás Álvarez Arzuaga
**Materia:** Programación Web 1
**Institución:** UCES - Tecnicatura en Programación de Sistemas
**Fecha de Presentación:** [FECHA DEL EXAMEN]
**Trabajo Final**
```

---

## 🎓 PREPARACIÓN PARA LA DEFENSA

### Preguntas que pueden hacerte:

1. **"¿Cómo funciona la autenticación JWT?"**
   - Explicar: generación del token, estructura (header.payload.signature), verificación, expiración

2. **"¿Cómo previenes la inyección SQL?"**
   - Explicar: prepared statements, nunca concatenar variables directamente en queries

3. **"¿Por qué elegiste SQLite en lugar de MySQL?"**
   - Explicar: simplicidad, portabilidad, suficiente para el alcance del proyecto

4. **"¿Cómo funciona el sistema de votación?"**
   - Explicar: tabla votes, UNIQUE constraint, actualización de karma, prevención de auto-voto

5. **"¿Cómo escalarías esto a 1 millón de usuarios?"**
   - Explicar: migración a MySQL/PostgreSQL, caché Redis, CDN, load balancer

### Documentos a tener a mano:

- ✅ README.md
- ✅ DOCUMENTO_TECNICO_DEFENSA.md (MUY IMPORTANTE)
- ✅ INSTRUCCIONES.md

---

## 🚀 CÓMO USAR EL SCRIPT DE PREPARACIÓN

```powershell
# Ejecutar en PowerShell desde la raíz del proyecto
.\preparar_entrega.ps1
```

El script:
1. Crea carpeta temporal
2. Copia solo archivos necesarios
3. Excluye node_modules, dist, *.sqlite
4. Crea archivo ZIP
5. Limpia carpeta temporal

**Resultado**: `orsai_trabajo_final_Tomas_Alvarez_Arzuaga.zip`

---

## 📊 TAMAÑOS DE ARCHIVO

| Incluye | Tamaño | ¿Incluir? |
|---------|--------|-----------|
| Solo código fuente | 2-5 MB | ✅ SÍ |
| + node_modules | 500MB-1GB | ❌ NO |
| + dist | 50-100MB | ❌ NO |
| + base de datos | +5-50MB | ❌ NO |

**Objetivo**: Archivo de 2-5 MB con solo código fuente y documentación

---

## ✅ VERIFICACIÓN FINAL

Antes de entregar, verificar:

1. ✅ Descomprimir el archivo en una carpeta nueva
2. ✅ Seguir INSTRUCCIONES.md paso a paso
3. ✅ Verificar que `init_db.php` funcione
4. ✅ Verificar que `npm install` funcione
5. ✅ Verificar que `ng serve` funcione
6. ✅ Probar todas las funcionalidades
7. ✅ Verificar que la documentación sea clara

---

## 📞 EN CASO DE PROBLEMAS

### Error al instalar:
- Revisar INSTRUCCIONES.md
- Verificar versiones de Node.js y PHP
- Verificar permisos de escritura en carpeta `db/`

### Error al compilar:
- Verificar que `npm install` se ejecutó correctamente
- Limpiar caché: `npm cache clean --force`
- Reinstalar: eliminar `node_modules` y `package-lock.json`, luego `npm install`

### Error de conexión a API:
- Verificar que Apache esté corriendo
- Verificar URL en `environment.ts`
- Probar directamente: `http://localhost/orsai/api/index.php?action=ping`

---

## 🎯 RESUMEN FINAL

### Para entregar necesitas:

1. ✅ **Archivo ZIP** (2-5 MB) con código fuente
2. ✅ **README.md** con carátula completa
3. ✅ **Código funcional** probado
4. ✅ **Documentación completa**

### NO incluir:

- ❌ node_modules/
- ❌ dist/
- ❌ *.sqlite
- ❌ Archivos del sistema

### Para la defensa:

- ✅ Conocer la arquitectura
- ✅ Saber explicar cada funcionalidad
- ✅ Tener DOCUMENTO_TECNICO_DEFENSA.md a mano
- ✅ Saber instalar el proyecto paso a paso

---

**¡Éxito en tu presentación!** 🎉

