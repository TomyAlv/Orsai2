#!/bin/bash
# Script de inicio para Railway
# Asegura que el servidor PHP se inicie desde el directorio correcto

cd /app || exit 1

# Verificar que index.php existe
if [ ! -f "index.php" ]; then
    echo "ERROR: index.php no encontrado en /app"
    ls -la /app
    exit 1
fi

# Iniciar servidor PHP
echo "Iniciando servidor PHP desde: $(pwd)"
echo "Archivos en /app:"
ls -la

php -S 0.0.0.0:${PORT:-8080} -t . index.php

