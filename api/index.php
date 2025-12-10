<?php
// Configuración de timezone (Argentina GMT-3)
date_default_timezone_set('America/Argentina/Buenos_Aires');

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

/**
 * Configuración CORS para permitir peticiones desde el frontend Angular
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Obtener action de query string o de PATH_INFO
$action = $_GET['action'] ?? null;
if (!$action && isset($_SERVER['PATH_INFO'])) {
    $pathInfo = trim($_SERVER['PATH_INFO'], '/');
    if (!empty($pathInfo)) {
        $action = $pathInfo;
    }
}
$action = $action ?? 'ping';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);


try {
switch ($action) {
    case 'ping':
        echo json_encode([
            'status' => 'ok',
            'message' => 'API orsai funcionando',
            'time' => date('c')
        ]);
        break;

        // Autenticación
        case 'register':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }
            handleRegister($input);
            break;

        case 'login':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }
            handleLogin($input);
            break;

        // Partidos
        case 'matches':
            if ($method === 'GET') {
                $mode = $_GET['mode'] ?? 'current';
                handleGetMatches($mode);
            } else {
                throw new Exception('Método no permitido');
            }
            break;

        case 'match':
            if ($method === 'GET') {
                $matchId = $_GET['id'] ?? null;
                handleGetMatch($matchId);
            } else {
                throw new Exception('Método no permitido');
            }
            break;

        case 'sync-matches':
            if ($method === 'POST') {
                handleSyncMatches();
            } else {
                throw new Exception('Método no permitido');
            }
            break;
        case 'sync-matches-history':
            if ($method === 'POST') {
                handleSyncMatchesHistory();
            } else {
                throw new Exception('Método no permitido');
            }
            break;
        case 'matches-history':
            if ($method === 'GET') {
                handleGetMatchesHistory();
            } else {
                throw new Exception('Método no permitido');
            }
            break;


        // Comentarios
        case 'comments':
            if ($method === 'GET') {
                $matchId = $_GET['match_id'] ?? null;
                handleGetComments($matchId);
            } elseif ($method === 'POST') {
                handleCreateComment($input);
            } else {
                throw new Exception('Método no permitido');
            }
            break;

        // Noticias
        case 'news':
            if ($method === 'GET') {
                handleGetNews();
            } else {
                throw new Exception('Método no permitido');
            }
            break;

        // Perfil de usuario
        case 'profile':
            if ($method === 'GET') {
                $userId = $_GET['user_id'] ?? null;
                if ($userId) {
                    handleGetPublicProfile($userId);
                } else {
                    handleGetProfile();
                }
            } elseif ($method === 'PUT' || $method === 'POST') {
                handleUpdateProfile($input);
            } else {
                throw new Exception('Método no permitido');
            }
            break;

        // Perfil público (solo lectura)
        case 'public-profile':
            if ($method === 'GET') {
                $userId = $_GET['user_id'] ?? null;
                handleGetPublicProfile($userId);
            } else {
                throw new Exception('Método no permitido');
            }
            break;

        // Administración - Usuarios
        case 'admin-users':
            if ($method === 'GET') {
                handleAdminGetUsers();
            } elseif ($method === 'POST') {
                handleAdminCreateUser($input);
            } elseif ($method === 'PUT') {
                handleAdminUpdateUser($input);
            } elseif ($method === 'DELETE') {
                $userId = $_GET['user_id'] ?? null;
                handleAdminDeleteUser($userId);
            } else {
                throw new Exception('Método no permitido');
            }
            break;

        // Administración - Comentarios
        case 'admin-comments':
            if ($method === 'GET') {
                handleAdminGetComments();
            } elseif ($method === 'DELETE') {
                $commentId = $_GET['comment_id'] ?? null;
                handleAdminDeleteComment($commentId);
            } else {
                throw new Exception('Método no permitido');
            }
            break;

        // Sistema de votos/karma
        case 'vote':
            if ($method === 'POST') {
                handleVote($input);
            } else {
                throw new Exception('Método no permitido');
            }
            break;

        case 'comment-votes':
            if ($method === 'GET') {
                $commentId = $_GET['comment_id'] ?? null;
                handleGetCommentVotes($commentId);
            } else {
                throw new Exception('Método no permitido');
            }
            break;

        case 'check-admin':
            if ($method === 'GET') {
                handleCheckAdmin();
            } else {
                throw new Exception('Método no permitido');
            }
            break;

        // Búsqueda de usuarios
        case 'search-users':
            if ($method === 'GET') {
                $query = $_GET['q'] ?? '';
                handleSearchUsers($query);
            } else {
                throw new Exception('Método no permitido');
            }
            break;

        // Generar comentarios ficticios (solo para desarrollo/demo)
        case 'generate-fake-comments':
            if ($method === 'POST') {
                handleGenerateFakeComments();
            } else {
                throw new Exception('Método no permitido');
            }
            break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Acción no encontrada']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * ============================================
 * FUNCIONES DE MANEJO DE PETICIONES
 * ============================================
 */

/**
 * Registra un nuevo usuario en el sistema
 */
function handleRegister($input) {
    $pdo = getConnection();
    
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    $email = $input['email'] ?? '';
    
    if (empty($username) || empty($password)) {
        throw new Exception('Username y password son requeridos');
    }
    
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        throw new Exception('El usuario ya existe');
    }
    
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (username, password_hash, email, created_at) VALUES (?, ?, ?, ?)');
    $stmt->execute([$username, $passwordHash, $email, date('Y-m-d H:i:s')]);
    
    echo json_encode(['status' => 'ok', 'message' => 'Usuario registrado correctamente']);
}

/**
 * Autentica un usuario y retorna un token JWT
 * El login no distingue entre mayúsculas y minúsculas en el nombre de usuario
 */
function handleLogin($input) {
    $pdo = getConnection();
    
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        throw new Exception('Username y password son requeridos');
    }
    
    // Búsqueda case-insensitive usando LOWER() en SQL
    $stmt = $pdo->prepare('SELECT id, username, password_hash FROM users WHERE LOWER(username) = LOWER(?)');
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || !password_verify($password, $user['password_hash'])) {
        throw new Exception('Credenciales inválidas');
    }
    
    $token = generateJWT($user['id'], $user['username']);
    
    echo json_encode([
        'status' => 'ok',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username']
        ]
    ]);
}

/**
 * Obtiene partidos actuales (hoy y futuros)
 * No muestra partidos pasados - FILTRO ESTRICTO
 */
function handleGetMatches() {
    try {
        require_once __DIR__ . '/config.php';
        $pdo = getConnection();
        
        $allowedPatterns = defined('ALLOWED_LEAGUE_PATTERNS') ? ALLOWED_LEAGUE_PATTERNS : [];
        $excludedPatterns = defined('EXCLUDED_LEAGUE_PATTERNS') ? EXCLUDED_LEAGUE_PATTERNS : [];
        
        // Desde hoy 00:00:00 en adelante - FILTRO ESTRICTO
        $cutoffDate = date('Y-m-d 00:00:00');
        
        // Filtrar estrictamente: solo partidos de hoy en adelante
        $whereParts = ["DATE(match_date) >= DATE(?)"];
        $params = [$cutoffDate];
        
        if (!empty($allowedPatterns)) {
            $conditions = [];
            foreach ($allowedPatterns as $pattern) {
                $conditions[] = "competition LIKE ?";
                $params[] = '%' . $pattern . '%';
            }
            $whereParts[] = '(' . implode(' OR ', $conditions) . ')';
        }
        
        if (!empty($excludedPatterns)) {
            foreach ($excludedPatterns as $excluded) {
                $whereParts[] = "competition NOT LIKE ?";
                $params[] = '%' . $excluded . '%';
            }
        }
        
        $whereClause = 'WHERE ' . implode(' AND ', $whereParts);
        
        // Orden: vivos primero, luego programados, luego fecha ascendente
        $sql = "SELECT * FROM matches $whereClause 
                ORDER BY 
                    CASE 
                        WHEN status = 'LIVE' THEN 1
                        WHEN status = 'SCHEDULED' THEN 2
                        ELSE 3
                    END,
                    match_date ASC
                LIMIT 200";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['status' => 'ok', 'matches' => $matches ?: []]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'error' => 'Error al obtener partidos: ' . $e->getMessage(), 'matches' => []]);
    }
}

