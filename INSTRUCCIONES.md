# Instrucciones de Instalación y Configuración - Orsai

## Descripción del Proyecto

Orsai es una aplicación web similar a Promiedos combinado con Letterboxd, donde los usuarios pueden:
- Ver partidos de fútbol (consumidos desde una API)
- Registrarse e iniciar sesión con autenticación JWT
- Comentar sobre partidos específicos
- Interactuar con otros usuarios a través de comentarios

## Tecnologías Utilizadas

- **Backend**: PHP 7.4+ con SQLite3
- **Frontend**: Angular 21, TypeScript
- **Autenticación**: JSON Web Tokens (JWT)
- **Servidor Web**: Apache/XAMPP
- **Base de Datos**: SQLite3
- **Estilos**: Bootstrap 5.3
- **API Externa**: API-Football (v3.football.api-sports.io) para datos de partidos
- **Bibliotecas de Terceros**:
  - Bootstrap 5.3 (Framework CSS)
  - Bootstrap Icons (Iconografía)
  - RxJS 7.8 (Programación reactiva)
  - Angular Framework 21
  - TypeScript

## Paso 1: Configurar XAMPP/Apache

1. Descarga e instala XAMPP desde https://www.apachefriends.org/
2. Inicia Apache desde el panel de control de XAMPP
3. Copia la carpeta del proyecto `orsai` a la carpeta `htdocs` de XAMPP
   - Ruta típica: `C:\xampp\htdocs\orsai`

## Paso 2: Configurar la Base de Datos

1. Abre tu navegador y ve a: `http://localhost/orsai/api/init_db.php`
2. Deberías ver el mensaje: "OK - Tablas creadas"
3. Esto creará el archivo `db/orsai.sqlite` con las siguientes tablas:
   - `users`: Usuarios del sistema
   - `matches`: Partidos de fútbol
   - `comments`: Comentarios sobre partidos
   - `comment_votes`: Votos en comentarios

## Paso 2.5: Configurar API-Football (Opcional)

1. Edita el archivo `api/config.php`
2. Configura tu API key de API-Football:
   ```php
   define('API_FOOTBALL_KEY', 'tu_api_key_aqui');
   ```
3. Obtén tu API key gratuita en: https://www.api-football.com/
4. **Nota**: El sistema está configurado con un timezone de Argentina (GMT-3) automáticamente
5. **Filtros de Ligas**: El sistema filtra automáticamente solo las ligas principales:
   - Las 5 ligas principales de Europa (Premier League, La Liga, Serie A, Bundesliga, Ligue 1)
   - Liga Profesional Argentina
   - Champions League, Europa League, Copa Libertadores

## Paso 3: Configurar Node.js y Angular

1. Asegúrate de tener Node.js instalado (versión 18 o superior)
   - Descarga desde: https://nodejs.org/

2. Abre una terminal en la carpeta `frontend`:
   ```bash
   cd frontend
   ```

3. Instala las dependencias:
   ```bash
   npm install
   ```

## Paso 4: Configurar la URL de la API

1. Abre el archivo `frontend/src/environments/environment.ts`
2. Verifica que la URL sea correcta:
   ```typescript
   apiBaseUrl: 'http://localhost/orsai/api'
   ```
   - Si tu proyecto está en otra ruta, ajusta esta URL

## Paso 5: Iniciar el Servidor de Desarrollo

1. En la terminal dentro de la carpeta `frontend`, ejecuta:
   ```bash
   npm start
   ```
   O alternativamente:
   ```bash
   ng serve
   ```

2. El servidor se iniciará en: `http://localhost:4200`

## Paso 6: Probar la Aplicación

1. Abre tu navegador en: `http://localhost:4200`
2. Verás la página de inicio
3. Navega a "Ver Partidos" y haz clic en "Sincronizar Partidos" para cargar partidos desde API-Football
   - **Nota**: Si no tienes API key configurada, puedes usar datos de ejemplo
   - El botón "Sincronizar" trae partidos del día actual y los próximos 14 días
   - El botón "Ver partidos antiguos (7 días)" muestra partidos de los últimos 7 días
