<?php
/**
 * Bootstrap seguro para crear/ascender un usuario a administrador.
 *
 * Uso recomendado (cámbia el token antes de ejecutar):
 *   https://tu-dominio/api/ensure_admin.php?token=ORSAl-secure-20251210&username=TomyAvz&password=tomas123
 *
 * Después de ejecutarlo una vez con éxito, elimina este archivo del servidor.
 */

require_once __DIR__ . '/db.php';

// Cambia este token antes de usarlo en producción
const ENSURE_ADMIN_TOKEN = 'ORSAI-secure-20251210';

header('Content-Type: application/json');

try {
    $token = $_GET['token'] ?? '';
    if (empty($token) || $token !== ENSURE_ADMIN_TOKEN) {
        http_response_code(403);
        throw new Exception('Token inválido');
    }

    $username = trim($_GET['username'] ?? 'TomyAvz');
    $password = $_GET['password'] ?? 'tomas123';
    $email = trim($_GET['email'] ?? '');

    if (empty($username) || empty($password)) {
        throw new Exception('username y password son requeridos');
    }

    $pdo = getConnection();

    // Buscar usuario (case-insensitive)
    $stmt = $pdo->prepare('SELECT id, username, role FROM users WHERE LOWER(username) = LOWER(?)');
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Actualizar password (opcional) y rol admin
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('UPDATE users SET password_hash = ?, role = ? WHERE id = ?');
        $stmt->execute([$passwordHash, 'admin', $user['id']]);

        echo json_encode([
            'status' => 'ok',
            'message' => "Usuario '{$user['username']}' actualizado a admin",
            'user_id' => $user['id']
        ]);
        exit;
    }

    // Crear usuario nuevo como admin
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (username, password_hash, email, role, created_at) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$username, $passwordHash, $email, 'admin', date('Y-m-d H:i:s')]);
    $newId = $pdo->lastInsertId();

    echo json_encode([
        'status' => 'ok',
        'message' => "Usuario '$username' creado como admin",
        'user_id' => $newId
    ]);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage()
    ]);
}