/**
 * Obtiene partidos históricos (solo últimos 7 días, excluyendo hoy)
 * FILTRO ESTRICTO: solo partidos pasados de los últimos 7 días
 */
function handleGetMatchesHistory() {
    try {
        require_once __DIR__ . '/config.php';
        $pdo = getConnection();
        
        $allowedPatterns = defined('ALLOWED_LEAGUE_PATTERNS') ? ALLOWED_LEAGUE_PATTERNS : [];
        $excludedPatterns = defined('EXCLUDED_LEAGUE_PATTERNS') ? EXCLUDED_LEAGUE_PATTERNS : [];
        
        // Últimos 7 días hacia atrás, excluyendo hoy
        $startDate = date('Y-m-d 00:00:00', strtotime('-7 days'));
        $endDate = date('Y-m-d 23:59:59', strtotime('-1 day'));
        
        // Filtrar estrictamente: solo partidos pasados de los últimos 7 días
        $whereParts = ["DATE(match_date) BETWEEN DATE(?) AND DATE(?)"];
        $params = [$startDate, $endDate];
        
        if (!empty($allowedPatterns)) {
            $conditions = [];
            foreach ($allowedPatterns as $pattern) {
                $conditions[] = "competition LIKE ?";
                $params[] = '%' . $pattern . '%';
            }
            $whereParts[] = '(' . implode(' OR ', $conditions) . ')';
        }
        
        if (!empty($excludedPatterns)) {
            foreach ($excludedPatterns as $excluded) {
                $whereParts[] = "competition NOT LIKE ?";
                $params[] = '%' . $excluded . '%';
            }
        }
        
        $whereClause = 'WHERE ' . implode(' AND ', $whereParts);
        
        // Orden: más recientes primero
        $sql = "SELECT * FROM matches $whereClause 
                ORDER BY match_date DESC
                LIMIT 200";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['status' => 'ok', 'matches' => $matches ?: []]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'error' => 'Error al obtener partidos históricos: ' . $e->getMessage(), 'matches' => []]);
    }
}

/**
 * Obtiene los detalles de un partido específico por ID
 * Optimizado: solo selecciona las columnas necesarias
 */
function handleGetMatch($matchId) {
    if (!$matchId) {
        throw new Exception('ID de partido requerido');
    }
    
    $pdo = getConnection();
    // Optimización: seleccionar solo columnas necesarias en lugar de *
    $stmt = $pdo->prepare('
        SELECT id, api_match_id, home_team, away_team, home_score, away_score, 
               status, match_date, competition 
        FROM matches 
        WHERE id = ?
    ');
    $stmt->execute([$matchId]);
    $match = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$match) {
        throw new Exception('Partido no encontrado');
    }
    
    echo json_encode(['status' => 'ok', 'match' => $match]);
}

/**
 * Sincroniza partidos actuales (hoy) y próximos (siguientes 7 días)
 * No trae partidos antiguos
 */
