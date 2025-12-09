#!/bin/bash
# Script de deployment para DonWeb/Ferozo
# Prepara el proyecto para subir a public_html

echo "========================================"
echo "Preparando proyecto para DonWeb/Ferozo"
echo "========================================"
echo ""

# 1. Compilar Angular para producción (solo cliente)
echo "1. Compilando Angular para producción..."
cd frontend
npm install
npm run build -- --configuration production --output-path=dist/browser
if [ $? -ne 0 ]; then
    echo "Error al compilar Angular"
    exit 1
fi
cd ..

# 2. Crear directorio de deployment
echo "2. Creando estructura para public_html..."
DEPLOY_DIR="deploy_public_html"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR/api
mkdir -p $DEPLOY_DIR/db

# 3. Copiar backend PHP
echo "3. Copiando archivos del backend..."
cp -r api/* $DEPLOY_DIR/api/
rm -f $DEPLOY_DIR/api/*.log
rm -f $DEPLOY_DIR/api/*.tmp

# 4. Copiar frontend compilado
echo "4. Copiando frontend compilado..."
if [ -d "frontend/dist/browser" ]; then
    cp -r frontend/dist/browser/* $DEPLOY_DIR/
elif [ -d "frontend/dist/frontend/browser" ]; then
    cp -r frontend/dist/frontend/browser/* $DEPLOY_DIR/
else
    echo "Error: No se encontró el directorio de build de Angular"
    exit 1
fi

# 5. Copiar .htaccess
echo "5. Copiando archivos de configuración..."
cp .htaccess $DEPLOY_DIR/
cp api/.htaccess $DEPLOY_DIR/api/

# 6. Crear .gitkeep para db
touch $DEPLOY_DIR/db/.gitkeep

echo ""
echo "========================================"
echo "¡Preparación completada!"
echo "========================================"
echo ""
echo "Directorio listo para deployment: $DEPLOY_DIR"
echo ""
echo "Próximos pasos:"
echo "1. Revisa el contenido de '$DEPLOY_DIR'"
echo "2. Sube todo el contenido a public_html/ en DonWeb"
echo "3. Ejecuta: https://tudominio.com/api/init_db.php"
echo ""

