<?php
/**
 * Script para agregar campos de perfil a la tabla users
 * Ejecutar una vez para actualizar la estructura de la base de datos
 */
require_once __DIR__ . '/db.php';

try {
    $pdo = getConnection();
    
    // Verificar si las columnas ya existen antes de agregarlas
    $columns = $pdo->query("PRAGMA table_info(users)")->fetchAll(PDO::FETCH_ASSOC);
    $existingColumns = array_column($columns, 'name');
    
    // Agregar campos de perfil si no existen
    if (!in_array('profile_picture', $existingColumns)) {
        $pdo->exec("ALTER TABLE users ADD COLUMN profile_picture TEXT");
    }
    
    if (!in_array('nationality', $existingColumns)) {
        $pdo->exec("ALTER TABLE users ADD COLUMN nationality TEXT");
    }
    
    if (!in_array('display_name', $existingColumns)) {
        $pdo->exec("ALTER TABLE users ADD COLUMN display_name TEXT");
    }
    
    if (!in_array('favorite_team', $existingColumns)) {
        $pdo->exec("ALTER TABLE users ADD COLUMN favorite_team TEXT");
    }
    
    echo "OK - Tabla users actualizada correctamente\n";
    echo "Campos de perfil agregados: profile_picture, nationality, display_name, favorite_team\n";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}