function handleSyncMatches() {
    require_once __DIR__ . '/config.php';
    
    if (!function_exists('curl_init')) {
        throw new Exception('cURL no está disponible en este servidor');
    }
    
    $pdo = getConnection();
    $allMatches = [];
    $today = date('Y-m-d');
    
    // Hoy y próximos 14 días (aumentado para tener más partidos)
    $daysToFetch = [];
    $daysToFetch[] = $today;
    for ($i = 1; $i <= 14; $i++) {
        $daysToFetch[] = date('Y-m-d', strtotime("+$i days"));
    }
    
    $totalDays = count($daysToFetch);
    $successfulDays = 0;
    $failedDays = 0;
    
    foreach ($daysToFetch as $index => $date) {
        try {
            $matches = fetchMatchesFromAPI($date);
            if (is_array($matches) && !empty($matches)) {
                $allMatches = array_merge($allMatches, $matches);
                $successfulDays++;
                error_log("Sincronización exitosa para $date: " . count($matches) . " partidos encontrados");
                // Log de las ligas encontradas para debugging (solo primeras 10 para no saturar)
                $leaguesFound = [];
                foreach ($matches as $match) {
                    $comp = $match['competition'] ?? 'Desconocida';
                    if (!in_array($comp, $leaguesFound) && count($leaguesFound) < 10) {
                        $leaguesFound[] = $comp;
                    }
                }
                if (count($leaguesFound) > 0) {
                    error_log("Ligas encontradas para $date: " . implode(', ', $leaguesFound) . (count($matches) > 10 ? '...' : ''));
                }
            } else {
                error_log("No se encontraron partidos para $date (puede ser normal si no hay partidos programados)");
            }
        } catch (Exception $e) {
            error_log("Error sincronizando partidos para $date: " . $e->getMessage());
            $failedDays++;
            // Continuar con el siguiente día aunque falle uno
        }
        
        // Pequeña pausa para no saturar la API (excepto en el último)
        if ($index < $totalDays - 1) {
            usleep(150000); // 0.15 segundos
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
    $allMatches = $uniqueMatches;
    
    if (empty($allMatches)) {
        echo json_encode([
            'status' => 'ok', 
            'message' => "No hay partidos disponibles para las fechas consultadas (hoy + próximos 14 días). Días exitosos: $successfulDays, fallidos: $failedDays. Verifica los filtros de ligas en config.php"
        ]);
        return;
    }
    
    $inserted = 0;
    $updated = 0;
    
    foreach ($allMatches as $match) {
        $stmt = $pdo->prepare('SELECT id FROM matches WHERE api_match_id = ?');
        $stmt->execute([$match['api_match_id']]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            $stmt = $pdo->prepare('
                UPDATE matches 
                SET home_team = ?, away_team = ?, home_score = ?, away_score = ?, 
                    status = ?, match_date = ?, competition = ?
                WHERE api_match_id = ?
            ');
            $stmt->execute([
                $match['home_team'], $match['away_team'], $match['home_score'],
                $match['away_score'], $match['status'], $match['match_date'],
                $match['competition'], $match['api_match_id']
            ]);
            $updated++;
        } else {
            $stmt = $pdo->prepare('
                INSERT INTO matches 
                (api_match_id, home_team, away_team, home_score, away_score, status, match_date, competition, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                $match['api_match_id'], $match['home_team'], $match['away_team'],
                $match['home_score'], $match['away_score'], $match['status'],
                $match['match_date'], $match['competition'], date('Y-m-d H:i:s')
            ]);
            $inserted++;
        }
    }
    
    echo json_encode([
        'status' => 'ok', 
        'message' => "Sincronizados $inserted partidos nuevos y actualizados $updated partidos existentes"
    ]);
}

/**
 * Obtiene partidos desde la API de API-Football para una fecha específica
 * Filtra por ligas permitidas y excluye ligas secundarias/juveniles
 */
function fetchMatchesFromAPI($date) {
    require_once __DIR__ . '/config.php';
    
    $url = API_FOOTBALL_BASE_URL . '/fixtures?date=' . $date;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15); // Reducido a 15 segundos
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'x-rapidapi-key: ' . API_FOOTBALL_KEY,
        'x-rapidapi-host: v3.football.api-sports.io'
    ]);

    // Ajustes de compatibilidad para hosting
    if (defined('CURL_VERIFY_SSL')) {
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, CURL_VERIFY_SSL);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, CURL_VERIFY_SSL ? 2 : 0);
    }
    if (defined('CURL_FORCE_IPV4') && CURL_FORCE_IPV4) {
        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        error_log("API-Football cURL error para $date: $curlError");
        throw new Exception("Error de conexión: $curlError");
    }
    
    if ($httpCode === 429) {
        error_log("API-Football: Límite de requests excedido (429)");
        throw new Exception('Límite de requests diario excedido. Intenta mañana.');
    }
    
    if ($httpCode === 401 || $httpCode === 403) {
        error_log("API-Football: Error de autenticación ($httpCode)");
        throw new Exception('Error de autenticación con API-Football. Verifica tu API key.');
    }
    
    if ($httpCode !== 200) {
        error_log("API-Football HTTP error para $date: $httpCode - $response");
        throw new Exception("Error HTTP $httpCode de la API");
    }
    
    if (empty($response)) {
        error_log("API-Football: Respuesta vacía para $date");
        return [];
    }
    
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("API-Football JSON error para $date: " . json_last_error_msg());
        throw new Exception('Error al procesar respuesta de la API');
    }
    
    if (!isset($data['response'])) {
        return [];
    }
    
    if (!is_array($data['response'])) {
        return [];
    }
    
    $matches = [];
    $allowedLeagues = defined('ALLOWED_LEAGUES') ? ALLOWED_LEAGUES : [];
    
    foreach ($data['response'] as $fixture) {
        // Validar estructura de datos
        if (!isset($fixture['fixture']['id']) || 
            !isset($fixture['teams']['home']['name']) || 
            !isset($fixture['teams']['away']['name'])) {
            continue; // Saltar partidos con datos incompletos
        }
        
        // Filtrar por ligas permitidas (nombre y país)
        $leagueName = $fixture['league']['name'] ?? '';
        $leagueCountry = $fixture['league']['country'] ?? '';
        $competitionFull = ($leagueName . ' - ' . $leagueCountry);
        
        // Verificar exclusiones primero
        $excludedPatterns = defined('EXCLUDED_LEAGUE_PATTERNS') ? EXCLUDED_LEAGUE_PATTERNS : [];
        if (!empty($excludedPatterns)) {
            foreach ($excludedPatterns as $excluded) {
                if (stripos($competitionFull, $excluded) !== false || 
                    stripos($leagueName, $excluded) !== false) {
                    continue 2; // Saltar este partido (continue al foreach exterior)
                }
            }
        }
        
        // Verificar ligas permitidas
        if (!empty($allowedLeagues)) {
            $leagueAllowed = false;
            foreach ($allowedLeagues as $allowedLeagueName => $allowedCountry) {
                // Si el país está vacío (competiciones internacionales), solo verificar el nombre
                if (empty($allowedCountry)) {
                    // Para Champions League y Europa League, verificar que no sea una variante no deseada
                    if (stripos($leagueName, $allowedLeagueName) !== false) {
                        // Verificar exclusiones específicas para competiciones internacionales
                        $isExcluded = false;
                        $excludedVariants = ['Women', 'AFC', 'CAF', 'CONCACAF', 'Youth', 'Reserve', 'B Team'];
                        foreach ($excludedVariants as $variant) {
                            if (stripos($leagueName, $variant) !== false || stripos($competitionFull, $variant) !== false) {
                                $isExcluded = true;
                                break;
                            }
                        }
                        if (!$isExcluded) {
                            $leagueAllowed = true;
                            break;
                        }
                    }
                } else {
                    // Verificar que coincida el nombre de la liga Y el país
                    if (stripos($leagueName, $allowedLeagueName) !== false && 
                        stripos($leagueCountry, $allowedCountry) !== false) {
                        $leagueAllowed = true;
                        break;
                    }
                }
            }
            if (!$leagueAllowed) {
                // Solo loggear si parece ser una liga importante (para debugging)
                // Esto ayuda a identificar si estamos filtrando incorrectamente
                $importantKeywords = ['Premier', 'Liga', 'Serie', 'Bundesliga', 'Ligue', 'Champions', 'Europa', 'Libertadores', 'Argentina'];
                $shouldLog = false;
                foreach ($importantKeywords as $keyword) {
                    if (stripos($leagueName, $keyword) !== false) {
                        $shouldLog = true;
                        break;
                    }
                }
                if ($shouldLog) {
                    error_log("Partido filtrado (posible error) - Liga: $leagueName, País: $leagueCountry, Fecha: $date");
                }
                continue; // Saltar partidos de ligas no permitidas
            }
        }
        
        // Mapear estado de la API a nuestro formato
        $status = mapStatus($fixture['fixture']['status']['short'] ?? 'NS');
        
        // Obtener fecha del partido
        $matchTimestamp = $fixture['fixture']['timestamp'] ?? null;
        if ($matchTimestamp) {
            $matchDate = date('Y-m-d H:i:s', $matchTimestamp);
        } else {
            // Si no hay timestamp, usar la fecha del parámetro de la función
            $matchDate = $date . ' 20:00:00'; // Hora por defecto
        }
        
        // Solo incluir partidos que no sean muy antiguos (más de 30 días)
        $matchDateTime = strtotime($matchDate);
        $thirtyDaysAgo = strtotime('-30 days');
        
        if ($matchDateTime < $thirtyDaysAgo) {
            continue; // Saltar partidos muy antiguos
        }
        
        $matches[] = [
            'api_match_id' => (string)$fixture['fixture']['id'],
            'home_team' => $fixture['teams']['home']['name'],
            'away_team' => $fixture['teams']['away']['name'],
            'home_score' => isset($fixture['goals']['home']) && $fixture['goals']['home'] !== null ? (int)$fixture['goals']['home'] : null,
            'away_score' => isset($fixture['goals']['away']) && $fixture['goals']['away'] !== null ? (int)$fixture['goals']['away'] : null,
            'status' => $status,
            'match_date' => $matchDate,
            'competition' => (isset($fixture['league']['name']) ? $fixture['league']['name'] : 'Liga') . 
                           (isset($fixture['league']['country']) ? ' - ' . $fixture['league']['country'] : '')
        ];
    }
    
    return $matches;
}

/**
 * Sincroniza partidos antiguos (últimos 7 días, excluyendo hoy)
 */
