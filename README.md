# Orsai - Plataforma de Fútbol Interactiva

## Carátula

**Autor:** Tomás Álvarez Arzuaga 
**Materia:** Programación Web 1  
**Institución:** UCES - Tecnicatura en Programación de Sistemas  
**Fecha de Presentación:** 10/12/2025 
**Trabajo Final**

---

## Descripción del Sistema

**Orsai** es una plataforma web completa diseñada para aficionados al fútbol que combina la funcionalidad de seguimiento de partidos con un sistema de comunidad interactiva. Inspirada en plataformas como Promiedos y Letterboxd, Orsai permite a los usuarios seguir partidos de las principales ligas del mundo, compartir sus opiniones mediante comentarios, interactuar con otros usuarios y gestionar su perfil personalizado.

La plataforma está diseñada para ser fácil de instalar y configurar, utilizando tecnologías modernas pero accesibles que permiten su despliegue en servicios de hosting básicos sin requerimientos complejos de infraestructura.

---

## Funcionalidades Principales

### 1. Sistema de Autenticación y Usuarios

- **Registro de Usuarios**: Los usuarios pueden crear una cuenta proporcionando nombre de usuario, contraseña y email (opcional).
- **Inicio de Sesión**: Sistema de autenticación seguro mediante JSON Web Tokens (JWT).
- **Gestión de Perfil**: Los usuarios pueden:
  - Editar su información personal (nombre de usuario, email, nacionalidad, equipo favorito)
  - Subir foto de perfil desde su computadora o mediante URL
  - Visualizar su karma acumulado
  - Ver su fecha de registro
- **Perfiles Públicos**: Visualización de perfiles de otros usuarios en modo de solo lectura, mostrando:
  - Foto de perfil
  - Nombre de usuario y nombre de visualización
  - Nacionalidad con bandera
  - Equipo favorito
  - Puntos de karma
  - Fecha de creación de la cuenta

### 2. Sistema de Partidos

- **Visualización de Partidos**: Listado completo de partidos de fútbol con información detallada:
  - Equipos locales y visitantes
  - Resultados y marcadores
  - Estado del partido (programado, en vivo, finalizado)
  - Fecha y hora del encuentro
  - Competición/liga
- **Detalle de Partidos**: Página dedicada para cada partido con:
  - Información completa del encuentro
  - Sección de comentarios
  - Sistema de votación en comentarios
  - Integración con noticias relacionadas
- **Sincronización de Partidos**: Sistema para cargar partidos desde fuentes externas o datos de ejemplo.
- **Partidos en Vivo**: Visualización destacada de partidos que se están jugando en tiempo real.

### 3. Sistema de Comentarios

- **Comentarios en Partidos**: Los usuarios autenticados pueden:
  - Publicar comentarios sobre partidos específicos
  - Ver todos los comentarios de un partido
  - Visualizar información del autor de cada comentario
- **Sistema de Votación**: 
  - Votar positivamente o negativamente en comentarios de otros usuarios
  - No se permite votar en comentarios propios
  - Visualización del score (diferencia entre votos positivos y negativos)
  - Contador de votos positivos y negativos
  - Indicador visual del voto del usuario actual
- **Interacción Social**: Los comentarios muestran:
  - Avatar del usuario
  - Nombre de usuario y nombre de visualización
  - Nacionalidad y equipo favorito
  - Karma del usuario
  - Fecha y hora de publicación

### 4. Sistema de Karma

- **Acumulación de Karma**: Los usuarios ganan puntos de karma cuando:
  - Otros usuarios votan positivamente sus comentarios
- **Visualización de Karma**: 
  - Badges con colores según el nivel de karma
  - Muestra en perfiles públicos y privados
  - Indicador en comentarios

### 5. Búsqueda de Usuarios

- **Barra de Búsqueda Global**: Disponible en todas las páginas del sitio
- **Búsqueda en Tiempo Real**: 
  - Búsqueda con debounce para optimizar consultas
  - Resultados instantáneos mientras se escribe
- **Resultados de Búsqueda**: Muestra:
  - Avatar del usuario
  - Nombre de usuario y nombre de visualización
  - Equipo favorito
  - Puntos de karma
  - Navegación directa al perfil público

