<?php
/**
 * Script de prueba para verificar que Railway puede ejecutar PHP
 * Visita: https://tu-url.railway.app/test_railway.php
 */

header('Content-Type: application/json');

$info = [
    'status' => 'ok',
    'message' => 'PHP está funcionando correctamente en Railway',
    'php_version' => phpversion(),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'port' => $_SERVER['PORT'] ?? 'Not set',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? __DIR__,
    'script_name' => __FILE__,
    'current_dir' => __DIR__,
    'files' => [
        'index.php exists' => file_exists(__DIR__ . '/index.php'),
        'config.php exists' => file_exists(__DIR__ . '/config.php'),
        'db.php exists' => file_exists(__DIR__ . '/db.php'),
        'jwt.php exists' => file_exists(__DIR__ . '/jwt.php'),
    ],
    'extensions' => [
        'pdo' => extension_loaded('pdo'),
        'pdo_sqlite' => extension_loaded('pdo_sqlite'),
        'curl' => extension_loaded('curl'),
        'json' => extension_loaded('json'),
    ],
    'environment' => [
        'API_FOOTBALL_KEY set' => !empty(getenv('API_FOOTBALL_KEY')),
        'JWT_SECRET set' => !empty(getenv('JWT_SECRET')),
        'DB_PATH' => getenv('DB_PATH') ?: 'Not set (using default)',
    ]
];

echo json_encode($info, JSON_PRETTY_PRINT);

