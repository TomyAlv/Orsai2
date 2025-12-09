# Dockerfile para Render - Backend PHP
# Este Dockerfile está en la raíz para que Render lo detecte automáticamente

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

# Copiar todo el contexto del repositorio (incluyendo .git si existe)
COPY . .

# IMPORTANTE: Si frontend es un submódulo, Render necesita inicializarlo
# Render clona el repositorio, pero los submódulos no se inicializan automáticamente
# Intentar inicializar submódulos si .git existe
RUN if [ -d .git ]; then \
        echo "Repositorio Git detectado, intentando inicializar submódulos..."; \
        git submodule update --init --recursive 2>&1 || \
        echo "Advertencia: No se pudieron inicializar submódulos (esto es normal si Render no tiene acceso)"; \
    fi

# Verificar estructura del proyecto
RUN echo "=== Verificando estructura del proyecto ===" && \
    echo "Contenido del directorio raíz:" && \
    ls -la && \
    echo "" && \
    echo "=== Verificando frontend ===" && \
    if [ -d frontend ]; then \
        echo "✓ Directorio frontend encontrado"; \
        echo "Contenido de frontend/:" && \
        ls -la frontend/ | head -20; \
        echo ""; \
        if [ -f frontend/package.json ]; then \
            echo "✓ package.json encontrado en frontend/"; \
        else \
            echo "✗ ERROR: package.json NO encontrado en frontend/"; \
            echo "Esto puede deberse a que frontend es un submódulo no inicializado"; \
            echo "Solución: Asegúrate de que frontend esté en el repositorio como directorio normal"; \
            exit 1; \
        fi; \
    else \
        echo "✗ ERROR: Directorio frontend no encontrado"; \
        exit 1; \
    fi

# Compilar el frontend
RUN echo "=== Compilando frontend ===" && \
    cd frontend && \
    echo "Instalando dependencias de npm..." && \
    npm install && \
    echo "Compilando aplicación..." && \
    npm run build -- --configuration=development && \
    cd .. && \
    echo "✓ Frontend compilado exitosamente"

# Mover archivos de la API al directorio raíz (para que index.php los encuentre)
RUN echo "=== Configurando estructura de archivos ===" && \
    if [ -d api ]; then \
        cp -r api/* . 2>/dev/null || true; \
        echo "✓ Archivos de API copiados"; \
    fi

# Crear directorio para base de datos con permisos
RUN mkdir -p /app/db && chmod 777 /app/db

# Copiar y hacer ejecutable el script de inicio
RUN if [ -f api/start.sh ]; then \
        cp api/start.sh /app/start.sh && \
        chmod +x /app/start.sh && \
        echo "✓ Script de inicio configurado"; \
    fi

# Exponer puerto (Render lo asigna automáticamente)
EXPOSE 8080

# Comando de inicio usando el script
CMD ["/bin/bash", "/app/start.sh"]
