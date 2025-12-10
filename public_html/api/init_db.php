<?php
require_once __DIR__ . '/db.php';

try {
    $pdo = getConnection();

    // Tabla usuarios (mínima)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT UNIQUE,
            role TEXT NOT NULL DEFAULT 'user', -- 'user' / 'admin'
            created_at TEXT NOT NULL
        );
    ");

    // Tabla contenidos (mínima)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS contents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            body TEXT,
            file_path TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    ");

    echo "OK - Tablas creadas";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage();
}
