<?php
/**
 * Test simple para verificar PHP y .htaccess
 * Acceder a: https://orsai.online/api/simple_test.php
 */
header('Content-Type: text/plain; charset=utf-8');

echo "=== TEST SIMPLE PHP ===\n\n";
echo "1. PHP está funcionando: ✓\n";
echo "2. Versión de PHP: " . phpversion() . "\n";
echo "3. Servidor: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "\n";
echo "4. Método: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "5. URI: " . $_SERVER['REQUEST_URI'] . "\n";
echo "6. Script: " . $_SERVER['SCRIPT_NAME'] . "\n";
echo "\n=== TEST COMPLETO ===\n";
echo "Si ves este mensaje, PHP está funcionando correctamente.\n";
?>

