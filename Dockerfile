# Dockerfile para Render - Backend PHP
# Este Dockerfile está en la raíz para que Render lo detecte automáticamente
# y apunta a la carpeta api/

FROM php:8.2-cli

# Instalar dependencias del sistema necesarias para SQLite
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar extensiones necesarias de PHP
RUN docker-php-ext-install pdo pdo_sqlite

# Crear directorio para la aplicación
WORKDIR /app

# Copiar archivos de la API
COPY api/ .

# Crear directorio para base de datos con permisos
RUN mkdir -p /app/db && chmod 777 /app/db

# Copiar y hacer ejecutable el script de inicio
COPY api/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Exponer puerto (Render lo asigna automáticamente)
EXPOSE 8080

# Comando de inicio usando el script
CMD ["/bin/bash", "/app/start.sh"]

