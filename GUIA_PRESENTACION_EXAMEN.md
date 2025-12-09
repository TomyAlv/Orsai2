# Guía de Preparación para la Presentación del Examen
## Trabajo Final - Programación Web 1

**Autor:** Tomás Álvarez Arzuaga  
**Fecha:** 01/12/2025

---

## 📋 Checklist de Preparación

### ✅ 1. Código Fuente Completo

#### ✅ INCLUIR en el archivo comprimido:

```
orsai/
├── api/                          ✅ INCLUIR TODO
│   ├── config.php
│   ├── db.php
│   ├── jwt.php
│   ├── index.php
│   ├── init_db.php
│   ├── upload_profile_picture.php
│   ├── set_admin.php
│   ├── check_user_role.php
│   ├── add_karma_system.php
│   ├── add_indexes.php
│   ├── update_users_table.php
│   └── generate_fake_comments.php
│
├── db/                           ✅ INCLUIR (carpeta vacía o con .gitkeep)
│   └── (la BD se crea al ejecutar init_db.php)
│
├── frontend/                     ✅ INCLUIR (sin node_modules ni dist)
│   ├── src/                      ✅ TODO
│   ├── angular.json              ✅
│   ├── package.json              ✅
│   ├── package-lock.json         ✅
│   ├── tsconfig.json             ✅
│   ├── tsconfig.app.json         ✅
│   └── README.md                 ✅
│
├── public/                       ✅ INCLUIR (si tiene contenido)
│
├── README.md                     ✅ INCLUIR (actualizado con tus datos)
├── DOCUMENTO_TECNICO_DEFENSA.md  ✅ INCLUIR (documento técnico completo)
├── INSTRUCCIONES.md              ✅ INCLUIR
├── Pautas Examen.md              ✅ INCLUIR (referencia)
└── sync_to_htdocs.ps1            ✅ INCLUIR (script útil)
```

#### ❌ NO INCLUIR (para reducir tamaño):

```
❌ frontend/node_modules/          (muy pesado, se instala con npm install)
❌ frontend/dist/                  (se genera al compilar, muy pesado)
❌ .git/                          (si usas git, no es necesario)
❌ *.log                          (archivos de log)
❌ .DS_Store                      (archivos del sistema Mac)
❌ Thumbs.db                      (archivos del sistema Windows)
❌ *.tmp                          (archivos temporales)
❌ .vscode/                       (configuración del editor)
❌ .idea/                         (configuración de IDE)
❌ *.zip                          (otros archivos comprimidos)
❌ db/*.sqlite                    (la BD se crea al ejecutar init_db.php)
```

### ✅ 2. Documentación (README.md)

#### ✅ Contenido Requerido:

1. **Carátula** (OBLIGATORIO):
   ```
   Autor: Tomás Álvarez Arzuaga
   Materia: Programación Web 1
   Institución: UCES - Tecnicatura en Programación de Sistemas
   Fecha de Presentación: [FECHA DEL EXAMEN]
   Trabajo Final
   ```

2. **Texto Descriptivo** (ya está en README.md):
   - ✅ Descripción del sistema
   - ✅ Funcionalidades principales
   - ✅ Tecnologías utilizadas
   - ✅ Estructura del proyecto
   - ✅ Instalación y configuración
   - ✅ Manual de uso
   - ✅ Endpoints de la API
   - ✅ Esquema de base de datos

3. **Diagramas y Capturas** (AGREGAR):
   - Capturas de pantalla de las páginas principales
   - Diagrama de arquitectura (opcional pero recomendado)
   - Diagrama de base de datos (opcional)

### ✅ 3. Preparación del Hosting

#### Antes del Examen:

1. **Probar la instalación completa**:
   - Instalar en un hosting de prueba
   - Verificar que todo funcione
   - Probar todas las funcionalidades

2. **Preparar credenciales**:
   - Usuario administrador de prueba
   - Contraseña de la base de datos (si aplica)
   - URL del hosting

3. **Backup del código**:
   - Tener el código en un pendrive
   - Tener el código en la nube (Drive, Dropbox)
   - Tener el código en GitHub (opcional pero recomendado)

### ✅ 4. Preparación para la Defensa

#### Documentos a Tener a Mano:

1. **README.md** - Documentación general
2. **DOCUMENTO_TECNICO_DEFENSA.md** - Análisis técnico detallado
3. **INSTRUCCIONES.md** - Guía de instalación

#### Conocimientos a Repasar:

1. **Arquitectura del sistema**:
   - Cómo funciona la comunicación frontend-backend
   - Flujo de autenticación JWT
   - Estructura de la base de datos

