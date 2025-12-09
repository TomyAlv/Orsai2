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

# Copiar archivos de la aplicación (desde el contexto actual al WORKDIR)
COPY . .

# Crear directorio para base de datos con permisos
RUN mkdir -p /app/db && chmod 777 /app/db

# Copiar y hacer ejecutable el script de inicio
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Exponer puerto (Railway lo asigna automáticamente)
EXPOSE 8080

# Comando de inicio usando el script
CMD ["/app/start.sh"]

