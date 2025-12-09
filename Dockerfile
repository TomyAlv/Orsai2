# Dockerfile para Render - Backend PHP
# Este Dockerfile está en la raíz para que Render lo detecte automáticamente
# y apunta a la carpeta api/

FROM php:8.2-cli

# Instalar dependencias del sistema necesarias para SQLite y Node.js
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar Node.js 20.x para compilar el frontend
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Instalar extensiones necesarias de PHP
RUN docker-php-ext-install pdo pdo_sqlite

# Crear directorio para la aplicación
WORKDIR /app

# Copiar todo el repositorio primero (necesario para submódulos)
COPY . .

# Inicializar submódulos si existen
RUN if [ -f .gitmodules ]; then \
        git submodule update --init --recursive || true; \
    fi

# Copiar archivos de la API al directorio de trabajo
RUN cp -r api/* . || true

# Compilar el frontend
RUN if [ -d frontend ] && [ -f frontend/package.json ]; then \
        cd frontend && \
        npm install && \
        npm run build -- --configuration=development && \
        cd ..; \
    else \
        echo "Frontend no encontrado o no es un directorio válido"; \
    fi

# Crear directorio para base de datos con permisos
RUN mkdir -p /app/db && chmod 777 /app/db

# Copiar y hacer ejecutable el script de inicio
COPY api/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Exponer puerto (Render lo asigna automáticamente)
EXPOSE 8080

# Comando de inicio usando el script
CMD ["/bin/bash", "/app/start.sh"]

