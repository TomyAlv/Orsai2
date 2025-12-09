# Documento Técnico - Orsai
## Análisis Técnico y Funcional para Defensa del Proyecto

**Autor:** Tomás Álvarez Arzuaga  
**Fecha:** 01/12/2025  
**Proyecto:** Orsai - Plataforma de Fútbol Interactiva

---

## Índice

1. [Arquitectura General del Sistema](#1-arquitectura-general-del-sistema)
2. [Backend - Análisis Técnico Detallado](#2-backend---análisis-técnico-detallado)
3. [Frontend - Análisis Técnico Detallado](#3-frontend---análisis-técnico-detallado)
4. [Base de Datos](#4-base-de-datos)
5. [Sistema de Autenticación JWT](#5-sistema-de-autenticación-jwt)
6. [Flujos de Datos y Comunicación](#6-flujos-de-datos-y-comunicación)
7. [Decisiones Técnicas y Justificaciones](#7-decisiones-técnicas-y-justificaciones)
8. [Patrones de Diseño Implementados](#8-patrones-de-diseño-implementados)
9. [Seguridad Implementada](#9-seguridad-implementada)
10. [Optimizaciones y Performance](#10-optimizaciones-y-performance)
11. [Manejo de Errores y Validaciones](#11-manejo-de-errores-y-validaciones)
12. [Interconexión de Componentes](#12-interconexión-de-componentes)

---

## 1. Arquitectura General del Sistema

### 1.1. Modelo de Arquitectura

Orsai implementa una **arquitectura cliente-servidor RESTful** con separación clara entre frontend y backend:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Angular 21)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Componentes  │  │   Servicios  │  │   Routing    │      │
│  │  Standalone  │  │  (API, Auth)  │  │   Angular    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          │ HTTP/REST
                          │ JSON
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR (PHP 7.4+)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   API REST   │  │   JWT Auth   │  │   SQLite3    │      │
│  │  (index.php) │  │   (jwt.php)  │  │   (db.php)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2. Separación de Responsabilidades

- **Frontend (Angular)**: Presentación, lógica de UI, validaciones del lado del cliente
- **Backend (PHP)**: Lógica de negocio, validaciones de seguridad, acceso a datos
- **Base de Datos (SQLite)**: Persistencia de datos

### 1.3. Comunicación

- **Protocolo**: HTTP/HTTPS
- **Formato de Datos**: JSON
- **Métodos HTTP**: GET, POST, PUT, DELETE
- **Autenticación**: Bearer Token (JWT) en header Authorization

---

## 2. Backend - Análisis Técnico Detallado

### 2.1. Estructura del Backend

El backend está organizado en módulos funcionales:

```
api/
├── index.php              # Router principal y endpoints
├── db.php                 # Conexión a base de datos (Singleton)
├── jwt.php                # Generación y validación de JWT
├── config.php             # Configuración centralizada
├── init_db.php            # Inicialización de esquema
├── upload_profile_picture.php  # Manejo de archivos
└── [scripts de migración]
```

### 2.2. Router Principal (index.php)

#### 2.2.1. Configuración CORS

```php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
```

**Justificación**: 
- Permite comunicación desde el frontend Angular (puerto 4200) al backend (puerto 80)
- El `*` es para desarrollo; en producción debe restringirse al dominio específico
- Manejo de preflight requests (OPTIONS) para peticiones CORS complejas

#### 2.2.2. Sistema de Routing

El router utiliza un patrón **switch-case** basado en el parámetro `action`:

```php
$action = $_GET['action'] ?? 'ping';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
```

**Ventajas de este enfoque**:
- **Simplicidad**: Un solo punto de entrada (`index.php`)
- **Mantenibilidad**: Fácil agregar nuevos endpoints
- **Consistencia**: Todas las respuestas en formato JSON
- **Seguridad**: Validación centralizada de métodos HTTP

**Desventajas y mitigación**:
- Podría volverse grande → Se separa en funciones modulares
- No es RESTful puro → Se mantiene por simplicidad y compatibilidad con hosting básico

#### 2.2.3. Manejo de Errores

```php
try {
    switch ($action) {
        // casos...
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
```

**Estrategia**:
- Try-catch global captura todas las excepciones
- Códigos HTTP apropiados (400, 401, 403, 404, 500)
- Mensajes de error descriptivos para desarrollo
- En producción, los mensajes deberían ser genéricos

### 2.3. Gestión de Base de Datos (db.php)

#### 2.3.1. Patrón Singleton

```php
function getConnection(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'sqlite:' . DB_PATH;
        $pdo = new PDO($dsn);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    return $pdo;
}
```

**Justificación del Singleton**:
- **Eficiencia**: Reutiliza la misma conexión en toda la ejecución
- **SQLite**: No requiere pool de conexiones como MySQL
- **Recursos**: Evita abrir múltiples conexiones innecesarias

**Configuración de PDO**:
- `PDO::ATTR_ERRMODE_EXCEPTION`: Convierte errores SQL en excepciones PHP
- Facilita el manejo de errores con try-catch

### 2.4. Sistema de Autenticación JWT (jwt.php)

#### 2.4.1. Estructura del JWT

Un JWT tiene tres partes separadas por puntos:
```
header.payload.signature
```

**Header**:
```php
$header = [
    'typ' => 'JWT',      // Tipo de token
    'alg' => 'HS256'     // Algoritmo de hash (HMAC SHA-256)
];
```

**Payload**:
```php
$payload = [
    'user_id' => $userId,
    'username' => $username,
    'iat' => time(),                    // Issued At (emitido en)
    'exp' => time() + (7 * 24 * 60 * 60) // Expira en 7 días
];
```

**Signature**:
```php
$signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
```

#### 2.4.2. Codificación Base64URL

**¿Por qué Base64URL y no Base64 estándar?**
- Los tokens JWT se envían en URLs y headers HTTP
- Base64 estándar usa `+`, `/`, `=` que requieren encoding en URLs
- Base64URL reemplaza: `+` → `-`, `/` → `_`, y elimina padding `=`

```php
function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
```

#### 2.4.3. Verificación de Token

```php
function verifyJWT($token) {
    // 1. Validar estructura (3 partes)
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    
    // 2. Verificar firma
    $expectedSignature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
    if (!hash_equals($signature, $expectedSignature)) return null;
    
    // 3. Verificar expiración
    if ($payload['exp'] < time()) return null;
    
    return $payload;
}
```

**Seguridad**:
- `hash_equals()` previene timing attacks
- Validación de expiración en cada request
- Firma HMAC garantiza integridad del token

#### 2.4.4. Obtención del Usuario Actual

```php
function getCurrentUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    return verifyJWT($token);
}
```

**Características**:
- Soporta `Authorization` y `authorization` (case-insensitive)
- Regex para extraer token después de "Bearer "
- Retorna `null` si no hay token o es inválido

### 2.5. Endpoints Principales - Análisis Detallado

#### 2.5.1. Registro de Usuarios (`handleRegister`)

```php
function handleRegister($input) {
    $pdo = getConnection();
    
    // Validación
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    $email = $input['email'] ?? '';
    
    if (empty($username) || empty($password)) {
        throw new Exception('Username y password son requeridos');
    }
    
    // Verificar unicidad
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        throw new Exception('El usuario ya existe');
    }
    
    // Hash de contraseña
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    // Insertar
    $stmt = $pdo->prepare('INSERT INTO users (username, password_hash, email, created_at) VALUES (?, ?, ?, ?)');
    $stmt->execute([$username, $passwordHash, $email, date('Y-m-d H:i:s')]);
}
```

**Aspectos de Seguridad**:
1. **Prepared Statements**: Previene inyección SQL
2. **password_hash()**: Usa bcrypt (algoritmo por defecto de PHP)
3. **Validación de unicidad**: Previene usuarios duplicados
4. **Validación de entrada**: Verifica campos requeridos

**¿Por qué `PASSWORD_DEFAULT`?**
- PHP automáticamente elige el mejor algoritmo disponible
- Actualmente es bcrypt, pero puede cambiar a argon2 en futuras versiones
- Mantiene compatibilidad hacia adelante

#### 2.5.2. Login (`handleLogin`)

```php
function handleLogin($input) {
    // Búsqueda case-insensitive
    $stmt = $pdo->prepare('SELECT id, username, password_hash FROM users WHERE LOWER(username) = LOWER(?)');
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verificar contraseña
    if (!$user || !password_verify($password, $user['password_hash'])) {
        throw new Exception('Credenciales inválidas');
    }
    
    // Generar token
    $token = generateJWT($user['id'], $user['username']);
}
```

**Características**:
- **Case-insensitive**: `LOWER()` permite login sin importar mayúsculas/minúsculas
- **password_verify()**: Compara contraseña con hash de forma segura
- **Mensaje genérico**: "Credenciales inválidas" no revela si el usuario existe

#### 2.5.3. Sistema de Votación (`handleVote`)

Este es uno de los endpoints más complejos. Analicémoslo paso a paso:

```php
function handleVote($input) {
    // 1. Verificar autenticación
    $user = getCurrentUser();
    if (!$user) throw new Exception('Autenticación requerida');
    
    // 2. Validar entrada
    $commentId = $input['comment_id'] ?? null;
    $voteType = $input['vote_type'] ?? null; // 'up' o 'down'
    
    // 3. Obtener autor del comentario
    $stmt = $pdo->prepare('SELECT user_id FROM comments WHERE id = ?');
    $stmt->execute([$commentId]);
    $comment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // 4. Prevenir auto-voto
    if ($comment['user_id'] == $user['user_id']) {
        throw new Exception('No puedes votar tu propio comentario');
    }
    
    // 5. Verificar voto existente
    $stmt = $pdo->prepare('SELECT id, vote_type FROM votes WHERE comment_id = ? AND user_id = ?');
    $stmt->execute([$commentId, $user['user_id']]);
    $existingVote = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // 6. Lógica de votación
    if ($existingVote) {
        if ($existingVote['vote_type'] === $voteType) {
            // Toggle: eliminar voto
            $stmt = $pdo->prepare('DELETE FROM votes WHERE id = ?');
            $karmaChange = ($voteType === 'up') ? -1 : 1; // Revertir
        } else {
            // Cambiar voto
            $stmt = $pdo->prepare('UPDATE votes SET vote_type = ? WHERE id = ?');
            $karmaChange = ($voteType === 'up') ? 2 : -2; // +2 o -2
        }
    } else {
        // Nuevo voto
        $stmt = $pdo->prepare('INSERT INTO votes (comment_id, user_id, vote_type, created_at) VALUES (?, ?, ?, ?)');
        $karmaChange = ($voteType === 'up') ? 1 : -1;
    }
    
    // 7. Actualizar karma del autor
    if ($karmaChange !== 0) {
        $stmt = $pdo->prepare('UPDATE users SET karma = karma + ? WHERE id = ?');
        $stmt->execute([$karmaChange, $authorUserId]);
    }
    
    // 8. Calcular nuevos contadores
    $stmt = $pdo->prepare('
        SELECT 
            COUNT(CASE WHEN vote_type = "up" THEN 1 END) as upvotes,
            COUNT(CASE WHEN vote_type = "down" THEN 1 END) as downvotes,
            SUM(CASE WHEN vote_type = "up" THEN 1 WHEN vote_type = "down" THEN -1 ELSE 0 END) as score
        FROM votes 
        WHERE comment_id = ?
    ');
}
```

**Lógica de Karma**:
- **Voto positivo nuevo**: +1 karma
- **Voto negativo nuevo**: -1 karma
- **Cambiar de negativo a positivo**: +2 karma (quita -1, agrega +1)
- **Cambiar de positivo a negativo**: -2 karma
- **Toggle (quitar voto)**: Revertir el cambio de karma

**Optimización SQL**:
- Uso de `COUNT(CASE WHEN...)` para calcular upvotes/downvotes en una sola query
- `SUM(CASE WHEN...)` calcula el score directamente

#### 2.5.4. Integración con API-Football

**API Externa Utilizada**: API-Football (v3.football.api-sports.io)

**Documentación**: https://www.api-football.com/documentation-v3

**Características**:
- API RESTful para datos de fútbol en tiempo real
- Requiere API key para autenticación
- Límites de rate limiting según plan (free tier: 100 requests/día)
- Formato de respuesta: JSON

**Configuración**:
```php
// api/config.php
define('API_FOOTBALL_KEY', 'tu_api_key_aqui');
define('API_FOOTBALL_BASE_URL', 'https://v3.football.api-sports.io');
```

**Endpoint Utilizado**: `/fixtures?date=YYYY-MM-DD`
- Obtiene partidos de una fecha específica
- Incluye información de equipos, resultados, estado, competición

#### 2.5.5. Sincronización de Partidos (`handleSyncMatches`)

**Sincronización de Partidos Actuales y Futuros**:

```php
function handleSyncMatches() {
    $today = date('Y-m-d');
    $allMatches = [];
    
    // Hoy y próximos 14 días
    $daysToFetch = [];
    $daysToFetch[] = $today;
    for ($i = 1; $i <= 14; $i++) {
        $daysToFetch[] = date('Y-m-d', strtotime("+$i days"));
    }
    
    foreach ($daysToFetch as $index => $date) {
        try {
            $matches = fetchMatchesFromAPI($date);
            if (is_array($matches) && !empty($matches)) {
                $allMatches = array_merge($allMatches, $matches);
            }
        } catch (Exception $e) {
            error_log("Error sincronizando partidos para $date: " . $e->getMessage());
            // Continuar con el siguiente día aunque falle uno
        }
        
        // Pausa de 0.15 segundos entre requests para evitar rate limiting
        if ($index < count($daysToFetch) - 1) {
            usleep(150000);
        }
    }
    
    // Eliminar duplicados basados en api_match_id
    $uniqueMatches = [];
    $seenIds = [];
    foreach ($allMatches as $match) {
        $matchId = $match['api_match_id'];
        if (!isset($seenIds[$matchId])) {
            $seenIds[$matchId] = true;
            $uniqueMatches[] = $match;
        }
    }
    
    // UPSERT: Insertar o actualizar
    foreach ($uniqueMatches as $match) {
        $stmt = $pdo->prepare('SELECT id FROM matches WHERE api_match_id = ?');
        $stmt->execute([$match['api_match_id']]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // UPDATE: Actualizar resultados, estado, etc.
            $stmt = $pdo->prepare('UPDATE matches SET ... WHERE api_match_id = ?');
        } else {
            // INSERT: Nuevo partido
            $stmt = $pdo->prepare('INSERT INTO matches ...');
        }
    }
}
```

**Sincronización de Partidos Históricos** (`handleSyncMatchesHistory`):

```php
function handleSyncMatchesHistory() {
    // Últimos 7 días (ayer hacia atrás)
    $daysToFetch = [];
    for ($i = 1; $i <= 7; $i++) {
        $daysToFetch[] = date('Y-m-d', strtotime("-$i days"));
    }
    
    // Misma lógica de sincronización pero para fechas pasadas
    // ...
}
```

**Estrategia UPSERT**:
- Usa `api_match_id` como identificador único externo
- Si existe, actualiza (para reflejar cambios en resultados)
- Si no existe, inserta
- Permite re-sincronización sin duplicados
- Deduplicación antes de insertar para evitar duplicados en la misma sincronización

**Manejo de Rate Limiting**:
- Pausa de 0.15 segundos entre requests diarios
- Manejo de errores por día sin interrumpir el proceso completo
- Logs de errores para debugging

**Justificación del Rango de Días**:
- **14 días futuros**: Asegura tener partidos programados disponibles
- **7 días históricos**: Rango razonable para partidos recientes sin saturar la base de datos
- Separación entre actuales/futuros e históricos para mejor organización

#### 2.5.6. Generación de Comentarios Ficticios Contextualizados

**Endpoint**: `POST /api/index.php?action=generate-fake-comments`  
**Acceso**: Solo administradores  
**Archivo**: `api/generate_fake_comments.php`

**Propósito**: Generar comentarios realistas y contextualizados para partidos existentes, creando usuarios ficticios con perfiles diversos.

**Implementación**:

```php
function handleGenerateFakeComments() {
    // 1. Verificar permisos de administrador
    $user = getCurrentUser();
    if (!$user || !isAdmin($user['user_id'])) {
        throw new Exception('Acceso denegado: se requieren permisos de administrador');
    }
    
    // 2. Definir usuarios ficticios con perfiles diversos
    $fakeUsers = [
        ['username' => 'FutbolFan2024', 'display_name' => 'Carlos M.', 
         'nationality' => 'Argentina', 'favorite_team' => 'Boca Juniors'],
        ['username' => 'PremierLover', 'display_name' => 'James W.', 
         'nationality' => 'England', 'favorite_team' => 'Manchester United'],
        // ... más usuarios
    ];
    
    // 3. Crear usuarios ficticios si no existen
    foreach ($fakeUsers as $userData) {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
        $stmt->execute([$userData['username']]);
        if (!$stmt->fetch()) {
            // Crear usuario con password por defecto
            $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('INSERT INTO users ...');
        }
    }
    
    // 4. Obtener partidos existentes
    $stmt = $pdo->query('SELECT * FROM matches ORDER BY match_date DESC LIMIT 50');
    $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 5. Generar comentarios contextualizados para cada partido
    foreach ($matches as $match) {
        $numComments = rand(3, 8); // Entre 3 y 8 comentarios por partido
        
        for ($i = 0; $i < $numComments; $i++) {
            // Seleccionar usuario aleatorio
            $user = $allUsers[array_rand($allUsers)];
            
            // Determinar tipo de comentario según contexto
            $commentType = determineCommentType(
                $match['home_team'], 
                $match['away_team'], 
                $match['home_score'], 
                $match['away_score'], 
                $user['favorite_team'],
                $match['status']
            );
            
            // Seleccionar plantilla según tipo
            $templates = $commentTemplates[$commentType];
            $content = str_replace(
                ['{home_team}', '{away_team}'], 
                [$match['home_team'], $match['away_team']], 
                $templates[array_rand($templates)]
            );
            
            // Agregar comentario sobre resultado si aplica
            if ($match['home_score'] !== null) {
                $scoreComment = generateScoreComment(...);
                if ($scoreComment && rand(0, 1)) {
                    $content = $scoreComment . ' ' . $content;
                }
            }
            
            // Fecha aleatoria dentro de las últimas 2 semanas
            $createdAt = date('Y-m-d H:i:s', 
                strtotime("-" . rand(0, 14) . " days -" . rand(0, 23) . " hours"));
            
            // Insertar comentario
            $stmt = $pdo->prepare('INSERT INTO comments ...');
        }
    }
}
```

**Tipos de Comentarios Generados**:

1. **Positivos para equipo local/visitante**: Si el usuario es fan del equipo ganador
2. **Negativos para equipo local/visitante**: Si el usuario es fan del equipo perdedor
3. **Analíticos**: Comentarios sobre táctica y estrategia
4. **Emocionales**: Comentarios expresando emoción por el partido
5. **Comparativos**: Comparaciones entre equipos
6. **Basados en resultado**: Comentarios específicos sobre el marcador
7. **Neutrales**: Comentarios equilibrados

**Contextualización**:

- **Preferencias de equipos**: Los usuarios ficticios tienen equipos favoritos, y los comentarios reflejan su preferencia
- **Resultados del partido**: Los comentarios consideran si el equipo favorito ganó, perdió o empató
- **Estado del partido**: Comentarios diferentes para partidos finalizados vs programados
- **Variedad temporal**: Fechas de comentarios distribuidas en las últimas 2 semanas

**Plantillas de Comentarios**:

```php
$commentTemplates = [
    'positive_home' => [
        '¡Increíble partido de {home_team}! Demostraron su calidad hoy.',
        '{home_team} jugó a otro nivel. Merecida victoria.',
        // ...
    ],
    'analytical' => [
        'El partido se definió en el medio campo. {home_team} controló mejor el ritmo.',
        'La clave fue la presión alta de {home_team}.',
        // ...
    ],
    // ... más tipos
];
```

**Justificación**:
- **Testing**: Permite probar la funcionalidad de comentarios con datos realistas
- **Demo**: Facilita demostraciones con contenido variado
- **Contexto**: Los comentarios tienen sentido según los resultados de los partidos
- **Diversidad**: Crea una comunidad ficticia variada con diferentes nacionalidades y preferencias

**Seguridad**:
- Verificación de rol de administrador antes de ejecutar
- No expone información sensible
- Los usuarios ficticios tienen contraseñas por defecto (no accesibles públicamente)

#### 2.5.7. Filtrado de Ligas y Competiciones

**Ligas Permitidas** (configuradas en `api/config.php`):

```php
define('ALLOWED_LEAGUES', [
    // Las 5 ligas principales de Europa
    'Premier League' => 'England',
    'La Liga' => 'Spain',
    'Primera Division' => 'Spain', // Variante del nombre
    'Serie A' => 'Italy',
    'Bundesliga' => 'Germany',
    'Ligue 1' => 'France',
    // Liga Argentina
    'Liga Profesional' => 'Argentina',
    'Liga Profesional Argentina' => 'Argentina',
    // Copas internacionales (sin país específico)
    'Champions League' => '',
    'UEFA Champions League' => '',
    'Europa League' => '',
    'UEFA Europa League' => '',
    'Copa Libertadores' => ''
]);
```

**Patrones de Exclusión**:

```php
define('EXCLUDED_LEAGUE_PATTERNS', [
    // Ligas juveniles
    'U19', 'U20', 'U21',
    // Ligas secundarias
    '2. Bundesliga', 'Segunda', 'Championship', 'Ligue 2', 'Serie B', 'Primera B',
    // Variantes no deseadas de competiciones internacionales
    'Women',      // Excluir Champions League de mujeres
    'AFC',        // Excluir Champions League de Asia
    'CAF',        // Excluir Champions League de África
    'CONCACAF',   // Excluir Champions League de CONCACAF
    'Youth',      // Excluir ligas juveniles
    'Reserve',    // Excluir ligas de reserva
    'B Team'      // Excluir equipos B
]);
```

**Lógica de Filtrado**:

```php
function fetchMatchesFromAPI($date) {
    // 1. Obtener datos de API-Football
    $url = API_FOOTBALL_BASE_URL . '/fixtures?date=' . $date;
    $response = curl_exec($ch);
    $data = json_decode($response, true);
    
    foreach ($data['response'] as $fixture) {
        $leagueName = $fixture['league']['name'] ?? '';
        $leagueCountry = $fixture['league']['country'] ?? '';
        
        // 2. Verificar exclusiones primero (más rápido)
        foreach ($excludedPatterns as $excluded) {
            if (stripos($leagueName, $excluded) !== false || 
                stripos($competitionFull, $excluded) !== false) {
                continue 2; // Saltar este partido
            }
        }
        
        // 3. Verificar ligas permitidas
        $leagueAllowed = false;
        foreach ($allowedLeagues as $allowedLeagueName => $allowedCountry) {
            // Para competiciones internacionales (país vacío)
            if (empty($allowedCountry)) {
                // Verificar exclusiones específicas para competiciones internacionales
                $isExcluded = false;
                $excludedVariants = ['Women', 'AFC', 'CAF', 'CONCACAF', 'Youth', 'Reserve', 'B Team'];
                foreach ($excludedVariants as $variant) {
                    if (stripos($leagueName, $variant) !== false) {
                        $isExcluded = true;
                        break;
                    }
                }
                if (!$isExcluded && stripos($leagueName, $allowedLeagueName) !== false) {
                    $leagueAllowed = true;
                    break;
                }
            } else {
                // Para ligas nacionales: verificar nombre Y país
                if (stripos($leagueName, $allowedLeagueName) !== false && 
                    stripos($leagueCountry, $allowedCountry) !== false) {
                    $leagueAllowed = true;
                    break;
                }
            }
        }
        
        if (!$leagueAllowed) continue; // Saltar partido
    }
}
```

**Justificación del Filtrado**:
- **Ligas principales**: Enfoque en las 5 ligas más importantes de Europa y Liga Argentina
- **Copas internacionales**: Solo Champions League, Europa League y Copa Libertadores masculinas
- **Exclusión de variantes**: Evita partidos de mujeres, ligas juveniles, y competiciones regionales no deseadas
- **Verificación doble**: Nombre Y país para ligas nacionales evita falsos positivos
- **Case-insensitive**: `stripos()` permite coincidencias sin importar mayúsculas/minúsculas
- **Orden de verificación**: Exclusiones primero (más rápido) y luego inclusiones

#### 2.5.8. Configuración de Timezone

**Timezone Configurado**: `America/Argentina/Buenos_Aires` (GMT-3)

```php
// api/config.php y api/index.php
date_default_timezone_set('America/Argentina/Buenos_Aires');
```

**Justificación**:
- Todas las fechas y horas se muestran en horario local de Argentina
- Consistencia en toda la aplicación
- Las fechas de partidos de la API se convierten automáticamente al timezone local
- Facilita la experiencia del usuario argentino

**Implementación**:
- Configurado al inicio de `config.php` y `index.php`
- Afecta a todas las funciones de fecha/hora de PHP (`date()`, `strtotime()`, etc.)
- Las fechas almacenadas en la base de datos se guardan en formato ISO 8601 con timezone

#### 2.5.5. Búsqueda de Usuarios (`handleSearchUsers`)

```php
function handleSearchUsers($query) {
    if (empty($query) || strlen($query) < 2) {
        return []; // Mínimo 2 caracteres
    }
    
    $searchTerm = '%' . $query . '%';
    $stmt = $pdo->prepare('
        SELECT id, username, profile_picture, nationality, display_name, favorite_team, karma, created_at 
        FROM users 
        WHERE LOWER(username) LIKE LOWER(?) OR LOWER(display_name) LIKE LOWER(?)
        ORDER BY username ASC
        LIMIT 20
    ');
    $stmt->execute([$searchTerm, $searchTerm]);
}
```

**Características**:
- **Búsqueda parcial**: `LIKE '%query%'` permite coincidencias parciales
- **Case-insensitive**: `LOWER()` en ambos lados
- **Búsqueda dual**: En `username` Y `display_name`
- **Límite**: 20 resultados para performance
- **Seguridad**: No expone emails

### 2.6. Manejo de Archivos (upload_profile_picture.php)

```php
// 1. Validar autenticación
$user = getCurrentUser();
if (!$user) throw new Exception('Autenticación requerida');

// 2. Validar archivo
$file = $_FILES['profile_picture'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    throw new Exception('Error al subir el archivo');
}

// 3. Validar tipo MIME
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

if (!in_array($mimeType, $allowedTypes)) {
    throw new Exception('Tipo de archivo no permitido');
}

// 4. Validar tamaño (5MB máximo)
$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    throw new Exception('El archivo es demasiado grande');
}

// 5. Generar nombre único
$filename = 'user_' . $user['user_id'] . '_' . time() . '.' . $extension;

// 6. Mover archivo
move_uploaded_file($file['tmp_name'], $filepath);
```

**Seguridad**:
- **Validación MIME real**: `finfo_file()` lee el contenido, no confía en la extensión
- **Límite de tamaño**: Previene DoS por archivos grandes
- **Nombre único**: Previene sobrescritura y facilita cache busting
- **Autenticación requerida**: Solo usuarios autenticados pueden subir

---

## 3. Frontend - Análisis Técnico Detallado

### 3.1. Arquitectura Angular

#### 3.1.1. Standalone Components

Angular 21 utiliza **Standalone Components** (sin NgModules):

```typescript
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, UserSearchComponent],
  template: `...`,
  styles: [`...`]
})
```

**Ventajas**:
- **Menos boilerplate**: No requiere NgModules
- **Tree-shaking mejorado**: Solo importa lo necesario
- **Modularidad**: Cada componente declara sus dependencias
- **Compatibilidad**: Funciona con módulos tradicionales

#### 3.1.2. Routing

```typescript
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'matches', component: MatchesComponent },
  { path: 'match/:id', component: MatchDetailComponent },
  { path: 'user/:id', component: PublicProfileComponent },
  { path: '**', redirectTo: '' } // Wildcard route
];
```

**Características**:
- **Lazy loading**: Podría implementarse para componentes grandes
- **Route parameters**: `:id` para IDs dinámicos
- **Wildcard**: Redirige rutas no encontradas al home

### 3.2. Servicios Principales

#### 3.2.1. ApiService

**Responsabilidades**:
- Centralizar todas las llamadas HTTP
- Manejar headers de autenticación
- Proporcionar interfaces TypeScript para respuestas

```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiBaseUrl;
  private platformId = inject(PLATFORM_ID);

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }
}
```

**Compatibilidad SSR**:
- `isPlatformBrowser()` verifica si está en el navegador
- `localStorage` solo existe en el navegador
- Previene errores en Server-Side Rendering

**Uso de Observables (RxJS)**:
```typescript
getMatches(): Observable<{ status: string; matches: Match[] }> {
  return this.http.get<{ status: string; matches: Match[] }>(
    `${this.baseUrl}/index.php?action=matches`
  );
}
```

**Ventajas de Observables**:
- **Cancelación**: Puede cancelarse con `unsubscribe()`
- **Transformación**: Operadores como `map`, `filter`, `debounceTime`
- **Composición**: `forkJoin`, `merge`, `switchMap`
- **Lazy**: No ejecuta hasta que alguien se suscribe

#### 3.2.2. AuthService

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated(): boolean {
    const storage = this.getLocalStorage();
    return !!storage?.getItem('token');
  }

  login(username: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.api.login(username, password).subscribe({
        next: (response) => {
          if (response.status === 'ok' && response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            resolve(true);
          }
        },
        error: (error) => reject(error)
      });
    });
  }
}
```

**Conversión Observable → Promise**:
- Facilita uso en componentes con `async/await`
- Mantiene compatibilidad con código que espera Promises

**Almacenamiento**:
- `localStorage` persiste entre sesiones
- Token JWT almacenado para autenticación automática
- Información del usuario para mostrar en UI

#### 3.2.3. ThemeService

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme$ = new BehaviorSubject<Theme>('light');

  setTheme(theme: Theme): void {
    this.currentTheme$.next(theme);
    localStorage.setItem('theme', theme);
    
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }
}
```

**Patrón Observer**:
- `BehaviorSubject` mantiene el último valor
- Componentes pueden suscribirse para reaccionar a cambios
- Persistencia en `localStorage`

**Aplicación del Tema**:
- Clase `dark-theme` en `<body>`
- CSS usa `:host-context(body.dark-theme)` para aplicar estilos
- Cambio global sin necesidad de prop drilling

### 3.3. Componentes Clave

#### 3.3.1. UserSearchComponent

**Búsqueda Reactiva con RxJS**:

```typescript
export class UserSearchComponent implements OnInit, OnDestroy {
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),           // Espera 300ms después del último input
      distinctUntilChanged(),      // Solo si cambió el valor
      switchMap(query => {         // Cancela búsquedas anteriores
        if (query.length < 2) {
          return of([]);
        }
        this.searching = true;
        return this.api.searchUsers(query);
      }),
      takeUntil(this.destroy$)    // Limpia suscripción al destruir
    ).subscribe({
      next: (response) => {
        this.searchResults = response.users;
        this.searching = false;
      }
    });
  }
  
  onSearchInput() {
    this.searchSubject.next(this.searchQuery);
  }
}
```

**Operadores RxJS explicados**:

1. **debounceTime(300)**: 
   - Espera 300ms de inactividad antes de emitir
   - Evita hacer una petición por cada tecla presionada
   - Mejora performance y reduce carga del servidor

2. **distinctUntilChanged()**:
   - Solo emite si el valor cambió
   - Si el usuario escribe "abc" y luego borra y escribe "abc" de nuevo, no hace petición

3. **switchMap()**:
   - Cancela la petición anterior si llega una nueva
   - Si el usuario escribe rápido, solo procesa la última búsqueda
   - Previene race conditions

4. **takeUntil(this.destroy$)**:
   - Cancela la suscripción cuando el componente se destruye
   - Previene memory leaks

**Manejo de Eventos**:

```typescript
(mousedown)="navigateToUser(user.id)"
(mouseenter)="onResultsMouseEnter()"
(mouseleave)="onResultsMouseLeave()"
```

**¿Por qué `mousedown` en lugar de `click`?**
- El `blur` del input cierra los resultados antes de que el `click` se registre
- `mousedown` se ejecuta antes del `blur`, permitiendo la navegación

#### 3.3.2. MatchDetailComponent

**Carga de Datos en Paralelo**:

```typescript
ngOnInit() {
  const matchId = this.route.snapshot.paramMap.get('id');
  
  forkJoin({
    match: this.api.getMatch(+matchId),
    comments: this.api.getComments(+matchId)
  }).subscribe({
    next: ({ match, comments }) => {
      this.match = match.match;
      this.loadCommentsWithVotes(comments.comments);
    }
  });
}
```

**forkJoin**:
- Ejecuta múltiples observables en paralelo
- Espera a que todos completen
- Retorna un objeto con los resultados
- Más eficiente que hacer las peticiones secuencialmente

**Carga de Votos**:

```typescript
loadCommentsWithVotes(comments: Comment[]) {
  const voteRequests = comments.map(comment => 
    this.api.getCommentVotes(comment.id).pipe(
      map(response => ({ commentId: comment.id, votes: response }))
    )
  );
  
  forkJoin(voteRequests).subscribe({
    next: (votes) => {
      votes.forEach(({ commentId, votes }) => {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
          comment.upvotes = votes.upvotes;
          comment.downvotes = votes.downvotes;
          comment.score = votes.score;
          comment.user_vote = votes.user_vote;
        }
      });
    }
  });
}
```

**Estrategia**:
- Hace una petición por comentario para obtener votos
- En producción, podría optimizarse con un endpoint que retorne todos los votos de una vez
- `forkJoin` asegura que todos los votos se carguen antes de mostrar

#### 3.3.3. ProfileComponent

**Detección de Cambios**:

```typescript
ngOnInit() {
  this.api.getProfile().subscribe({
    next: (response) => {
      this.profile = response.profile;
      this.originalProfile = JSON.parse(JSON.stringify(response.profile));
    }
  });
}

hasChanges(): boolean {
  return JSON.stringify(this.profile) !== JSON.stringify(this.originalProfile);
}
```

**Técnica de Comparación**:
- `JSON.stringify()` convierte objetos a strings
- Comparación de strings es simple y efectiva para objetos planos
- `originalProfile` es una copia profunda (no referencia)

**Subida de Archivos**:

```typescript
onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.uploading = true;
    this.api.uploadProfilePicture(file).subscribe({
      next: (response) => {
        this.profile.profile_picture = response.url;
        this.uploading = false;
      },
      error: (error) => {
        this.uploading = false;
        // Manejo de error
      }
    });
  }
}
```

**FormData**:
- `FormData` es necesario para enviar archivos
- El backend recibe en `$_FILES`
- No se puede usar JSON para archivos binarios

### 3.4. Estilos y Temas

#### 3.4.1. CSS Variables

```scss
:root {
  --bg-primary: #ffffff;
  --text-primary: #333333;
  --card-bg: #f8f9fa;
}

body.dark-theme {
  --bg-primary: #121212;
  --text-primary: #e0e0e0;
  --card-bg: #2d2d2d;
}
```

**Ventajas**:
- Cambio de tema centralizado
- Fácil mantenimiento
- Compatible con todos los navegadores modernos

#### 3.4.2. Host Context

```scss
:host-context(body.dark-theme) .card {
  background-color: #2d2d2d;
  color: #e0e0e0;
}
```

**Funcionamiento**:
- `:host-context()` busca un ancestro con la clase especificada
- Si `body` tiene `dark-theme`, aplica los estilos
- Permite estilos condicionales sin prop drilling

---

## 4. Base de Datos

### 4.1. Elección de SQLite

**¿Por qué SQLite?**

1. **Simplicidad**: No requiere servidor de base de datos separado
2. **Portabilidad**: Un solo archivo (`orsai.sqlite`)
3. **Hosting básico**: Compatible con cualquier hosting que soporte PHP
4. **Performance**: Excelente para aplicaciones pequeñas/medianas
5. **Sin configuración**: No requiere usuarios, contraseñas, permisos

**Limitaciones**:
- Escalabilidad limitada (mejor para <100k usuarios)
- Sin concurrencia de escritura avanzada
- Para producción grande, migrar a MySQL/PostgreSQL

### 4.2. Esquema de Base de Datos

#### 4.2.1. Tabla `users`

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'user',
    profile_picture TEXT,
    nationality TEXT,
    display_name TEXT,
    favorite_team TEXT,
    karma INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
);
```

**Decisiones de Diseño**:

- **INTEGER PRIMARY KEY**: Auto-incremento, índice automático
- **TEXT para fechas**: SQLite no tiene tipo DATE nativo, se usa ISO 8601
- **UNIQUE en username/email**: Previene duplicados a nivel de BD
- **DEFAULT 'user'**: Nuevos usuarios son regulares por defecto
- **karma DEFAULT 0**: Inicializa en 0

**Índices** (creados en `add_indexes.php`):
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

**Justificación**: Acelera búsquedas y validaciones de unicidad

#### 4.2.2. Tabla `matches`

```sql
CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_match_id TEXT UNIQUE NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    status TEXT NOT NULL,
    match_date TEXT NOT NULL,
    competition TEXT,
    created_at TEXT NOT NULL
);
```

**api_match_id UNIQUE**:
- Identificador de la API externa
- Previene duplicados al sincronizar
- Permite actualizar partidos existentes

**Índices**:
```sql
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);
```

**Justificación**: Acelera filtros por fecha y estado

#### 4.2.3. Tabla `comments`

```sql
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (match_id) REFERENCES matches(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Foreign Keys**:
- Mantiene integridad referencial
- Si se elimina un usuario, SQLite puede configurarse para CASCADE
- Previene comentarios huérfanos

**Índices**:
```sql
CREATE INDEX idx_comments_match ON comments(match_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_date ON comments(created_at);
```

**Justificación**: 
- `match_id`: Búsqueda de comentarios de un partido
- `user_id`: Búsqueda de comentarios de un usuario
- `created_at`: Ordenamiento por fecha

#### 4.2.4. Tabla `comment_votes` (o `votes`)

```sql
CREATE TABLE votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    vote_type TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES comments(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**UNIQUE(comment_id, user_id)**:
- Un usuario solo puede votar una vez por comentario
- Previene votos duplicados
- Permite actualizar el voto existente

**vote_type**: 'up' o 'down'
- Texto simple, fácil de entender
- Podría ser INTEGER (1/-1) para mejor performance, pero menos legible

### 4.3. Optimizaciones de Consultas

#### 4.3.1. JOINs Optimizados

```sql
SELECT c.id, c.match_id, c.user_id, c.content, c.created_at, 
       u.username, u.profile_picture, u.nationality, u.display_name, u.favorite_team, u.karma
FROM comments c
INNER JOIN users u ON c.user_id = u.id
WHERE c.match_id = ?
ORDER BY c.created_at DESC
LIMIT 100
```

**INNER JOIN**:
- Trae solo comentarios con usuarios válidos
- Más eficiente que LEFT JOIN si no hay usuarios huérfanos
- Trae datos del usuario en una sola query

**LIMIT 100**:
- Previene cargar miles de comentarios
- En producción, implementar paginación

#### 4.3.2. Agregaciones Eficientes

```sql
SELECT 
    COUNT(CASE WHEN vote_type = "up" THEN 1 END) as upvotes,
    COUNT(CASE WHEN vote_type = "down" THEN 1 END) as downvotes,
    SUM(CASE WHEN vote_type = "up" THEN 1 WHEN vote_type = "down" THEN -1 ELSE 0 END) as score
FROM votes 
WHERE comment_id = ?
```

**Ventajas**:
- Una sola query calcula todo
- Más eficiente que múltiples COUNT separados
- Cálculo de score en la BD, no en aplicación

---

## 5. Sistema de Autenticación JWT

### 5.1. Flujo Completo de Autenticación

```
1. Usuario → Login (username, password)
2. Backend → Verifica credenciales
3. Backend → Genera JWT (user_id, username, exp)
4. Backend → Retorna token al frontend
5. Frontend → Guarda token en localStorage
6. Frontend → Incluye token en header Authorization: Bearer <token>
7. Backend → Verifica token en cada request protegido
8. Backend → Extrae user_id del payload
```

### 5.2. Seguridad del Token

**Ventajas de JWT**:
- **Stateless**: No requiere sesión en servidor
- **Escalable**: Cualquier servidor puede verificar el token
- **Portable**: El token contiene la información del usuario

**Desventajas y Mitigación**:
- **No se puede revocar fácilmente**: 
  - Solución: Lista negra de tokens (Redis) o expiración corta
  - Actual: 7 días de expiración
- **Tamaño**: Más grande que session ID
  - Mitigación: Payload mínimo (solo user_id, username)

### 5.3. Validación en Cada Request

```php
function getCurrentUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    return verifyJWT($token);
}
```

**En cada endpoint protegido**:
```php
function handleCreateComment($input) {
    $user = getCurrentUser();
    if (!$user) {
        http_response_code(401);
        throw new Exception('Autenticación requerida');
    }
    // ... resto del código
}
```

---

## 6. Flujos de Datos y Comunicación

### 6.1. Flujo de Registro

```
Usuario llena formulario
    ↓
RegisterComponent.onSubmit()
    ↓
AuthService.register(username, password, email)
    ↓
ApiService.register() → HTTP POST /api/index.php?action=register
    ↓
Backend: handleRegister()
    ↓
Validaciones (username único, campos requeridos)
    ↓
password_hash() → bcrypt
    ↓
INSERT INTO users
    ↓
Response: { status: 'ok', message: '...' }
    ↓
Frontend: Muestra mensaje de éxito
    ↓
Redirige a /login
```

### 6.2. Flujo de Comentario y Votación

```
Usuario escribe comentario
    ↓
MatchDetailComponent.createComment()
    ↓
ApiService.createComment(matchId, content)
    ↓
HTTP POST /api/index.php?action=comments
    Header: Authorization: Bearer <token>
    ↓
Backend: getCurrentUser() → verifica JWT
    ↓
handleCreateComment()
    ↓
INSERT INTO comments
    ↓
Response: { status: 'ok', comment: {...} }
    ↓
Frontend: Agrega comentario a la lista
    ↓
Usuario vota en comentario
    ↓
MatchDetailComponent.voteComment(commentId, 'up')
    ↓
ApiService.voteComment()
    ↓
HTTP POST /api/index.php?action=vote
    ↓
Backend: handleVote()
    ↓
Verifica: ¿Ya votó? ¿Es su propio comentario?
    ↓
INSERT/UPDATE/DELETE en votes
    ↓
UPDATE users SET karma = karma + ? WHERE id = ?
    ↓
SELECT COUNT(...) FROM votes WHERE comment_id = ?
    ↓
Response: { upvotes, downvotes, score, user_vote }
    ↓
Frontend: Actualiza UI con nuevos contadores
```

### 6.3. Flujo de Búsqueda de Usuarios

```
Usuario escribe en búsqueda
    ↓
UserSearchComponent.onSearchInput()
    ↓
searchSubject.next(query)
    ↓
RxJS: debounceTime(300) → espera 300ms
    ↓
distinctUntilChanged() → solo si cambió
    ↓
switchMap() → cancela búsqueda anterior
    ↓
ApiService.searchUsers(query)
    ↓
HTTP GET /api/index.php?action=search-users&q=query
    ↓
Backend: handleSearchUsers(query)
    ↓
SELECT ... WHERE LOWER(username) LIKE LOWER(?) OR LOWER(display_name) LIKE LOWER(?)
    ↓
Response: { status: 'ok', users: [...] }
    ↓
Frontend: Muestra resultados en dropdown
    ↓
Usuario hace clic
    ↓
Router.navigate(['/user', userId])
    ↓
PublicProfileComponent carga perfil
```

---

## 7. Decisiones Técnicas y Justificaciones

### 7.1. ¿Por qué PHP en lugar de Node.js/Express?

**Ventajas elegidas**:
- **Hosting básico**: Cualquier hosting con PHP funciona
- **Simplicidad**: No requiere Node.js en servidor
- **Familiaridad**: PHP es común en hosting compartido
- **SQLite nativo**: Soporte excelente

**Trade-offs**:
- Menos moderno que Node.js
- Pero más compatible con requisitos del examen

### 7.2. ¿Por qué SQLite en lugar de MySQL?

**Ventajas**:
- **Sin configuración**: No requiere servidor de BD
- **Portabilidad**: Un solo archivo
- **Suficiente**: Para el alcance del proyecto

**Cuándo migrar a MySQL**:
- Más de 100k usuarios
- Necesidad de replicación
- Transacciones complejas concurrentes

### 7.3. ¿Por qué Angular en lugar de React/Vue?

**Ventajas**:
- **Framework completo**: Routing, HTTP, forms incluidos
- **TypeScript nativo**: Mejor para proyectos grandes
- **Arquitectura clara**: Separación de responsabilidades
- **Standalone Components**: Moderno y eficiente

### 7.4. ¿Por qué JWT propio en lugar de librería?

**Razones**:
- **Control total**: Entender cómo funciona
- **Sin dependencias**: No requiere composer/npm adicional
- **Simplicidad**: Para el alcance del proyecto, suficiente
- **Educativo**: Demuestra comprensión del concepto

**En producción**: Usar librería probada (firebase/php-jwt)

### 7.4. Bibliotecas y APIs de Terceros Utilizadas

#### 7.4.1. API-Football (v3.football.api-sports.io)

**Tipo**: API REST externa  
**Documentación**: https://www.api-football.com/documentation-v3  
**Propósito**: Obtener datos de partidos de fútbol en tiempo real

**Características**:
- API RESTful con autenticación mediante API key
- Endpoint utilizado: `/fixtures?date=YYYY-MM-DD`
- Formato de respuesta: JSON
- Rate limiting según plan (free tier: 100 requests/día)

**Implementación**:
```php
// api/config.php
define('API_FOOTBALL_KEY', 'tu_api_key');
define('API_FOOTBALL_BASE_URL', 'https://v3.football.api-sports.io');

// api/index.php - fetchMatchesFromAPI()
$url = API_FOOTBALL_BASE_URL . '/fixtures?date=' . $date;
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'x-rapidapi-key: ' . API_FOOTBALL_KEY,
    'x-rapidapi-host: v3.football.api-sports.io'
]);
```

**Manejo de Errores**:
- Validación de códigos HTTP (429 para rate limiting, 401/403 para autenticación)
- Timeout de 15 segundos para evitar bloqueos
- Logs de errores para debugging
- Continuación del proceso aunque falle una fecha

**Justificación**:
- Fuente confiable y actualizada de datos de fútbol
- Cobertura amplia de ligas y competiciones
- API bien documentada y mantenida
- Alternativa a APIs más costosas o con menos cobertura

#### 7.4.2. Bootstrap 5.3

**Tipo**: Framework CSS  
**Documentación**: https://getbootstrap.com/docs/5.3/  
**Versión**: 5.3  
**Propósito**: Componentes UI y sistema de grid responsive

**Características Utilizadas**:
- Sistema de grid (container, row, col)
- Componentes: cards, buttons, forms, modals, alerts
- Utilidades: spacing, colors, typography
- Iconos: Bootstrap Icons

**Implementación**:
- Incluido vía CDN en `index.html`
- Clases Bootstrap aplicadas directamente en templates
- Personalización mediante CSS custom y variables CSS

**Justificación**:
- Acelera desarrollo de UI consistente
- Responsive design out-of-the-box
- Amplia comunidad y documentación
- Compatible con Angular

#### 7.4.3. Bootstrap Icons

**Tipo**: Librería de iconos  
**Documentación**: https://icons.getbootstrap.com/  
**Propósito**: Iconografía consistente en toda la aplicación

**Uso**:
- Iconos de navegación (home, user, admin, etc.)
- Iconos de acciones (edit, delete, search, etc.)
- Iconos de estado (check, error, loading, etc.)

**Implementación**:
- Incluido vía CDN junto con Bootstrap
- Uso: `<i class="bi bi-icon-name"></i>`

#### 7.4.4. RxJS 7.8

**Tipo**: Librería de programación reactiva  
**Documentación**: https://rxjs.dev/  
**Versión**: 7.8 (incluida con Angular)  
**Propósito**: Manejo de observables y programación asíncrona

**Operadores Utilizados**:
- `debounceTime`: Para búsqueda de usuarios
- `distinctUntilChanged`: Evitar búsquedas duplicadas
- `switchMap`: Cancelar búsquedas anteriores
- `takeUntil`: Limpieza de suscripciones
- `finalize`: Ejecutar código al finalizar observable
- `forkJoin`: Múltiples requests paralelos

**Justificación**:
- Integrado nativamente con Angular
- Manejo elegante de operaciones asíncronas
- Cancelación automática de requests obsoletos
- Previene memory leaks

#### 7.4.5. Angular Framework (v21)

**Tipo**: Framework frontend  
**Documentación**: https://angular.dev/  
**Versión**: 21  
**Propósito**: Framework completo para desarrollo frontend

**Características Utilizadas**:
- Standalone Components
- Dependency Injection
- Routing
- HTTP Client
- Forms (Reactive Forms)
- Change Detection
- Lifecycle Hooks

**Módulos Principales**:
- `@angular/core`: Funcionalidades core
- `@angular/common`: Utilidades comunes (CommonModule, DatePipe, etc.)
- `@angular/router`: Sistema de routing
- `@angular/forms`: Manejo de formularios
- `@angular/common/http`: HTTP Client para API calls
- `@angular/platform-browser`: Funcionalidades del navegador

**Justificación**:
- Framework robusto y maduro
- TypeScript nativo
- Arquitectura escalable
- Excelente tooling (Angular CLI)
- Gran ecosistema y comunidad

#### 7.4.6. TypeScript

**Tipo**: Superset de JavaScript  
**Documentación**: https://www.typescriptlang.org/  
**Propósito**: Tipado estático y mejor desarrollo

**Características Utilizadas**:
- Interfaces para tipos de datos
- Tipado de funciones y variables
- Enums para constantes
- Generics para reutilización

**Justificación**:
- Detección temprana de errores
- Mejor autocompletado en IDE
- Documentación implícita mediante tipos
- Refactoring más seguro

### 7.5. ¿Por qué un solo archivo API (index.php)?

**Ventajas**:
- **Simplicidad**: Un solo punto de entrada
- **Fácil debugging**: Todo en un lugar
- **Sin .htaccess complejo**: Funciona en cualquier hosting

**Alternativa considerada**: RESTful con rutas separadas
- Más "correcto" pero más complejo
- Requiere reescritura de URLs (.htaccess)

---

## 8. Patrones de Diseño Implementados

### 8.1. Singleton (db.php)

```php
function getConnection(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO($dsn);
    }
    return $pdo;
}
```

**Propósito**: Una sola instancia de conexión por request

### 8.2. Repository Pattern (implícito)

Las funciones `handle*()` actúan como repositorios:
- `handleGetMatches()` → Repository de matches
- `handleGetComments()` → Repository de comments

**Ventaja**: Lógica de acceso a datos centralizada

### 8.3. Service Pattern (Frontend)

```typescript
@Injectable({ providedIn: 'root' })
export class ApiService { }
```

**Propósito**: Lógica de negocio reutilizable
**Inyección de Dependencias**: Angular maneja la creación

### 8.4. Observer Pattern (RxJS)

```typescript
this.api.getMatches().subscribe({
  next: (data) => { /* ... */ },
  error: (error) => { /* ... */ }
});
```

**Propósito**: Programación reactiva, manejo asíncrono

### 8.5. Strategy Pattern (Temas)

```typescript
setTheme(theme: Theme): void {
  if (theme === 'dark') {
    body.classList.add('dark-theme');
  } else {
    body.classList.remove('dark-theme');
  }
}
```

**Propósito**: Intercambiar algoritmos (tema claro/oscuro) en runtime

---

## 9. Seguridad Implementada

### 9.1. Autenticación

✅ **JWT con expiración**: Tokens expiran en 7 días
✅ **Verificación de firma**: HMAC SHA-256
✅ **Validación en cada request**: `getCurrentUser()` en endpoints protegidos

### 9.2. Autorización

✅ **Roles**: `user` vs `admin`
✅ **Verificación de admin**: `isAdmin()` antes de operaciones sensibles
✅ **Prevención de auto-eliminación**: Admin no puede eliminarse a sí mismo

### 9.3. Protección de Datos

✅ **Hash de contraseñas**: `password_hash()` con bcrypt
✅ **Prepared Statements**: Previene inyección SQL
✅ **Validación de entrada**: Tanto frontend como backend
✅ **Sanitización**: `trim()`, validación de tipos

### 9.4. Protección de Archivos

✅ **Validación MIME real**: `finfo_file()` lee contenido, no extensión
✅ **Límite de tamaño**: 5MB máximo
✅ **Nombres únicos**: Previene sobrescritura
✅ **Autenticación requerida**: Solo usuarios autenticados

### 9.5. CORS

✅ **Configurado**: Headers CORS apropiados
⚠️ **Desarrollo**: `Access-Control-Allow-Origin: *`
🔒 **Producción**: Restringir a dominio específico

### 9.6. Exposición de Datos

✅ **Emails ocultos**: No se retornan en búsquedas/perfiles públicos
✅ **Solo campos necesarios**: SELECT específico, no `SELECT *` en todos lados

---

## 10. Optimizaciones y Performance

### 10.1. Backend

#### 10.1.1. Índices de Base de Datos

```sql
CREATE INDEX idx_comments_match ON comments(match_id);
CREATE INDEX idx_users_username ON users(username);
```

**Impacto**: Búsquedas 10-100x más rápidas

#### 10.1.2. Límites en Consultas

```sql
SELECT * FROM matches ORDER BY match_date DESC LIMIT 100
SELECT ... FROM users ... LIMIT 20
```

**Propósito**: Evitar cargar miles de registros

#### 10.1.3. SELECT Específico

```sql
-- En lugar de SELECT *
SELECT id, username, email, profile_picture FROM users WHERE id = ?
```

**Ventaja**: Menos datos transferidos, más rápido

#### 10.1.4. Singleton de Conexión

Reutiliza la misma conexión PDO en un request

### 10.2. Frontend

#### 10.2.1. Debounce en Búsqueda

```typescript
debounceTime(300)
```

**Impacto**: Reduce peticiones de ~10 por segundo a ~3 por segundo

#### 10.2.2. switchMap para Cancelación

```typescript
switchMap(query => this.api.searchUsers(query))
```

**Impacto**: Cancela peticiones obsoletas, ahorra ancho de banda

#### 10.2.3. forkJoin para Paralelismo

```typescript
forkJoin({
  match: this.api.getMatch(id),
  comments: this.api.getComments(id)
})
```

**Impacto**: Carga en paralelo en lugar de secuencial (2x más rápido)

#### 10.2.4. takeUntil para Limpieza

```typescript
takeUntil(this.destroy$)
```

**Impacto**: Previene memory leaks, cancela suscripciones

#### 10.2.5. Lazy Loading Potencial

Los componentes podrían cargarse bajo demanda:
```typescript
{ path: 'admin', loadComponent: () => import('./admin/admin.component') }
```

**No implementado** pero sería la siguiente optimización

### 10.3. Red

#### 10.3.1. Compresión (futuro)

Gzip en Apache para reducir tamaño de respuestas JSON

#### 10.3.2. Caché de Headers (futuro)

```php
header('Cache-Control: public, max-age=3600');
```

Para datos que no cambian frecuentemente (listado de partidos)

---

## 11. Manejo de Errores y Validaciones

### 11.1. Backend

#### 11.1.1. Try-Catch Global

```php
try {
    switch ($action) {
        // ...
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
```

**Cobertura**: Captura todas las excepciones no manejadas

#### 11.1.2. Validación de Métodos HTTP

```php
if ($method !== 'POST') {
    throw new Exception('Método no permitido');
}
```

**Propósito**: Asegura que endpoints se usen correctamente

#### 11.1.3. Validación de Entrada

```php
$username = $input['username'] ?? '';
if (empty($username)) {
    throw new Exception('Username es requerido');
}
```

**Cobertura**: Campos requeridos, tipos, rangos

#### 11.1.4. Validación de Autenticación

```php
$user = getCurrentUser();
if (!$user) {
    http_response_code(401);
    throw new Exception('Autenticación requerida');
}
```

**Códigos HTTP apropiados**: 401 (Unauthorized), 403 (Forbidden)

### 11.2. Frontend

#### 11.2.1. Manejo de Errores en Observables

```typescript
this.api.getMatches().subscribe({
  next: (data) => { /* éxito */ },
  error: (error) => {
    this.errorMessage = error.error?.error || 'Error desconocido';
  }
});
```

**UX**: Muestra mensajes amigables al usuario

#### 11.2.2. Validación de Formularios

```typescript
<form (ngSubmit)="onSubmit()">
  <input [(ngModel)]="username" name="username" required minlength="3">
</form>
```

**Validación HTML5 + Angular**: Doble capa de validación

#### 11.2.3. Estados de Carga

```typescript
loading = false;
errorMessage = '';

this.loading = true;
this.api.getData().subscribe({
  next: () => this.loading = false,
  error: () => this.loading = false
});
```

**UX**: Spinners, mensajes de error, estados disabled

---

## 12. Interconexión de Componentes

### 12.1. Comunicación Frontend-Backend

```
Component → Service → HTTP → Backend API → Database
                ↓
         Response Observable
                ↓
         Component actualiza UI
```

### 12.2. Comunicación entre Componentes

#### 12.2.1. Router (Navegación)

```typescript
this.router.navigate(['/match', matchId]);
```

**Propósito**: Navegación entre páginas

#### 12.2.2. Servicios Compartidos

```typescript
// Component A
this.authService.login(...);

// Component B
if (this.authService.isAuthenticated()) { ... }
```

**Propósito**: Estado compartido (autenticación, tema)

#### 12.2.3. Input/Output (no usado, pero posible)

```typescript
@Input() match: Match;
@Output() voteEvent = new EventEmitter();
```

**Alternativa**: Para comunicación padre-hijo

### 12.3. Flujo de Estado

```
Usuario → Action → Service → API → Backend → DB
                                    ↓
                            Response → Service → Component → UI Update
```

**Unidireccional**: Fácil de seguir y debuggear

### 12.4. Dependencias entre Servicios

```
AuthService → ApiService → HttpClient
ThemeService → (independiente)
ApiService → HttpClient → HTTP
```

**Inyección de Dependencias**: Angular resuelve automáticamente

---

## Preguntas Frecuentes para la Defensa

### P: ¿Por qué no usaste un framework PHP como Laravel?

**R**: Por simplicidad y para demostrar comprensión de PHP puro. Laravel agrega complejidad innecesaria para este proyecto. El código es más directo y fácil de entender para la evaluación.

### P: ¿Cómo escalaría esto a 1 millón de usuarios?

**R**: 
1. Migrar a MySQL/PostgreSQL con replicación
2. Implementar caché (Redis) para consultas frecuentes
3. CDN para assets estáticos
4. Load balancer para múltiples servidores
5. Optimizar queries con índices adicionales
6. Paginación en todos los listados
7. Rate limiting en API

### P: ¿Por qué JWT en lugar de sesiones?

**R**: 
- Stateless: No requiere almacenamiento en servidor
- Escalable: Cualquier servidor puede verificar
- Moderno: Estándar de la industria
- Para este proyecto, suficiente. En producción grande, considerar refresh tokens.

### P: ¿Cómo previenes XSS?

**R**: 
- Angular sanitiza automáticamente en templates
- `strip_tags()` en backend para contenido de usuarios
- Validación de tipos en entrada
- En producción, usar librerías como DOMPurify

### P: ¿Cómo manejarías concurrencia en votos?

**R**: 
- SQLite maneja locks automáticamente
- El UNIQUE(comment_id, user_id) previene duplicados
- Para mayor escala, usar transacciones explícitas o locks optimistas

### P: ¿Por qué RxJS en lugar de Promises?

**R**: 
- Cancelación: Puedo cancelar peticiones
- Operadores: debounceTime, switchMap son poderosos
- Composición: forkJoin, merge para operaciones complejas
- Reactividad: Reacciona a cambios de forma elegante

---

## Conclusiones

Orsai implementa una arquitectura moderna y escalable con:

✅ **Separación clara** frontend/backend
✅ **Seguridad robusta** (JWT, prepared statements, validaciones)
✅ **Performance optimizada** (índices, debounce, paralelismo)
✅ **Código mantenible** (patrones de diseño, modularidad)
✅ **UX excelente** (búsqueda reactiva, temas, feedback visual)

El proyecto demuestra comprensión de:
- Arquitectura de aplicaciones web
- Autenticación y autorización
- Optimización de bases de datos
- Programación reactiva
- Buenas prácticas de seguridad

---

**Fin del Documento Técnico**

