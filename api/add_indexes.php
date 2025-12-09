<?php
/**
 * Script para agregar índices a la base de datos y optimizar consultas
 * Ejecutar una vez para mejorar el rendimiento
 */
require_once __DIR__ . '/db.php';

try {
    $pdo = getConnection();
    
    // Índice en matches.id (ya es PRIMARY KEY, pero lo dejamos por claridad)
    // Índice en matches.api_match_id (ya es UNIQUE, pero SQLite lo maneja automáticamente)
    
    // Índice en comments.match_id para acelerar búsquedas de comentarios por partido
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_comments_match_id ON comments(match_id)");
    
    // Índice en comments.created_at para acelerar ordenamiento por fecha
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC)");
    
    // Índice compuesto para optimizar la consulta de comentarios con JOIN
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_comments_match_created ON comments(match_id, created_at DESC)");
    
    // Índice en users.id (ya es PRIMARY KEY)
    // Índice en users.username (ya es UNIQUE)
    
    echo "OK - Índices creados correctamente\n";
    echo "Las consultas ahora serán más rápidas.\n";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}






