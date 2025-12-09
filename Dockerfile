# Dockerfile para Render - Backend PHP
# Este Dockerfile está en la raíz para que Render lo detecte automáticamente
# y apunta a la carpeta api/

FROM php:8.2-cli

# Instalar dependencias del sistema necesarias para SQLite, Node.js y Git
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Instalar Node.js 20.x para compilar el frontend
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Instalar extensiones necesarias de PHP
RUN docker-php-ext-install pdo pdo_sqlite

# Crear directorio para la aplicación
WORKDIR /app

# Copiar todo el contexto del repositorio
COPY . .

# Instalar Git si no está disponible y verificar estructura
RUN echo "Verificando estructura del proyecto..." && \
    ls -la && \
    echo "Verificando frontend..." && \
    if [ -d frontend ]; then \
        echo "Directorio frontend encontrado"; \
        ls -la frontend/; \
        if [ ! -f frontend/package.json ]; then \
            echo "ERROR: package.json no encontrado en frontend/"; \
            echo "Contenido de frontend/:"; \
            ls -la frontend/; \
            exit 1; \
        fi; \
    else \
        echo "ERROR: Directorio frontend no encontrado"; \
        exit 1; \
    fi

# Compilar el frontend
RUN echo "Compilando frontend..." && \
    cd frontend && \
    npm install && \
    npm run build -- --configuration=development && \
    cd .. && \
    echo "Frontend compilado exitosamente"

# Mover archivos de la API al directorio raíz (para que index.php los encuentre)
RUN cp -r api/* . 2>/dev/null || true

# Crear directorio para base de datos con permisos
RUN mkdir -p /app/db && chmod 777 /app/db

# Copiar y hacer ejecutable el script de inicio
RUN if [ -f api/start.sh ]; then \
        cp api/start.sh /app/start.sh && \
        chmod +x /app/start.sh; \
    fi

# Exponer puerto (Render lo asigna automáticamente)
EXPOSE 8080

# Comando de inicio usando el script
CMD ["/bin/bash", "/app/start.sh"]
