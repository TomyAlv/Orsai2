<?php
/**
 * Script para establecer un usuario como administrador
 * Uso: http://localhost/orsai/api/set_admin.php?username=TomyAvz
 */
require_once __DIR__ . '/db.php';

try {
    $username = $_GET['username'] ?? '';
    
    if (empty($username)) {
        throw new Exception('Parámetro username es requerido. Ejemplo: ?username=TomyAvz');
    }
    
    $pdo = getConnection();
    
    // Buscar el usuario (case-insensitive)
    $stmt = $pdo->prepare('SELECT id, username, role FROM users WHERE LOWER(username) = LOWER(?)');
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception("Usuario '$username' no encontrado");
    }
    
    // Actualizar el rol a admin
    $stmt = $pdo->prepare('UPDATE users SET role = ? WHERE id = ?');
    $stmt->execute(['admin', $user['id']]);
    
    echo json_encode([
        'status' => 'ok',
        'message' => "Usuario '{$user['username']}' (ID: {$user['id']}) ahora es administrador",
        'previous_role' => $user['role'],
        'new_role' => 'admin'
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}







