<?php
require_once __DIR__ . '/config.php';

// Clave secreta para JWT (usar variable de entorno en producción)
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'orsai_secret_key_2024_change_in_production');

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function generateJWT($userId, $username) {
    $header = [
        'typ' => 'JWT',
        'alg' => 'HS256'
    ];
    
    $payload = [
        'user_id' => $userId,
        'username' => $username,
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60) // 7 días
    ];
    
    $headerEncoded = base64UrlEncode(json_encode($header));
    $payloadEncoded = base64UrlEncode(json_encode($payload));
    
    $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
    $signatureEncoded = base64UrlEncode($signature);
    
    return "$headerEncoded.$payloadEncoded.$signatureEncoded";
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    
    [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;
    
    $signature = base64UrlDecode($signatureEncoded);
    $expectedSignature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
    
    if (!hash_equals($signature, $expectedSignature)) {
        return null;
    }
    
    $payload = json_decode(base64UrlDecode($payloadEncoded), true);
    
    if ($payload['exp'] < time()) {
        return null;
    }
    
    return $payload;
}

function getCurrentUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    return verifyJWT($token);
}






