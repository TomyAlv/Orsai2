<?php
/**
 * ============================================
 * CONFIGURACIÓN DE LA APLICACIÓN ORSAI
 * ============================================
 */

// Base de datos SQLite
define('DB_PATH', __DIR__ . '/../db/orsai.sqlite');

// Credenciales de administrador por defecto
define('ADMIN_DEFAULT_USER', 'admin');
define('ADMIN_DEFAULT_PASS', 'admin123');

// Configuración de API-Football (para obtener partidos)
define('API_FOOTBALL_KEY', 'acba994d75337c0c2d55700e2f785c50');
define('API_FOOTBALL_BASE_URL', 'https://v3.football.api-sports.io');

// Configuración de ESPN (para noticias de fútbol)
define('ESPN_BASE_URL', 'https://site.api.espn.com');

// Configuración de cURL para entornos de hosting con certificados/SNI limitados
// En algunos servidores compartidos las conexiones HTTPS externas fallan si se
// verifica el certificado. Se desactiva la verificación para garantizar que
// las APIs externas respondan (API-Football y feeds de ESPN).
define('CURL_VERIFY_SSL', false);
define('CURL_FORCE_IPV4', true);

/**
 * Ligas permitidas - formato: ['nombre_liga' => 'país']
 * Se usa para filtrar partidos en fetchMatchesFromAPI()
 * Solo las 5 ligas principales de Europa, Liga Argentina y copas internacionales
 */
define('ALLOWED_LEAGUES', [
    // Las 5 ligas principales de Europa
    'Premier League' => 'England',
    'La Liga' => 'Spain',
    'Primera Division' => 'Spain', // Algunas veces aparece así
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

/**
 * Patrones de ligas permitidas (formato: "Nombre Liga - País")
 * Se usa para filtrar partidos en handleGetMatches()
 * Solo las 5 ligas principales de Europa, Liga Argentina y copas internacionales
 */
define('ALLOWED_LEAGUE_PATTERNS', [
    // Las 5 ligas principales de Europa
    'Premier League',
    'La Liga',
    'Primera Division',
    'Serie A',
    'Bundesliga',
    'Ligue 1',
    // Liga Argentina
    'Liga Profesional',
    'Liga Profesional Argentina',
    // Copas internacionales
    'Champions League',
    'UEFA Champions League',
    'Europa League',
    'UEFA Europa League',
    'Copa Libertadores'
]);

/**
 * Patrones de ligas a excluir (ligas secundarias, juveniles, variantes no deseadas, etc.)
 */
define('EXCLUDED_LEAGUE_PATTERNS', [
    // Ligas juveniles
    'U19', 'U20', 'U21',
    // Ligas secundarias
    '2. Bundesliga',
    'Segunda',
    'Championship',
    'Ligue 2',
    'Serie B',
    'Primera B',
    // Variantes de Champions League no deseadas
    'Women', // Excluir Champions League de mujeres
    'AFC', // Excluir Champions League de Asia/África
    'CAF', // Excluir Champions League de África
    'CONCACAF', // Excluir Champions League de CONCACAF
    'CONMEBOL', // Excluir variantes de CONMEBOL que no sean Copa Libertadores
    'Youth', // Excluir ligas juveniles
    'Reserve', // Excluir ligas de reserva
    'B Team' // Excluir equipos B
]);

// Configuración de timezone (Argentina GMT-3)
date_default_timezone_set('America/Argentina/Buenos_Aires');

// Configuración de errores (solo para desarrollo)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