function handleSyncMatchesHistory() {
    require_once __DIR__ . '/config.php';
    
    if (!function_exists('curl_init')) {
        throw new Exception('cURL no está disponible en este servidor');
    }
    
    $pdo = getConnection();
    $allMatches = [];
    
    // Últimos 7 días (ayer hacia atrás)
    $daysToFetch = [];
    for ($i = 1; $i <= 7; $i++) {
        $daysToFetch[] = date('Y-m-d', strtotime("-$i days"));
    }
    
    $successfulDays = 0;
    $failedDays = 0;
    
    foreach ($daysToFetch as $index => $date) {
        try {
            $matches = fetchMatchesFromAPI($date);
            if (is_array($matches) && !empty($matches)) {
                $allMatches = array_merge($allMatches, $matches);
                $successfulDays++;
                error_log("Sincronización histórica exitosa para $date: " . count($matches) . " partidos encontrados");
            } else {
                error_log("No se encontraron partidos históricos para $date");
            }
        } catch (Exception $e) {
            error_log("Error sincronizando partidos históricos para $date: " . $e->getMessage());
            $failedDays++;
        }
        
        if ($index < count($daysToFetch) - 1) {
            usleep(150000); // 0.15 segundos
        }
    }
    
    // Deduplicar
    $uniqueMatches = [];
    $seenIds = [];
    foreach ($allMatches as $match) {
        $matchId = $match['api_match_id'];
        if (!isset($seenIds[$matchId])) {
            $seenIds[$matchId] = true;
            $uniqueMatches[] = $match;
        }
    }
    $allMatches = $uniqueMatches;
    
    if (empty($allMatches)) {
        echo json_encode([
            'status' => 'ok', 
            'message' => "No hay partidos históricos disponibles (últimos 7 días). Días consultados: 7, exitosos: $successfulDays, fallidos: $failedDays. Verifica los filtros de ligas en config.php"
        ]);
        return;
    }
    
    $inserted = 0;
    $updated = 0;
    
    foreach ($allMatches as $match) {
        $stmt = $pdo->prepare('SELECT id FROM matches WHERE api_match_id = ?');
        $stmt->execute([$match['api_match_id']]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            $stmt = $pdo->prepare('
                UPDATE matches 
                SET home_team = ?, away_team = ?, home_score = ?, away_score = ?, 
                    status = ?, match_date = ?, competition = ?
                WHERE api_match_id = ?
            ');
            $stmt->execute([
                $match['home_team'], $match['away_team'], $match['home_score'],
                $match['away_score'], $match['status'], $match['match_date'],
                $match['competition'], $match['api_match_id']
            ]);
            $updated++;
        } else {
            $stmt = $pdo->prepare('
                INSERT INTO matches 
                (api_match_id, home_team, away_team, home_score, away_score, status, match_date, competition, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                $match['api_match_id'], $match['home_team'], $match['away_team'],
                $match['home_score'], $match['away_score'], $match['status'],
                $match['match_date'], $match['competition'], date('Y-m-d H:i:s')
            ]);
            $inserted++;
        }
    }
    
    echo json_encode([
        'status' => 'ok', 
        'message' => "Sincronizados $inserted partidos históricos nuevos y actualizados $updated existentes (últimos 7 días)"
    ]);
}

/**
 * Mapea el estado de la API a nuestro formato interno
 */
function mapStatus($apiStatus) {
    $statusMap = [
        'FT' => 'FINISHED',
        'NS' => 'SCHEDULED',
        'LIVE' => 'LIVE',
        'HT' => 'LIVE',
        '1H' => 'LIVE',
        '2H' => 'LIVE',
        'ET' => 'LIVE',
        'P' => 'LIVE',
        'PEN' => 'LIVE',
        'SUSP' => 'SCHEDULED',
        'INT' => 'SCHEDULED',
        'CANC' => 'SCHEDULED',
        'ABAN' => 'SCHEDULED',
        'AWD' => 'FINISHED',
        'WO' => 'FINISHED'
    ];
    
    return $statusMap[$apiStatus] ?? 'SCHEDULED';
}

/**
 * Obtiene las últimas 9 noticias de fútbol desde ESPN
 * Intenta primero con simplexml_load_file, luego con cURL como respaldo
 */
function handleGetNews() {
    require_once __DIR__ . '/config.php';
    
    $news = [];
    
    // Intentar obtener noticias
    try {
        $news = fetchNewsFromESPN();
    } catch (Exception $e) {
        error_log("Error obteniendo noticias: " . $e->getMessage());
        try {
            $news = fetchNewsFromESPNWithCurl();
        } catch (Exception $e2) {
            error_log("Error en método alternativo: " . $e2->getMessage());
        }
    }
    
    // Eliminar duplicados y asegurar datos completos
    $uniqueNews = [];
    $seenUrls = [];
    $placeholderImage = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop';
    
    foreach ($news as $article) {
        $url = $article['url'] ?? '';
        if (empty($url) || isset($seenUrls[$url])) {
            continue;
        }
        
        $seenUrls[$url] = true;
        
        // Asegurar descripción (nunca null)
        if (empty($article['description'])) {
            $article['description'] = $article['title'] ?? 'Noticia de fútbol';
        }
        
        // Asegurar imagen (placeholder si no hay)
        if (empty($article['image'])) {
            $article['image'] = $placeholderImage;
        }
        
        $uniqueNews[] = $article;
        if (count($uniqueNews) >= 9) {
            break;
        }
    }
    
    echo json_encode(['status' => 'ok', 'news' => $uniqueNews]);
}

/**
 * Obtiene noticias desde feeds RSS de ESPN
 * Prioriza el feed en español, luego el inglés
 */
function fetchNewsFromESPN() {
    $rssUrlEs = 'https://www.espndeportes.com/rss/noticias.xml';
    $rssUrlEn = 'https://www.espn.com/espn/rss/soccer/news';
    $placeholderImage = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop';
    $news = [];
    $seenUrls = [];
    
    // Intentar feed en español
    $rss = @simplexml_load_file($rssUrlEs);
    if ($rss !== false && isset($rss->channel->item)) {
        $news = parseRSSItems($rss->channel->item, $seenUrls, $placeholderImage);
    }
    
    // Si no hay suficientes, intentar feed en inglés
    if (count($news) < 9) {
        $rss = @simplexml_load_file($rssUrlEn);
        if ($rss !== false && isset($rss->channel->item)) {
            $additionalNews = parseRSSItems($rss->channel->item, $seenUrls, $placeholderImage);
            $news = array_merge($news, $additionalNews);
        }
    }

    if (empty($news)) {
        throw new Exception('No se pudieron obtener noticias de ESPN (simplexml)');
    }

    return array_slice($news, 0, 9);
}

/**
 * Procesa items RSS y los convierte en array de noticias
 */
function parseRSSItems($items, &$seenUrls, $placeholderImage) {
    $news = [];
    
    foreach ($items as $item) {
        $title = (string) $item->title;
        $link = (string) $item->link;
        
        if (empty($title) || empty($link) || isset($seenUrls[$link])) {
            continue;
        }
        
        $seenUrls[$link] = true;
        $description = (string) $item->description;
        $pubDate = (string) $item->pubDate;
        $image = extractImageFromRSSItem($item, $description, $link);
        $cleanDesc = cleanDescription($description);
        
        if (empty($cleanDesc)) {
            $cleanDesc = $title;
        }
        if (empty($image)) {
            $image = $placeholderImage;
        }
        
        $news[] = [
            'title' => $title,
            'description' => $cleanDesc,
            'image' => $image,
            'url' => $link,
            'publishedAt' => $pubDate ? date('c', strtotime($pubDate)) : date('c')
        ];
        
        if (count($news) >= 9) {
            break;
        }
    }
    
    return $news;
}

/**
 * Extrae la imagen de un item RSS usando múltiples métodos
 */
function extractImageFromRSSItem($item, $description, $url = '') {
    // Método 1: Media namespace (media:content)
    if (isset($item->children('media', true)->content)) {
        $mediaContent = $item->children('media', true)->content;
        if (isset($mediaContent->attributes()->url)) {
            $imageUrl = (string) $mediaContent->attributes()->url;
            if (!empty($imageUrl)) {
                return $imageUrl;
            }
        }
    }
    
    // Método 2: Enclosure
    if (isset($item->enclosure)) {
        $enclosureType = (string) $item->enclosure['type'];
        if (strpos($enclosureType, 'image') !== false) {
            $enclosureUrl = (string) $item->enclosure['url'];
            if (!empty($enclosureUrl)) {
                return $enclosureUrl;
            }
        }
    }
    
    // Método 3: Extraer del HTML de la descripción
    if (!empty($description)) {
        if (preg_match('/<img[^>]+src=["\']([^"\']+)["\'][^>]*>/i', $description, $matches)) {
            if (!empty($matches[1])) {
                return $matches[1];
            }
        }
        if (preg_match('/background-image:\s*url\(["\']?([^"\']+)["\']?\)/i', $description, $matches)) {
            if (!empty($matches[1])) {
                return $matches[1];
            }
        }
    }
    
    // Método 4: Intentar obtener desde meta tags de la URL
    if (!empty($url)) {
        $image = tryGetImageFromURL($url);
        if (!empty($image)) {
            return $image;
        }
    }
    
    return '';
}

/**
 * Intenta obtener la imagen desde meta tags (og:image o twitter:image) de una URL
 */
function tryGetImageFromURL($url) {
    try {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 5,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTPHEADER => [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            ]
        ]);
        
        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200 && !empty($html)) {
            if (preg_match('/<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']/i', $html, $matches)) {
                return $matches[1];
            }
            if (preg_match('/<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']/i', $html, $matches)) {
                return $matches[1];
            }
        }
    } catch (Exception $e) {
        // Silenciar errores
    }
    
    return '';
}

/**
 * Limpia y formatea la descripción de una noticia
 * Elimina HTML, normaliza espacios y limita a 200 caracteres
 */