4. Todas las fechas se muestran en horario de Argentina (GMT-3)
5. Para comentar, necesitas registrarte:
   - Ve a "Iniciar Sesión" → "Regístrate"
   - Crea una cuenta
   - Inicia sesión
   - Ahora podrás comentar en los partidos

## Estructura del Proyecto

```
orsai/
├── api/                    # Backend PHP
│   ├── config.php         # Configuración
│   ├── db.php             # Conexión a base de datos
│   ├── jwt.php            # Funciones JWT
│   ├── index.php          # Endpoints de la API
│   └── init_db.php        # Inicialización de BD
├── db/
│   └── orsai.sqlite       # Base de datos SQLite
├── frontend/              # Frontend Angular
│   └── src/
│       └── app/
│           ├── components/    # Componentes de la app
│           ├── core/          # Servicios (API, Auth)
│           └── app.routes.ts  # Rutas
└── INSTRUCCIONES.md      # Este archivo
```

## Endpoints de la API

### Autenticación
- `GET /api/index.php?action=ping` - Verificar que la API funciona
- `POST /api/index.php?action=register` - Registrar usuario
- `POST /api/index.php?action=login` - Iniciar sesión

### Partidos
- `GET /api/index.php?action=matches` - Obtener lista de partidos actuales y futuros (hoy en adelante)
- `GET /api/index.php?action=matches-history` - Obtener lista de partidos históricos (últimos 7 días)
- `GET /api/index.php?action=match&id=X` - Obtener partido específico
- `POST /api/index.php?action=sync-matches` - Sincronizar partidos actuales y futuros (hoy + próximos 14 días)
- `POST /api/index.php?action=sync-matches-history` - Sincronizar partidos históricos (últimos 7 días)

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

### Administración (requiere rol admin)
- `GET /api/index.php?action=admin-users` - Listar usuarios
- `POST /api/index.php?action=admin-users` - Crear usuario
- `PUT /api/index.php?action=admin-users` - Actualizar usuario
- `DELETE /api/index.php?action=admin-users&user_id=X` - Eliminar usuario
- `GET /api/index.php?action=admin-comments` - Listar comentarios
- `DELETE /api/index.php?action=admin-comments&comment_id=X` - Eliminar comentario
- `GET /api/index.php?action=check-admin` - Verificar si el usuario es admin
- `POST /api/index.php?action=generate-fake-comments` - Generar comentarios ficticios contextualizados

### Utilidades
- `GET /api/index.php?action=news` - Obtener noticias de fútbol
- `POST /api/upload_profile_picture.php` - Subir foto de perfil (requiere autenticación)

## Solución de Problemas

### Error: "No se puede conectar a la API"
- Verifica que Apache esté corriendo en XAMPP
- Verifica que la URL en `environment.ts` sea correcta
- Abre `http://localhost/orsai/api/index.php?action=ping` directamente en el navegador

### Error: "Base de datos no encontrada"
- Ejecuta `http://localhost/orsai/api/init_db.php` nuevamente
- Verifica que la carpeta `db` tenga permisos de escritura

### Error: "CORS" en el navegador
- El código ya incluye headers CORS en `api/index.php`
- Si persiste, verifica que Apache esté configurado correctamente

### El frontend no carga
- Verifica que Node.js esté instalado: `node --version`
- Reinstala dependencias: `npm install` en la carpeta `frontend`
- Limpia la caché: `npm cache clean --force`

## Notas para la Defensa

1. **Base de Datos**: La aplicación usa SQLite3, que es una base de datos simple y no requiere servidor separado
2. **Autenticación**: Se implementa JWT de forma simple sin librerías externas para mantener la complejidad baja
3. **API de Partidos**: Por ahora usa datos de ejemplo. En producción se puede conectar a una API real de fútbol
4. **Seguridad**: Las contraseñas se hashean con `password_hash()` de PHP
5. **CORS**: Configurado para desarrollo local (permitir todo). En producción debe restringirse

## Próximos Pasos (Opcional)

- Conectar a una API real de fútbol (ej: Football-Data.org)
- Agregar más funcionalidades (editar comentarios, eliminar, etc.)
- Mejorar el diseño con más estilos personalizados
- Agregar validaciones más robustas
- Implementar paginación para partidos y comentarios






