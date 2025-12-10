<?php
require_once __DIR__ . '/config.php';

function getConnection(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'sqlite:' . DB_PATH;
        $pdo = new PDO($dsn);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    return $pdo;
}
