<?php
/**
 * Script para verificar el rol de un usuario
 * Uso: http://localhost/orsai/api/check_user_role.php?username=TomyAvz
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
    
    echo json_encode([
        'status' => 'ok',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
            'isAdmin' => $user['role'] === 'admin'
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}






