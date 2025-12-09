<?php
/**
 * Endpoint para subir foto de perfil
 * Maneja la subida de archivos de imagen y retorna la URL de la imagen guardada
 */
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Verificar autenticación
    $user = getCurrentUser();
    if (!$user || !isset($user['user_id'])) {
        http_response_code(401);
        throw new Exception('Autenticación requerida');
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    if (!isset($_FILES['profile_picture']) || $_FILES['profile_picture']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Error al subir el archivo');
    }

    $file = $_FILES['profile_picture'];
    
    // Validar tipo de archivo
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)');
    }

    // Validar tamaño (máximo 5MB)
    $maxSize = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $maxSize) {
        throw new Exception('El archivo es demasiado grande. Máximo 5MB');
    }

    // Crear directorio de uploads si no existe
    $uploadDir = __DIR__ . '/../uploads/profile_pictures/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Generar nombre único para el archivo
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'user_' . $user['user_id'] . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;

    // Mover el archivo
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        throw new Exception('Error al guardar el archivo');
    }

    // Generar URL relativa
    $url = '/orsai/uploads/profile_pictures/' . $filename;

    // Actualizar el perfil del usuario con la nueva URL
    $pdo = getConnection();
    $stmt = $pdo->prepare('UPDATE users SET profile_picture = ? WHERE id = ?');
    $stmt->execute([$url, $user['user_id']]);

    echo json_encode([
        'status' => 'ok',
        'message' => 'Foto de perfil subida correctamente',
        'url' => $url
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}