2. **Funcionalidades principales**:
   - Sistema de usuarios y autenticación
   - Sistema de comentarios y votación
   - Panel de administración (ABM de usuarios y comentarios)
   - Generación de comentarios ficticios contextualizados
   - Búsqueda de usuarios en tiempo real
   - Sistema de temas (modo oscuro/claro)
   - Sincronización de partidos desde API-Football
   - Filtrado inteligente de ligas y competiciones
   - Sistema de partidos históricos vs actuales/futuros

3. **Tecnologías utilizadas**:
   - PHP 7.4+ y SQLite3
   - Angular 21 (Standalone Components)
   - TypeScript
   - JWT (implementación propia)
   - Bootstrap 5.3 y Bootstrap Icons
   - RxJS 7.8 (programación reactiva)
   - API-Football (API externa para datos de partidos)
   - cURL (para requests HTTP a API externa)

4. **Seguridad**:
   - Cómo se previene inyección SQL (prepared statements)
   - Cómo funciona el hash de contraseñas (bcrypt)
   - Validaciones implementadas (frontend y backend)
   - Autenticación JWT y verificación de roles
   - Validación de archivos subidos (MIME type, tamaño)
   - CORS configurado para desarrollo
   
5. **Integración con APIs externas**:
   - Cómo funciona la integración con API-Football
   - Manejo de rate limiting
   - Filtrado de ligas y competiciones
   - Configuración de timezone (GMT-3 Argentina)
   - Manejo de errores en requests externos

### ✅ 5. Archivo Comprimido Final

#### Estructura Recomendada:

```
orsai_trabajo_final_[TU_NOMBRE].zip
│
├── codigo_fuente/
│   ├── api/
│   ├── db/
│   ├── frontend/ (sin node_modules ni dist)
│   └── ...
│
├── documentacion/
│   ├── README.md
│   ├── DOCUMENTO_TECNICO_DEFENSA.md
│   ├── INSTRUCCIONES.md
│   └── capturas/ (opcional)
│
└── instrucciones_instalacion.txt (breve guía)
```

#### Tamaño Esperado:

- **Con node_modules**: ~500MB - 1GB (NO incluir)
- **Sin node_modules**: ~5-10MB (IDEAL)
- **Solo código fuente**: ~2-5MB (PERFECTO)

### ✅ 6. Checklist Pre-Examen

#### Una Semana Antes:

- [ ] Revisar que todo el código funcione
- [ ] Probar instalación en hosting de prueba
- [ ] Actualizar README.md con fecha correcta
- [ ] Revisar DOCUMENTO_TECNICO_DEFENSA.md
- [ ] Crear capturas de pantalla
- [ ] Preparar archivo comprimido sin archivos innecesarios

#### Día Antes:

- [ ] Verificar que el archivo comprimido se pueda descomprimir
- [ ] Probar que el código funcione después de descomprimir
- [ ] Revisar conocimientos técnicos
- [ ] Preparar pendrive con backup
- [ ] Subir a Google Classroom

#### Día del Examen:

- [ ] Llevar pendrive con código
- [ ] Tener acceso a la nube (Drive/Dropbox)
- [ ] Tener documentación impresa o en tablet (opcional)
- [ ] Llegar con tiempo suficiente
- [ ] Tener credenciales de hosting listas

---

## 📸 Capturas de Pantalla Recomendadas

### Páginas a Capturar:

1. **Página de Inicio (Home)**
   - Modo claro
   - Modo oscuro

2. **Página de Partidos (Matches)**
   - Listado de partidos
   - Con modo oscuro activo

3. **Detalle de Partido**
   - Información del partido
   - Sección de comentarios con votos

4. **Perfil de Usuario**
   - Formulario de edición
   - Con foto de perfil

5. **Panel de Administración**
   - Tab de usuarios
   - Tab de comentarios
   - Herramientas de administración

6. **Búsqueda de Usuarios**
   - Barra de búsqueda con resultados

7. **Login/Registro**
   - Formularios de autenticación

### Cómo Tomar las Capturas:

- Usar herramientas como **Snipping Tool** (Windows) o **Captura de Pantalla** (Mac)
- Guardar en formato PNG o JPG
- Nombrar descriptivamente: `home_modo_claro.png`, `admin_usuarios.png`
- Crear carpeta `capturas/` en el proyecto

---

## 🔧 Solución del Error "Acción no encontrada"

El error indica que el endpoint no está siendo reconocido. Posibles causas:

1. **El archivo index.php no se actualizó en el servidor**
   - Solución: Copiar el archivo actualizado a `C:\xampp\htdocs\orsai\api\`

2. **Caché del navegador**
   - Solución: Limpiar caché o usar Ctrl+F5

3. **El método HTTP no es POST**
   - Verificar que el frontend esté enviando POST

Voy a verificar y corregir el problema:
