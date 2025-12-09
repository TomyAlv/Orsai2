# Dockerfile para Railway - Fuerza uso de PHP
FROM php:8.2-cli

# Instalar dependencias del sistema necesarias para SQLite
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar extensiones necesarias de PHP
RUN docker-php-ext-install pdo pdo_sqlite

# Crear directorio para la aplicación
WORKDIR /app

# Copiar archivos de la aplicación
COPY . /app

# Crear directorio para base de datos con permisos
RUN mkdir -p /app/db && chmod 777 /app/db

# Exponer puerto (Railway lo asigna automáticamente)
EXPOSE 8080

# Comando de inicio
# -t . establece el directorio raíz como el directorio actual (WORKDIR /app)
# index.php actúa como router para todas las peticiones
CMD php -S 0.0.0.0:${PORT:-8080} -t . index.php