function cleanDescription($description) {
    if (empty($description)) {
        return '';
    }
    
    $clean = strip_tags($description);
    $clean = preg_replace('/\s+/', ' ', $clean);
    $clean = trim($clean);
    
    if (strlen($clean) > 200) {
        $clean = substr($clean, 0, 197) . '...';
    }
    
    return $clean;
}

/**
 * Obtiene noticias usando cURL (método alternativo cuando simplexml_load_file falla)
 */
function fetchNewsFromESPNWithCurl() {
    $rssUrlEs = 'https://www.espndeportes.com/rss/noticias.xml';
    $rssUrlEn = 'https://www.espn.com/espn/rss/soccer/news';
    $placeholderImage = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop';
    $news = [];
    $seenUrls = [];
    
    // Intentar feed en español con cURL
    $rss = fetchRSSWithCurl($rssUrlEs);
    if ($rss !== false && isset($rss->channel->item)) {
        $news = parseRSSItems($rss->channel->item, $seenUrls, $placeholderImage);
    }
    
    // Si no hay suficientes, intentar feed en inglés
    if (count($news) < 9) {
        $rss = fetchRSSWithCurl($rssUrlEn);
        if ($rss !== false && isset($rss->channel->item)) {
            $additionalNews = parseRSSItems($rss->channel->item, $seenUrls, $placeholderImage);
            $news = array_merge($news, $additionalNews);
        }
    }
    
    if (empty($news)) {
        throw new Exception("No se pudieron obtener noticias de ESPN");
    }
    
    return array_slice($news, 0, 9);
}

/**
 * Obtiene un feed RSS usando cURL
 */
function fetchRSSWithCurl($url) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTPHEADER => [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        ]
    ]);

    if (defined('CURL_VERIFY_SSL')) {
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, CURL_VERIFY_SSL);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, CURL_VERIFY_SSL ? 2 : 0);
    }
    if (defined('CURL_FORCE_IPV4') && CURL_FORCE_IPV4) {
        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        error_log("RSS cURL error for $url: $curlError");
    }

    if ($httpCode === 200 && !empty($response)) {
        return @simplexml_load_string($response);
    }
    
    return false;
}



/**
 * Obtiene todos los comentarios de un partido específico
 * Optimizado: solo selecciona columnas necesarias y limita resultados
 */
function handleGetComments($matchId) {
    if (!$matchId) {
        throw new Exception('ID de partido requerido');
    }
    
    $pdo = getConnection();
    // Optimización: seleccionar solo columnas necesarias, usar INNER JOIN explícito y limitar resultados
    // Los índices en match_id y created_at aceleran esta consulta
    // Incluir datos del perfil del usuario para mostrar en comentarios, incluyendo karma
    $stmt = $pdo->prepare('
        SELECT c.id, c.match_id, c.user_id, c.content, c.created_at, 
               u.username, u.profile_picture, u.nationality, u.display_name, u.favorite_team, u.karma
        FROM comments c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.match_id = ?
        ORDER BY c.created_at DESC
        LIMIT 100
    ');
    $stmt->execute([$matchId]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['status' => 'ok', 'comments' => $comments]);
}

/**
 * Crea un nuevo comentario en un partido (requiere autenticación)
 */
function handleCreateComment($input) {
    $user = getCurrentUser();
    if (!$user || !isset($user['user_id'])) {
        http_response_code(401);
        throw new Exception('Autenticación requerida');
    }
    
    $matchId = $input['match_id'] ?? null;
    $content = trim($input['content'] ?? '');
    
    if (!$matchId || empty($content)) {
        throw new Exception('match_id y content son requeridos');
    }
    
    // Validar que el partido existe
    $pdo = getConnection();
    $stmt = $pdo->prepare('SELECT id FROM matches WHERE id = ?');
    $stmt->execute([$matchId]);
    if (!$stmt->fetch()) {
        throw new Exception('Partido no encontrado');
    }
    
    // Insertar comentario
    $stmt = $pdo->prepare('INSERT INTO comments (match_id, user_id, content, created_at) VALUES (?, ?, ?, ?)');
    $stmt->execute([$matchId, $user['user_id'], $content, date('Y-m-d H:i:s')]);
    
    $commentId = $pdo->lastInsertId();
    
    // Retornar el comentario creado con el username y datos del perfil, incluyendo karma
    $stmt = $pdo->prepare('
        SELECT c.id, c.match_id, c.user_id, c.content, c.created_at, 
               u.username, u.profile_picture, u.nationality, u.display_name, u.favorite_team, u.karma
        FROM comments c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
    ');
    $stmt->execute([$commentId]);
    $comment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'ok', 
        'message' => 'Comentario creado',
        'comment' => $comment
    ]);
}

/**
 * Obtiene el perfil del usuario autenticado
 */