### 6. Panel de Administración

- **Acceso Restringido**: Solo usuarios con rol de administrador pueden acceder
- **Gestión de Usuarios (ABM)**:
  - **Alta**: Crear nuevos usuarios con rol de usuario o administrador
  - **Baja**: Eliminar usuarios del sistema
  - **Modificación**: Editar información de usuarios existentes
  - Visualización de lista completa de usuarios con:
    - ID, nombre de usuario, email
    - Rol (usuario/administrador)
    - Fecha de creación
    - Karma acumulado
- **Gestión de Comentarios (ABM)**:
  - **Baja**: Eliminar comentarios inapropiados
  - Visualización de lista completa de comentarios con:
    - ID del comentario
    - Contenido
    - Autor (usuario)
    - Partido relacionado
    - Fecha de creación
    - Votos positivos y negativos
- **Navegación**: Botón de acceso al panel de administración visible en todas las páginas para usuarios administradores

### 7. Sistema de Temas (Modo Oscuro/Claro)

- **Toggle de Tema**: Botón fijo en la esquina inferior derecha de todas las páginas
- **Persistencia**: La preferencia del usuario se guarda en localStorage
- **Aplicación Global**: El tema se aplica a todas las páginas y componentes
- **Diseño Adaptativo**: 
  - Modo claro con colores vibrantes y gradientes azules
  - Modo oscuro con fondos oscuros y colores suaves para mejor legibilidad
  - Transiciones suaves entre temas

### 8. Noticias de Fútbol

- **Integración de Noticias**: Sección en la página de inicio que muestra noticias relacionadas con fútbol
- **Fuentes Externas**: Consumo de noticias desde APIs externas
- **Visualización Atractiva**: Cards con imágenes, títulos, descripciones y enlaces a noticias completas
- **Actualización Automática**: Las noticias se cargan automáticamente al visitar la página

### 9. Interfaz de Usuario

- **Diseño Moderno y Responsive**: 
  - Adaptado para dispositivos móviles, tablets y escritorio
  - Uso de Bootstrap 5.3 para componentes base
  - Estilos personalizados con gradientes y animaciones
- **Navegación Intuitiva**: 
  - Barra de búsqueda siempre accesible
  - Botones de navegación contextuales
  - Enlaces a perfil, administración y cierre de sesión según el estado del usuario
- **Feedback Visual**: 
  - Indicadores de carga
  - Mensajes de éxito y error
  - Animaciones suaves en interacciones
  - Estados hover y focus bien definidos

---

## Tecnologías Utilizadas

### Backend

- **PHP 7.4+**: Lenguaje de programación del lado del servidor
- **SQLite3**: Base de datos relacional ligera, perfecta para hosting básico
- **Apache/XAMPP**: Servidor web para desarrollo y producción
- **JWT (JSON Web Tokens)**: Implementación propia para autenticación segura
- **RESTful API**: Arquitectura de API REST para comunicación frontend-backend

### Frontend

- **Angular 21**: Framework de desarrollo frontend
- **TypeScript**: Lenguaje de programación tipado
- **RxJS 7.8**: Librería para programación reactiva y manejo de observables
- **Bootstrap 5.3**: Framework CSS para diseño responsive
- **Bootstrap Icons**: Iconografía consistente
- **CSS3**: Estilos personalizados con variables CSS, gradientes y animaciones

### Herramientas de Desarrollo

- **Node.js 18+**: Entorno de ejecución para Angular
- **npm**: Gestor de paquetes de Node.js
- **Angular CLI**: Herramienta de línea de comandos para desarrollo Angular

### Bibliotecas y Dependencias de Terceros

- **@angular/common, @angular/core, @angular/forms, @angular/router**: Módulos principales de Angular
- **@angular/platform-browser, @angular/platform-server**: Plataformas de ejecución de Angular
- **express**: Framework web para Node.js (usado en SSR)
- **rxjs**: Librería para programación reactiva
- **Bootstrap 5.3**: Framework CSS (incluido vía CDN o instalación local)
- **Bootstrap Icons**: Iconos (incluido vía CDN)

**Nota**: Todas las bibliotecas de terceros utilizadas son de código abierto y están debidamente documentadas en sus respectivos repositorios oficiales.

