<?php
/**
 * Script de servidor PHP embebido para Railway
 * Este archivo se usa como punto de entrada alternativo
 */

// Configuración de timezone
date_default_timezone_set('America/Argentina/Buenos_Aires');

// Incluir el router principal
require_once __DIR__ . '/index.php';

