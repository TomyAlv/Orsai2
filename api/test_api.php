<?php
/**
 * Script de diagnóstico para verificar problemas con las APIs
 * Acceder a: https://orsai.online/api/test_api.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'php_version' => phpversion(),
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    ],
    'checks' => []
];

// 1. Verificar si allow_url_fopen está habilitado
$results['checks']['allow_url_fopen'] = [
    'enabled' => ini_get('allow_url_fopen'),
    'status' => ini_get('allow_url_fopen') ? 'ok' : 'error',
    'message' => ini_get('allow_url_fopen') ? 'Permite acceso a URLs externas' : 'NO permite acceso a URLs externas (necesario para ESPN)'
];

// 2. Verificar si cURL está disponible
$results['checks']['curl'] = [
    'available' => function_exists('curl_init'),
    'status' => function_exists('curl_init') ? 'ok' : 'error',
    'message' => function_exists('curl_init') ? 'cURL disponible' : 'cURL NO disponible (necesario para APIs externas)'
];

// 3. Verificar si simplexml está disponible
$results['checks']['simplexml'] = [
    'available' => function_exists('simplexml_load_file'),
    'status' => function_exists('simplexml_load_file') ? 'ok' : 'error',
    'message' => function_exists('simplexml_load_file') ? 'SimpleXML disponible' : 'SimpleXML NO disponible (necesario para RSS)'
];

// 4. Probar acceso a ESPN RSS
$results['checks']['espn_rss_access'] = [
    'test_url' => 'https://www.espndeportes.com/rss/noticias.xml',
    'status' => 'testing',
    'message' => 'Probando acceso...'
];

try {
    $testRss = @simplexml_load_file('https://www.espndeportes.com/rss/noticias.xml');
    if ($testRss !== false) {
        $results['checks']['espn_rss_access']['status'] = 'ok';
        $results['checks']['espn_rss_access']['message'] = 'Acceso a ESPN RSS exitoso';
        $results['checks']['espn_rss_access']['items_found'] = isset($testRss->channel->item) ? count($testRss->channel->item) : 0;
    } else {
        $results['checks']['espn_rss_access']['status'] = 'error';
        $results['checks']['espn_rss_access']['message'] = 'No se pudo acceder a ESPN RSS (simplexml_load_file falló)';
    }
} catch (Exception $e) {
    $results['checks']['espn_rss_access']['status'] = 'error';
    $results['checks']['espn_rss_access']['message'] = 'Error: ' . $e->getMessage();
}

// 5. Probar acceso con cURL
$results['checks']['espn_curl_access'] = [
    'test_url' => 'https://www.espndeportes.com/rss/noticias.xml',
    'status' => 'testing',
    'message' => 'Probando acceso con cURL...'
];

if (function_exists('curl_init')) {
    try {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://www.espndeportes.com/rss/noticias.xml');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($httpCode === 200 && !empty($response)) {
            $results['checks']['espn_curl_access']['status'] = 'ok';
            $results['checks']['espn_curl_access']['message'] = 'Acceso a ESPN RSS con cURL exitoso';
            $results['checks']['espn_curl_access']['http_code'] = $httpCode;
        } else {
            $results['checks']['espn_curl_access']['status'] = 'error';
            $results['checks']['espn_curl_access']['message'] = "Error HTTP $httpCode" . ($curlError ? " - $curlError" : '');
            $results['checks']['espn_curl_access']['http_code'] = $httpCode;
        }
    } catch (Exception $e) {
        $results['checks']['espn_curl_access']['status'] = 'error';
        $results['checks']['espn_curl_access']['message'] = 'Error: ' . $e->getMessage();
    }
} else {
    $results['checks']['espn_curl_access']['status'] = 'error';
    $results['checks']['espn_curl_access']['message'] = 'cURL no disponible';
}

// 6. Verificar base de datos
$results['checks']['database'] = [
    'status' => 'testing',
    'message' => 'Verificando base de datos...'
];

$dbPath = __DIR__ . '/../db/orsai.sqlite';
if (file_exists($dbPath)) {
    try {
        $pdo = new PDO('sqlite:' . $dbPath);
        $stmt = $pdo->query('SELECT COUNT(*) as count FROM matches');
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $results['checks']['database']['status'] = 'ok';
        $results['checks']['database']['message'] = 'Base de datos existe y es accesible';
        $results['checks']['database']['matches_count'] = $result['count'] ?? 0;
    } catch (Exception $e) {
        $results['checks']['database']['status'] = 'error';
        $results['checks']['database']['message'] = 'Error accediendo a la BD: ' . $e->getMessage();
    }
} else {
    $results['checks']['database']['status'] = 'error';
    $results['checks']['database']['message'] = 'Base de datos NO existe. Ejecuta: /api/init_db.php';
}

// 7. Verificar permisos de escritura en db/
$dbDir = __DIR__ . '/../db';
$results['checks']['db_permissions'] = [
    'status' => is_writable($dbDir) ? 'ok' : 'error',
    'message' => is_writable($dbDir) ? 'Carpeta db/ tiene permisos de escritura' : 'Carpeta db/ NO tiene permisos de escritura',
    'directory' => $dbDir
];

// Resumen
$totalChecks = count($results['checks']);
$okChecks = 0;
$errorChecks = 0;

foreach ($results['checks'] as $check) {
    if (isset($check['status'])) {
        if ($check['status'] === 'ok') {
            $okChecks++;
        } elseif ($check['status'] === 'error') {
            $errorChecks++;
        }
    }
}

$results['summary'] = [
    'total_checks' => $totalChecks,
    'ok' => $okChecks,
    'errors' => $errorChecks,
    'overall_status' => $errorChecks === 0 ? 'ok' : 'error'
];

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