---

## Estructura del Proyecto

```
orsai/
├── api/                          # Backend PHP
│   ├── config.php               # Configuración general
│   ├── db.php                   # Conexión a base de datos SQLite
│   ├── jwt.php                  # Funciones para JWT (generación y validación)
│   ├── index.php                # Endpoints principales de la API REST
│   ├── init_db.php              # Script de inicialización de base de datos
│   ├── upload_profile_picture.php  # Manejo de subida de imágenes de perfil
│   ├── set_admin.php            # Utilidad para asignar rol de administrador
│   ├── check_user_role.php      # Utilidad para verificar rol de usuario
│   ├── add_karma_system.php     # Script de migración para sistema de karma
│   ├── add_indexes.php          # Script para agregar índices a la BD
│   └── update_users_table.php   # Script de migración para actualizar tabla usuarios
│
├── db/                          # Base de datos
│   └── orsai.sqlite             # Archivo de base de datos SQLite
│
├── frontend/                    # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # Componentes de la aplicación
│   │   │   │   ├── admin/       # Panel de administración
│   │   │   │   ├── home/        # Página de inicio
│   │   │   │   ├── login/       # Página de inicio de sesión
│   │   │   │   ├── register/    # Página de registro
│   │   │   │   ├── matches/     # Listado de partidos
│   │   │   │   ├── match-detail/ # Detalle de partido
│   │   │   │   ├── profile/     # Perfil del usuario
│   │   │   │   ├── public-profile/ # Perfil público de otros usuarios
│   │   │   │   ├── theme-toggle/ # Componente de cambio de tema
│   │   │   │   └── user-search/  # Componente de búsqueda de usuarios
│   │   │   ├── core/            # Servicios principales
│   │   │   │   ├── api.ts       # Servicio de comunicación con API
│   │   │   │   ├── auth.service.ts # Servicio de autenticación
│   │   │   │   └── theme.service.ts # Servicio de gestión de temas
│   │   │   ├── utils/           # Utilidades
│   │   │   │   ├── date.util.ts # Utilidades para fechas
│   │   │   │   └── match.util.ts # Utilidades para partidos
│   │   │   ├── app.routes.ts    # Configuración de rutas
│   │   │   ├── app.ts           # Componente raíz
│   │   │   └── app.scss         # Estilos globales
│   │   ├── environments/        # Configuración de entornos
│   │   │   └── environment.ts   # Variables de entorno
│   │   └── index.html           # HTML principal
│   ├── package.json             # Dependencias del proyecto
│   └── README.md                # Documentación del frontend
│
├── public/                      # Archivos públicos estáticos (si aplica)
│
├── sync_to_htdocs.ps1           # Script PowerShell para sincronizar archivos
│
├── README.md                    # Este archivo
├── INSTRUCCIONES.md             # Instrucciones de instalación detalladas
└── Pautas Examen.md             # Documento con pautas del examen
```

---

## Instalación y Configuración

### Requisitos Previos

- **XAMPP** (o Apache con PHP 7.4+)
- **Node.js** versión 18 o superior
- **npm** (incluido con Node.js)
- Navegador web moderno

### Paso 1: Configurar el Backend

