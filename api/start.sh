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

# Obtener el puerto de la variable de entorno o usar 8080 por defecto
PORT=${PORT:-8080}

# Verificar que PORT es un número
if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo "ERROR: PORT debe ser un número, recibido: $PORT"
    exit 1
fi

# Iniciar servidor PHP
echo "Iniciando servidor PHP desde: $(pwd)"
echo "Puerto: $PORT"
echo "Archivos en /app:"
ls -la

exec php -S 0.0.0.0:"$PORT" -t . index.php

