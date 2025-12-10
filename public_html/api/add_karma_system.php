<?php
/**
 * Script para agregar el sistema de karma/votos
 * Ejecutar una vez para crear las tablas y campos necesarios
 */
require_once __DIR__ . '/db.php';

try {
    $pdo = getConnection();
    
    // Verificar si la columna karma ya existe
    $columns = $pdo->query("PRAGMA table_info(users)")->fetchAll(PDO::FETCH_ASSOC);
    $existingColumns = array_column($columns, 'name');
    
    // Agregar campo karma a users si no existe
    if (!in_array('karma', $existingColumns)) {
        $pdo->exec("ALTER TABLE users ADD COLUMN karma INTEGER NOT NULL DEFAULT 0");
    }
    
    // Crear tabla de votos si no existe
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            comment_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            vote_type TEXT NOT NULL CHECK(vote_type IN ('up', 'down')),
            created_at TEXT NOT NULL,
            FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(comment_id, user_id)
        );
    ");
    
    // Crear índices para optimizar consultas
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_votes_comment_id ON votes (comment_id);");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes (user_id);");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_votes_comment_user ON votes (comment_id, user_id);");
    
    echo "OK - Sistema de karma/votos configurado correctamente\n";
    echo "Campo karma agregado a users\n";
    echo "Tabla votes creada con índices\n";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}