1. Descargar e instalar XAMPP desde [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Iniciar Apache desde el panel de control de XAMPP
3. Copiar la carpeta del proyecto `orsai` a la carpeta `htdocs` de XAMPP
   - Ruta típica: `C:\xampp\htdocs\orsai`
4. Abrir el navegador y navegar a: `http://localhost/orsai/api/init_db.php`
5. Verificar que aparezca el mensaje: "OK - Tablas creadas"
6. Esto creará el archivo `db/orsai.sqlite` con todas las tablas necesarias

### Paso 2: Configurar el Frontend

1. Abrir una terminal en la carpeta `frontend`:
   ```bash
   cd frontend
   ```

2. Instalar las dependencias:
   ```bash
   npm install
   ```

3. Verificar la configuración de la API en `frontend/src/environments/environment.ts`:
   ```typescript
   apiBaseUrl: 'http://localhost/orsai/api'
   ```
   Ajustar la URL si el proyecto está en otra ruta.

### Paso 3: Iniciar la Aplicación

1. Asegurarse de que Apache esté corriendo en XAMPP
2. En la terminal dentro de la carpeta `frontend`, ejecutar:
   ```bash
   npm start
   ```
   O alternativamente:
   ```bash
   ng serve
   ```

3. Abrir el navegador en: `http://localhost:4200`

### Paso 4: Configurar Usuario Administrador (Opcional)

Para asignar rol de administrador a un usuario existente:

1. Navegar a: `http://localhost/orsai/api/set_admin.php?username=NOMBRE_USUARIO`
2. Verificar el rol en: `http://localhost/orsai/api/check_user_role.php?username=NOMBRE_USUARIO`

---

## Manual de Uso

### Para Usuarios Regulares

#### Registro e Inicio de Sesión

1. **Registrarse**:
   - Hacer clic en "Registrarse" desde la página de inicio
   - Completar el formulario con nombre de usuario, contraseña y email (opcional)
   - Hacer clic en "Crear Cuenta"

2. **Iniciar Sesión**:
   - Hacer clic en "Iniciar Sesión"
   - Ingresar nombre de usuario y contraseña
   - Hacer clic en "Iniciar Sesión"

#### Navegación

- **Página de Inicio**: Muestra noticias de fútbol, estadísticas y acceso rápido a funcionalidades
- **Ver Partidos**: Listado completo de partidos disponibles
- **Buscar Usuarios**: Usar la barra de búsqueda en la parte superior de cualquier página
- **Perfil**: Acceder desde el botón "Ver Perfil" cuando se está autenticado

#### Gestión de Perfil

1. Acceder a "Ver Perfil" desde cualquier página
2. Editar información:
   - Nombre de usuario
   - Email
   - Nacionalidad
   - Equipo favorito
   - Foto de perfil (subir archivo o usar URL)
3. Hacer clic en "Guardar Cambios" cuando se realicen modificaciones

#### Comentarios y Votación

1. Navegar a un partido desde "Ver Partidos"
2. En la sección de comentarios:
   - Escribir un comentario en el campo de texto
   - Hacer clic en "Comentar"
3. Para votar en comentarios de otros usuarios:
   - Hacer clic en el botón de voto positivo (↑) o negativo (↓)
   - Solo se puede votar en comentarios ajenos
   - El contador muestra el score del comentario

#### Cambio de Tema

- Hacer clic en el botón de luna/sol en la esquina inferior derecha
- La preferencia se guarda automáticamente

### Para Administradores

#### Acceso al Panel de Administración

1. Iniciar sesión con una cuenta de administrador
2. Hacer clic en el botón "Panel Administrador" que aparece en todas las páginas
3. O navegar directamente a: `http://localhost:4200/admin`

#### Gestión de Usuarios

1. En el panel de administración, seleccionar la pestaña "Usuarios"
2. **Crear Usuario**:
   - Hacer clic en "Crear Usuario"
   - Completar el formulario (usuario, contraseña, email, rol)
   - Hacer clic en "Crear Usuario"
3. **Editar Usuario**:
   - Hacer clic en el botón "Editar" junto al usuario
   - Modificar los campos deseados
   - Hacer clic en "Guardar Cambios"
4. **Eliminar Usuario**:
   - Hacer clic en el botón "Eliminar" junto al usuario
   - Confirmar la eliminación

#### Gestión de Comentarios

1. En el panel de administración, seleccionar la pestaña "Comentarios"
2. Ver la lista completa de comentarios con información del autor y partido
3. **Eliminar Comentario**:
   - Hacer clic en el botón "Eliminar" junto al comentario
   - Confirmar la eliminación

---

## Seguridad

### Implementaciones de Seguridad

- **Autenticación JWT**: Tokens seguros para autenticación de usuarios
- **Hash de Contraseñas**: Uso de `password_hash()` de PHP con algoritmo bcrypt
- **Validación de Entrada**: Validación tanto en frontend como backend
- **Protección contra Inyección SQL**: Uso de consultas preparadas (prepared statements)
- **CORS Configurado**: Headers CORS apropiados para desarrollo (ajustar para producción)
- **Validación de Roles**: Verificación de permisos de administrador en endpoints sensibles
- **Sanitización**: Limpieza de datos de entrada antes de almacenar

### Recomendaciones para Producción

- Restringir CORS a dominios específicos
- Implementar rate limiting en endpoints públicos
- Usar HTTPS en producción
- Validar y sanitizar todas las entradas de usuario
- Implementar logs de seguridad
- Realizar backups regulares de la base de datos
- Considerar migración a MySQL/PostgreSQL para mayor escalabilidad

---

## Endpoints de la API

### Autenticación
- `POST /api/index.php?action=register` - Registrar nuevo usuario
- `POST /api/index.php?action=login` - Iniciar sesión

### Partidos
- `GET /api/index.php?action=matches` - Obtener lista de partidos
- `GET /api/index.php?action=match&id=X` - Obtener partido específico
- `POST /api/index.php?action=sync-matches` - Sincronizar partidos

### Comentarios
- `GET /api/index.php?action=comments&match_id=X` - Obtener comentarios de un partido
- `POST /api/index.php?action=comments` - Crear comentario (requiere autenticación)

### Votación
- `POST /api/index.php?action=vote` - Votar en un comentario (requiere autenticación)
- `GET /api/index.php?action=comment-votes&comment_id=X` - Obtener votos de un comentario

### Perfil
- `GET /api/index.php?action=profile` - Obtener perfil del usuario actual (requiere autenticación)
- `PUT /api/index.php?action=profile` - Actualizar perfil (requiere autenticación)
- `GET /api/index.php?action=public-profile&user_id=X` - Obtener perfil público de un usuario

### Búsqueda
- `GET /api/index.php?action=search-users&q=QUERY` - Buscar usuarios

### Administración
- `GET /api/index.php?action=admin-users` - Listar usuarios (requiere admin)
- `POST /api/index.php?action=admin-users` - Crear usuario (requiere admin)
- `PUT /api/index.php?action=admin-users` - Actualizar usuario (requiere admin)
- `DELETE /api/index.php?action=admin-users&user_id=X` - Eliminar usuario (requiere admin)
- `GET /api/index.php?action=admin-comments` - Listar comentarios (requiere admin)
- `DELETE /api/index.php?action=admin-comments&comment_id=X` - Eliminar comentario (requiere admin)
- `GET /api/index.php?action=check-admin` - Verificar si el usuario es admin

### Utilidades
- `GET /api/index.php?action=ping` - Verificar estado de la API
- `GET /api/index.php?action=news` - Obtener noticias de fútbol

### Archivos
- `POST /api/upload_profile_picture.php` - Subir foto de perfil (requiere autenticación)

---

## Base de Datos

### Esquema de Tablas

#### Tabla: `users`
- `id` (INTEGER PRIMARY KEY)
- `username` (TEXT UNIQUE NOT NULL)
- `password_hash` (TEXT NOT NULL)
- `email` (TEXT UNIQUE)
- `role` (TEXT NOT NULL DEFAULT 'user') - 'user' o 'admin'
- `profile_picture` (TEXT)
- `nationality` (TEXT)
- `display_name` (TEXT)
- `favorite_team` (TEXT)
- `karma` (INTEGER DEFAULT 0)
- `created_at` (TEXT NOT NULL)

#### Tabla: `matches`
- `id` (INTEGER PRIMARY KEY)
- `api_match_id` (TEXT UNIQUE NOT NULL)
- `home_team` (TEXT NOT NULL)
- `away_team` (TEXT NOT NULL)
- `home_score` (INTEGER)
- `away_score` (INTEGER)
- `status` (TEXT NOT NULL)
- `match_date` (TEXT NOT NULL)
- `competition` (TEXT)
- `created_at` (TEXT NOT NULL)

#### Tabla: `comments`
- `id` (INTEGER PRIMARY KEY)
- `match_id` (INTEGER NOT NULL) - FK a matches
- `user_id` (INTEGER NOT NULL) - FK a users
- `content` (TEXT NOT NULL)
- `created_at` (TEXT NOT NULL)

#### Tabla: `comment_votes`
- `id` (INTEGER PRIMARY KEY)
- `comment_id` (INTEGER NOT NULL) - FK a comments
- `user_id` (INTEGER NOT NULL) - FK a users
- `vote_type` (TEXT NOT NULL) - 'up' o 'down'
- `created_at` (TEXT NOT NULL)
- UNIQUE(comment_id, user_id)

---

## Proyección y Mejoras Futuras

### Funcionalidades Planificadas

1. **Sistema de Notificaciones**
   - Notificaciones en tiempo real cuando otros usuarios comentan o votan
   - Notificaciones de partidos favoritos en vivo

2. **Seguimiento de Equipos y Jugadores**
   - Marcar equipos como favoritos
   - Seguir jugadores específicos
   - Calendario personalizado

3. **Sistema de Amigos y Seguidores**
   - Agregar amigos
   - Ver actividad de usuarios seguidos
   - Feed personalizado

4. **Mejoras en Comentarios**
   - Edición de comentarios propios
   - Respuestas anidadas (comentarios dentro de comentarios)
   - Mención de usuarios (@usuario)
   - Formato de texto enriquecido

5. **Integración con APIs Reales**
   - Conexión con APIs de fútbol en tiempo real (Football-Data.org, API-Football)
   - Actualización automática de resultados
   - Estadísticas detalladas de partidos

6. **Sistema de Moderación Avanzado**
   - Reporte de comentarios inapropiados
   - Sistema de advertencias para usuarios
   - Filtros automáticos de contenido

7. **Gamificación**
   - Logros y badges
   - Rankings de usuarios por karma
   - Desafíos semanales

8. **Aplicación Móvil**
   - Versión nativa para iOS y Android
   - Notificaciones push
   - Acceso offline a partidos guardados

9. **Análisis y Estadísticas**
   - Dashboard de estadísticas personales
   - Gráficos de actividad
   - Predicciones de resultados

10. **Internacionalización**
    - Soporte multiidioma
    - Traducción de interfaz y contenido

### Mejoras Técnicas

1. **Escalabilidad**
   - Migración a MySQL o PostgreSQL
   - Implementación de caché (Redis)
   - Optimización de consultas

2. **Performance**
   - Lazy loading de componentes
   - Paginación en listados grandes
   - Compresión de imágenes
   - CDN para assets estáticos

3. **Testing**
   - Tests unitarios (Jasmine/Karma)
   - Tests de integración
   - Tests end-to-end (Protractor/Cypress)

4. **DevOps**
   - CI/CD pipeline
   - Dockerización
   - Despliegue automatizado

5. **Monitoreo**
   - Logging estructurado
   - Monitoreo de errores (Sentry)
   - Analytics de uso

---

## Solución de Problemas

### Error: "No se puede conectar a la API"
- Verificar que Apache esté corriendo en XAMPP
- Verificar que la URL en `environment.ts` sea correcta
- Probar directamente: `http://localhost/orsai/api/index.php?action=ping`

### Error: "Base de datos no encontrada"
- Ejecutar `http://localhost/orsai/api/init_db.php` nuevamente
- Verificar permisos de escritura en la carpeta `db`

### Error: "CORS" en el navegador
- El código incluye headers CORS en `api/index.php`
- Verificar que Apache esté configurado correctamente
- En producción, ajustar los headers CORS para el dominio específico

### El frontend no carga
- Verificar que Node.js esté instalado: `node --version`
- Reinstalar dependencias: `npm install` en la carpeta `frontend`
- Limpiar caché: `npm cache clean --force`
- Eliminar `node_modules` y `package-lock.json`, luego ejecutar `npm install` nuevamente

### Problemas con autenticación
- Verificar que el token se esté guardando en localStorage
- Limpiar localStorage y volver a iniciar sesión
- Verificar que el servidor esté generando tokens válidos

---

## Créditos y Agradecimientos

- **Bootstrap**: Framework CSS utilizado para el diseño responsive
- **Bootstrap Icons**: Iconografía utilizada en toda la aplicación
- **Angular**: Framework frontend utilizado
- **PHP**: Lenguaje backend utilizado
- **SQLite**: Base de datos utilizada

---

## Licencia

Este proyecto fue desarrollado como trabajo final para la materia Programación Web 1 de UCES. Todos los derechos reservados.

---

## Contacto

Para consultas o soporte, contactar al autor del proyecto.

---

**Versión del Documento**: 1.0  
**Última Actualización**: 01/12/2025