function handleGetProfile() {
    $user = getCurrentUser();
    if (!$user || !isset($user['user_id'])) {
        http_response_code(401);
        throw new Exception('Autenticación requerida');
    }
    
    $pdo = getConnection();
    $stmt = $pdo->prepare('
        SELECT id, username, email, profile_picture, nationality, display_name, favorite_team, karma, created_at 
        FROM users 
        WHERE id = ?
    ');
    $stmt->execute([$user['user_id']]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$profile) {
        throw new Exception('Usuario no encontrado');
    }
    
    echo json_encode(['status' => 'ok', 'profile' => $profile]);
}

/**
 * Actualiza el perfil del usuario autenticado
 */
function handleUpdateProfile($input) {
    $user = getCurrentUser();
    if (!$user || !isset($user['user_id'])) {
        http_response_code(401);
        throw new Exception('Autenticación requerida');
    }
    
    $pdo = getConnection();
    
    // Campos permitidos para actualizar
    $allowedFields = ['profile_picture', 'nationality', 'display_name', 'favorite_team'];
    $updates = [];
    $params = [];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $updates[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
    
    if (empty($updates)) {
        throw new Exception('No hay campos para actualizar');
    }
    
    $params[] = $user['user_id'];
    $sql = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Retornar el perfil actualizado
    $stmt = $pdo->prepare('
        SELECT id, username, email, profile_picture, nationality, display_name, favorite_team, karma, created_at 
        FROM users 
        WHERE id = ?
    ');
    $stmt->execute([$user['user_id']]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode(['status' => 'ok', 'message' => 'Perfil actualizado', 'profile' => $profile]);
}

/**
 * Vota un comentario (positivo o negativo) y actualiza el karma del usuario
 */
function handleVote($input) {
    $user = getCurrentUser();
    if (!$user || !isset($user['user_id'])) {
        http_response_code(401);
        throw new Exception('Autenticación requerida');
    }
    
    $commentId = $input['comment_id'] ?? null;
    $voteType = $input['vote_type'] ?? null; // 'up' o 'down'
    
    if (!$commentId || !in_array($voteType, ['up', 'down'])) {
        throw new Exception('comment_id y vote_type (up/down) son requeridos');
    }
    
    $pdo = getConnection();
    
    // Verificar que el comentario existe y obtener el user_id del autor
    $stmt = $pdo->prepare('SELECT user_id FROM comments WHERE id = ?');
    $stmt->execute([$commentId]);
    $comment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$comment) {
        throw new Exception('Comentario no encontrado');
    }
    
    // No permitir votar tu propio comentario
    if ($comment['user_id'] == $user['user_id']) {
        throw new Exception('No puedes votar tu propio comentario');
    }
    
    // Verificar si ya existe un voto de este usuario para este comentario
    $stmt = $pdo->prepare('SELECT id, vote_type FROM votes WHERE comment_id = ? AND user_id = ?');
    $stmt->execute([$commentId, $user['user_id']]);
    $existingVote = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $authorUserId = $comment['user_id'];
    $karmaChange = 0;
    
    if ($existingVote) {
        // Si ya votó, actualizar el voto
        if ($existingVote['vote_type'] === $voteType) {
            // Si vota lo mismo, eliminar el voto (toggle)
            $stmt = $pdo->prepare('DELETE FROM votes WHERE id = ?');
            $stmt->execute([$existingVote['id']]);
            
            // Revertir el karma
            $karmaChange = ($voteType === 'up') ? -1 : 1;
        } else {
            // Cambiar el voto
            $stmt = $pdo->prepare('UPDATE votes SET vote_type = ? WHERE id = ?');
            $stmt->execute([$voteType, $existingVote['id']]);
            
            // Ajustar karma: si cambia de up a down, -2; si cambia de down a up, +2
            $karmaChange = ($voteType === 'up') ? 2 : -2;
        }
    } else {
        // Nuevo voto
        $stmt = $pdo->prepare('INSERT INTO votes (comment_id, user_id, vote_type, created_at) VALUES (?, ?, ?, ?)');
        $stmt->execute([$commentId, $user['user_id'], $voteType, date('Y-m-d H:i:s')]);
        
        // Aplicar karma
        $karmaChange = ($voteType === 'up') ? 1 : -1;
    }
    
    // Actualizar karma del autor del comentario
    if ($karmaChange !== 0) {
        $stmt = $pdo->prepare('UPDATE users SET karma = karma + ? WHERE id = ?');
        $stmt->execute([$karmaChange, $authorUserId]);
    }
    
    // Obtener los nuevos contadores de votos
    $stmt = $pdo->prepare('
        SELECT 
            COUNT(CASE WHEN vote_type = "up" THEN 1 END) as upvotes,
            COUNT(CASE WHEN vote_type = "down" THEN 1 END) as downvotes,
            SUM(CASE WHEN vote_type = "up" THEN 1 WHEN vote_type = "down" THEN -1 ELSE 0 END) as score
        FROM votes 
        WHERE comment_id = ?
    ');
    $stmt->execute([$commentId]);
    $voteCounts = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verificar si el usuario actual votó este comentario
    $stmt = $pdo->prepare('SELECT vote_type FROM votes WHERE comment_id = ? AND user_id = ?');
    $stmt->execute([$commentId, $user['user_id']]);
    $userVote = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'ok',
        'message' => 'Voto registrado',
        'upvotes' => (int)($voteCounts['upvotes'] ?? 0),
        'downvotes' => (int)($voteCounts['downvotes'] ?? 0),
        'score' => (int)($voteCounts['score'] ?? 0),
        'user_vote' => $userVote ? $userVote['vote_type'] : null
    ]);
}

/**
 * Obtiene los votos de un comentario específico
 */
function handleGetCommentVotes($commentId) {
    if (!$commentId) {
        throw new Exception('comment_id es requerido');
    }
    
    $pdo = getConnection();
    
    // Obtener contadores de votos
    $stmt = $pdo->prepare('
        SELECT 
            COUNT(CASE WHEN vote_type = "up" THEN 1 END) as upvotes,
            COUNT(CASE WHEN vote_type = "down" THEN 1 END) as downvotes,
            SUM(CASE WHEN vote_type = "up" THEN 1 WHEN vote_type = "down" THEN -1 ELSE 0 END) as score
        FROM votes 
        WHERE comment_id = ?
    ');
    $stmt->execute([$commentId]);
    $voteCounts = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Si hay usuario autenticado, obtener su voto
    $userVote = null;
    $user = getCurrentUser();
    if ($user && isset($user['user_id'])) {
        $stmt = $pdo->prepare('SELECT vote_type FROM votes WHERE comment_id = ? AND user_id = ?');
        $stmt->execute([$commentId, $user['user_id']]);
        $vote = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($vote) {
            $userVote = $vote['vote_type'];
        }
    }
    
    echo json_encode([
        'status' => 'ok',
        'upvotes' => (int)($voteCounts['upvotes'] ?? 0),
        'downvotes' => (int)($voteCounts['downvotes'] ?? 0),
        'score' => (int)($voteCounts['score'] ?? 0),
        'user_vote' => $userVote
    ]);
}

/**
 * Obtiene el perfil público de un usuario (solo lectura)
 */
function handleGetPublicProfile($userId) {
    if (!$userId) {
        throw new Exception('user_id es requerido');
    }
    
    $pdo = getConnection();
    $stmt = $pdo->prepare('
        SELECT id, username, profile_picture, nationality, display_name, favorite_team, karma, created_at 
        FROM users 
        WHERE id = ?
    ');
    $stmt->execute([$userId]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$profile) {
        throw new Exception('Usuario no encontrado');
    }
    
    // No incluir email por seguridad
    unset($profile['email']);
    
    echo json_encode(['status' => 'ok', 'profile' => $profile]);
}

/**
 * Verifica si el usuario actual es administrador
 */
function isAdmin() {
    $user = getCurrentUser();
    if (!$user || !isset($user['user_id'])) {
        return false;
    }
    
    $pdo = getConnection();
    $stmt = $pdo->prepare('SELECT role FROM users WHERE id = ?');
    $stmt->execute([$user['user_id']]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    return $result && $result['role'] === 'admin';
}

/**
 * Obtiene la lista de todos los usuarios (solo admin)
 */
function handleAdminGetUsers() {
    if (!isAdmin()) {
        http_response_code(403);
        throw new Exception('Acceso denegado. Se requieren permisos de administrador');
    }
    
    $pdo = getConnection();
    $stmt = $pdo->query('
        SELECT id, username, email, role, profile_picture, nationality, display_name, favorite_team, karma, created_at 
        FROM users 
        ORDER BY created_at DESC
    ');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['status' => 'ok', 'users' => $users]);
}

/**
 * Crea un nuevo usuario (solo admin)
 */
function handleAdminCreateUser($input) {
    if (!isAdmin()) {
        http_response_code(403);
        throw new Exception('Acceso denegado. Se requieren permisos de administrador');
    }
    
    $pdo = getConnection();
    
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    $email = $input['email'] ?? '';
    $role = $input['role'] ?? 'user';
    
    if (empty($username) || empty($password)) {
        throw new Exception('Username y password son requeridos');
    }
    
    if (!in_array($role, ['user', 'admin'])) {
        throw new Exception('Rol inválido. Debe ser "user" o "admin"');
    }
    
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        throw new Exception('El usuario ya existe');
    }
    
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (username, password_hash, email, role, created_at) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$username, $passwordHash, $email, $role, date('Y-m-d H:i:s')]);
    
    $userId = $pdo->lastInsertId();
    
    // Retornar el usuario creado
    $stmt = $pdo->prepare('SELECT id, username, email, role, profile_picture, nationality, display_name, favorite_team, karma, created_at FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode(['status' => 'ok', 'message' => 'Usuario creado correctamente', 'user' => $user]);
}

/**
 * Actualiza un usuario (solo admin)
 */
function handleAdminUpdateUser($input) {
    if (!isAdmin()) {
        http_response_code(403);
        throw new Exception('Acceso denegado. Se requieren permisos de administrador');
    }
    
    $userId = $input['id'] ?? null;
    if (!$userId) {
        throw new Exception('ID de usuario es requerido');
    }
    
    $pdo = getConnection();
    
    // Campos permitidos para actualizar
    $allowedFields = ['username', 'email', 'role', 'profile_picture', 'nationality', 'display_name', 'favorite_team'];
    $updates = [];
    $params = [];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            if ($field === 'role' && !in_array($input[$field], ['user', 'admin'])) {
                throw new Exception('Rol inválido. Debe ser "user" o "admin"');
            }
            $updates[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
    
    if (empty($updates)) {
        throw new Exception('No hay campos para actualizar');
    }
    
    $params[] = $userId;
    $sql = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Retornar el usuario actualizado
    $stmt = $pdo->prepare('SELECT id, username, email, role, profile_picture, nationality, display_name, favorite_team, karma, created_at FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode(['status' => 'ok', 'message' => 'Usuario actualizado correctamente', 'user' => $user]);
}

/**
 * Elimina un usuario (solo admin)
 */
function handleAdminDeleteUser($userId) {
    if (!isAdmin()) {
        http_response_code(403);
        throw new Exception('Acceso denegado. Se requieren permisos de administrador');
    }
    
    if (!$userId) {
        throw new Exception('user_id es requerido');
    }
    
    $pdo = getConnection();
    
    // No permitir eliminar el propio usuario
    $user = getCurrentUser();
    if ($user && $user['user_id'] == $userId) {
        throw new Exception('No puedes eliminar tu propio usuario');
    }
    
    $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    
    echo json_encode(['status' => 'ok', 'message' => 'Usuario eliminado correctamente']);
}

/**
 * Obtiene la lista de todos los comentarios (solo admin)
 */
function handleAdminGetComments() {
    if (!isAdmin()) {
        http_response_code(403);
        throw new Exception('Acceso denegado. Se requieren permisos de administrador');
    }
    
    $pdo = getConnection();
    $stmt = $pdo->query('
        SELECT c.id, c.match_id, c.user_id, c.content, c.created_at,
               u.username, u.display_name,
               m.home_team, m.away_team, m.match_date
        FROM comments c
        INNER JOIN users u ON c.user_id = u.id
        LEFT JOIN matches m ON c.match_id = m.id
        ORDER BY c.created_at DESC
        LIMIT 500
    ');
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['status' => 'ok', 'comments' => $comments]);
}

/**
 * Elimina un comentario (solo admin)
 */
function handleAdminDeleteComment($commentId) {
    if (!isAdmin()) {
        http_response_code(403);
        throw new Exception('Acceso denegado. Se requieren permisos de administrador');
    }
    
    if (!$commentId) {
        throw new Exception('comment_id es requerido');
    }
    
    $pdo = getConnection();
    $stmt = $pdo->prepare('DELETE FROM comments WHERE id = ?');
    $stmt->execute([$commentId]);
    
    echo json_encode(['status' => 'ok', 'message' => 'Comentario eliminado correctamente']);
}

/**
 * Verifica si el usuario actual es administrador
 */
function handleCheckAdmin() {
    $isAdmin = isAdmin();
    echo json_encode(['status' => 'ok', 'isAdmin' => $isAdmin]);
}

/**
 * Busca usuarios en el sistema
 */
function handleSearchUsers($query) {
    if (empty($query) || strlen($query) < 2) {
        echo json_encode(['status' => 'ok', 'users' => []]);
        return;
    }
    
    $pdo = getConnection();
    // Búsqueda case-insensitive en username y display_name
    $searchTerm = '%' . $query . '%';
    $stmt = $pdo->prepare('
        SELECT id, username, profile_picture, nationality, display_name, favorite_team, karma, created_at 
        FROM users 
        WHERE LOWER(username) LIKE LOWER(?) OR LOWER(display_name) LIKE LOWER(?)
        ORDER BY username ASC
        LIMIT 20
    ');
    $stmt->execute([$searchTerm, $searchTerm]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // No incluir emails por seguridad
    foreach ($users as &$user) {
        unset($user['email']);
    }
    
    echo json_encode(['status' => 'ok', 'users' => $users]);
}

/**
 * Genera comentarios ficticios contextualizados para los partidos
 */
function handleGenerateFakeComments() {
    // Verificar que el usuario sea administrador
    if (!isAdmin()) {
        http_response_code(403);
        throw new Exception('Acceso denegado. Se requieren permisos de administrador');
    }
    
    $pdo = getConnection();
    
    // Usuarios ficticios con diferentes perfiles
    $fakeUsers = [
        ['username' => 'FutbolFan2024', 'display_name' => 'Carlos M.', 'nationality' => 'Argentina', 'favorite_team' => 'Boca Juniors'],
        ['username' => 'PremierLover', 'display_name' => 'James W.', 'nationality' => 'England', 'favorite_team' => 'Manchester United'],
        ['username' => 'LaLigaExpert', 'display_name' => 'María G.', 'nationality' => 'Spain', 'favorite_team' => 'Real Madrid'],
        ['username' => 'BundesligaFan', 'display_name' => 'Klaus H.', 'nationality' => 'Germany', 'favorite_team' => 'Bayern Munich'],
        ['username' => 'SerieA_Italia', 'display_name' => 'Marco R.', 'nationality' => 'Italy', 'favorite_team' => 'Juventus'],
        ['username' => 'FutbolAnalitico', 'display_name' => 'Ana L.', 'nationality' => 'Brazil', 'favorite_team' => 'Flamengo'],
        ['username' => 'SoccerPassion', 'display_name' => 'Diego S.', 'nationality' => 'Argentina', 'favorite_team' => 'River Plate'],
        ['username' => 'PremierLeagueUK', 'display_name' => 'David T.', 'nationality' => 'England', 'favorite_team' => 'Liverpool'],
        ['username' => 'ElClasicoFan', 'display_name' => 'Sergio M.', 'nationality' => 'Spain', 'favorite_team' => 'Barcelona'],
        ['username' => 'FutbolTotal', 'display_name' => 'Roberto F.', 'nationality' => 'Mexico', 'favorite_team' => 'Chivas'],
        ['username' => 'FootballGuru', 'display_name' => 'Alex K.', 'nationality' => 'France', 'favorite_team' => 'Paris Saint-Germain'],
        ['username' => 'SoccerWorld', 'display_name' => 'Luis P.', 'nationality' => 'Colombia', 'favorite_team' => 'Atlético Nacional'],
    ];
    
    // Plantillas de comentarios por tipo
    $commentTemplates = [
        'positive_home' => [
            '¡Increíble partido de {home_team}! Demostraron su calidad hoy.',
            '{home_team} jugó a otro nivel. Merecida victoria.',
            'Qué manera de jugar de {home_team}. Se nota la diferencia de nivel.',
            'Impresionante {home_team}. Siguen demostrando por qué son grandes.',
            '{home_team} fue superior en todos los aspectos. Bien merecido.',
        ],
        'positive_away' => [
            'Gran partido de {away_team}. Jugaron muy bien de visitante.',
            '{away_team} demostró carácter. Buena actuación.',
            'Me encantó ver jugar a {away_team} así. Muy buen fútbol.',
            '{away_team} se llevó bien el partido. Merecido resultado.',
            'Excelente nivel de {away_team}. Se nota el trabajo del técnico.',
        ],
        'negative_home' => [
            '{home_team} no estuvo a la altura hoy. Muy flojo.',
            'Qué decepción {home_team}. Esperaba mucho más.',
            '{home_team} jugó muy mal. No se puede perder así.',
            'Muy pobre el rendimiento de {home_team}. Tienen que mejorar.',
            '{home_team} no mostró nada. Partido para olvidar.',
        ],
        'negative_away' => [
            '{away_team} no aprovechó sus oportunidades. Muy mal.',
            'Qué partido más pobre de {away_team}. No dieron la talla.',
            '{away_team} decepcionó. Esperaba mucho más de ellos.',
            'Muy flojo {away_team}. Tienen que replantearse muchas cosas.',
            '{away_team} no estuvo a la altura. Partido para olvidar.',
        ],
        'analytical' => [
            'El partido se definió en el medio campo. {home_team} controló mejor el ritmo.',
            'La clave fue la presión alta de {home_team}. No dejaron respirar a {away_team}.',
            'Se notó la diferencia táctica. {home_team} fue más ordenado.',
            'El partido cambió en el segundo tiempo. {home_team} supo aprovechar mejor.',
            'La velocidad de transición de {home_team} fue determinante.',
            '{away_team} tuvo las oportunidades pero no las concretó. Eso fue la diferencia.',
        ],
        'emotional' => [
            '¡Qué partidazo! {home_team} vs {away_team} siempre da espectáculo.',
            'Increíble cómo terminó. {home_team} se llevó los tres puntos en el último minuto.',
            'No me lo puedo creer. {home_team} remontó de manera épica.',
            '¡Qué emoción! Este partido tenía de todo. {home_team} fue superior.',
            'Partido de infarto. {home_team} y {away_team} dieron todo.',
        ],
        'comparison' => [
            '{home_team} demostró que es mejor equipo que {away_team} hoy.',
            'La diferencia de calidad entre {home_team} y {away_team} se notó.',
            '{home_team} jugó como equipo grande. {away_team} todavía le falta.',
            'Se vio la jerarquía. {home_team} es muy superior a {away_team}.',
        ],
        'result_based' => [
            'Con este resultado, {home_team} se consolida en la tabla.',
            '{away_team} necesitaba estos puntos. Mala derrota.',
            'Este triunfo le da aire a {home_team} en la competencia.',
            '{away_team} se complica con este resultado. Tienen que reaccionar.',
        ],
        'neutral' => [
            'Buen partido en general. {home_team} y {away_team} dieron pelea.',
            'Partido equilibrado. {home_team} supo aprovechar mejor sus chances.',
            'Se notó que ambos equipos venían de partidos duros. Partido parejo.',
            'Buen espectáculo. {home_team} y {away_team} mostraron buen nivel.',
        ],
    ];
    
    // Obtener todos los partidos
    $stmt = $pdo->query('SELECT id, home_team, away_team, home_score, away_score, status, competition FROM matches ORDER BY match_date DESC LIMIT 50');
    $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($matches)) {
        throw new Exception('No hay partidos en la base de datos');
    }
    
    $createdUsers = [];
    $createdComments = 0;
    
    // Crear usuarios ficticios si no existen
    foreach ($fakeUsers as $userData) {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
        $stmt->execute([$userData['username']]);
        $existing = $stmt->fetch();
        
        if (!$existing) {
            $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('
                INSERT INTO users (username, password_hash, display_name, nationality, favorite_team, created_at) 
                VALUES (?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                $userData['username'],
                $passwordHash,
                $userData['display_name'],
                $userData['nationality'],
                $userData['favorite_team'],
                date('Y-m-d H:i:s', strtotime('-' . rand(30, 180) . ' days'))
            ]);
            $userId = $pdo->lastInsertId();
            $createdUsers[] = $userId;
        } else {
            $createdUsers[] = $existing['id'];
        }
    }
    
    // Obtener todos los IDs de usuarios (ficticios y reales)
    $stmt = $pdo->query('SELECT id, favorite_team FROM users');
    $allUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Generar comentarios para cada partido
    foreach ($matches as $match) {
        $homeTeam = $match['home_team'];
        $awayTeam = $match['away_team'];
        $homeScore = $match['home_score'];
        $awayScore = $match['away_score'];
        $status = $match['status'];
        $matchId = $match['id'];
        
        // Determinar cuántos comentarios generar (entre 3 y 8 por partido)
        $numComments = rand(3, 8);
        
        // Seleccionar usuarios aleatorios
        $selectedUsers = array_rand($allUsers, min($numComments, count($allUsers)));
        if (!is_array($selectedUsers)) {
            $selectedUsers = [$selectedUsers];
        }
        
        for ($i = 0; $i < $numComments; $i++) {
            $user = $allUsers[$selectedUsers[$i % count($selectedUsers)]];
            $userFavoriteTeam = $user['favorite_team'] ?? '';
            
            // Determinar tipo de comentario según el contexto
            $commentType = determineFakeCommentType($homeTeam, $awayTeam, $homeScore, $awayScore, $userFavoriteTeam, $status);
            
            // Seleccionar plantilla
            $templates = $commentTemplates[$commentType] ?? $commentTemplates['neutral'];
            $template = $templates[array_rand($templates)];
            
            // Reemplazar placeholders
            $content = str_replace(['{home_team}', '{away_team}'], [$homeTeam, $awayTeam], $template);
            
            // Agregar variaciones según el resultado
            if ($homeScore !== null && $awayScore !== null) {
                $scoreComment = generateFakeScoreComment($homeTeam, $awayTeam, $homeScore, $awayScore, $userFavoriteTeam);
                if ($scoreComment && rand(0, 1)) {
                    $content = $scoreComment . ' ' . $content;
                }
            }
            
            // Agregar emojis ocasionalmente
            if (rand(0, 3) === 0) {
                $emojis = ['⚽', '🔥', '💪', '👏', '🎯', '⚡'];
                $content .= ' ' . $emojis[array_rand($emojis)];
            }
            
            // Fecha aleatoria dentro de las últimas 2 semanas
            $daysAgo = rand(0, 14);
            $hoursAgo = rand(0, 23);
            $minutesAgo = rand(0, 59);
            $createdAt = date('Y-m-d H:i:s', strtotime("-$daysAgo days -$hoursAgo hours -$minutesAgo minutes"));
            
            // Insertar comentario
            $stmt = $pdo->prepare('INSERT INTO comments (match_id, user_id, content, created_at) VALUES (?, ?, ?, ?)');
            $stmt->execute([$matchId, $user['id'], $content, $createdAt]);
            $createdComments++;
        }
    }
    
    echo json_encode([
        'status' => 'ok',
        'message' => "Comentarios generados exitosamente",
        'users_created' => count($createdUsers),
        'comments_created' => $createdComments,
        'matches_processed' => count($matches)
    ]);
}

/**
 * Determina el tipo de comentario según el contexto (para comentarios ficticios)
 */
function determineFakeCommentType($homeTeam, $awayTeam, $homeScore, $awayScore, $userFavoriteTeam, $status) {
    // Si el partido no ha terminado
    if ($status !== 'FINISHED' && $homeScore === null) {
        $types = ['neutral', 'emotional', 'analytical'];
        return $types[array_rand($types)];
    }
    
    // Si el usuario es fan del equipo local
    if (stripos($homeTeam, $userFavoriteTeam) !== false || 
        stripos($userFavoriteTeam, $homeTeam) !== false) {
        if ($homeScore !== null && $awayScore !== null) {
            if ($homeScore > $awayScore) {
                return rand(0, 1) ? 'positive_home' : 'emotional';
            } else {
                return 'negative_home';
            }
        }
        return 'positive_home';
    }
    
    // Si el usuario es fan del equipo visitante
    if (stripos($awayTeam, $userFavoriteTeam) !== false || 
        stripos($userFavoriteTeam, $awayTeam) !== false) {
        if ($homeScore !== null && $awayScore !== null) {
            if ($awayScore > $homeScore) {
                return rand(0, 1) ? 'positive_away' : 'emotional';
            } else {
                return 'negative_away';
            }
        }
        return 'positive_away';
    }
    
    // Comentario neutral o analítico
    if ($homeScore !== null && $awayScore !== null) {
        $types = ['analytical', 'comparison', 'result_based', 'neutral'];
        return $types[array_rand($types)];
    }
    
    return 'neutral';
}

/**
 * Genera un comentario específico sobre el resultado (para comentarios ficticios)
 */
function generateFakeScoreComment($homeTeam, $awayTeam, $homeScore, $awayScore, $userFavoriteTeam) {
    $scoreDiff = abs($homeScore - $awayScore);
    
    // Victoria del local
    if ($homeScore > $awayScore) {
        if ($scoreDiff >= 3) {
            return "Goleada histórica de $homeTeam. $homeScore-$awayScore es un resultado demoledor.";
        } elseif ($scoreDiff == 2) {
            return "Victoria contundente de $homeTeam por $homeScore-$awayScore.";
        } else {
            return "Triunfo ajustado de $homeTeam $homeScore-$awayScore.";
        }
    }
    
    // Victoria del visitante
    if ($awayScore > $homeScore) {
        if ($scoreDiff >= 3) {
            return "Goleada de $awayTeam. $homeScore-$awayScore, partido para olvidar para $homeTeam.";
        } elseif ($scoreDiff == 2) {
            return "$awayTeam se impuso $homeScore-$awayScore. Buena victoria visitante.";
        } else {
            return "Victoria ajustada de $awayTeam $homeScore-$awayScore.";
        }
    }
    
    // Empate
    if ($homeScore == $awayScore) {
        if ($homeScore >= 2) {
            return "Empate a $homeScore. Partido con muchos goles y emociones.";
        } else {
            return "Empate $homeScore-$awayScore. Partido cerrado y defensivo.";
        }
    }
    
    return null;
}
