#!/bin/bash
# Script para compilar el frontend y preparar para deployment
# Ejecutar antes de hacer commit y push a GitHub

echo "🔨 Compilando frontend..."
cd frontend
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend compilado correctamente"
    echo "📦 Los archivos están en frontend/dist/frontend/browser/"
    echo "🚀 Ahora puedes hacer commit y push a GitHub"
    echo "💡 Render usará estos archivos compilados al construir la imagen Docker"
else
    echo "❌ Error al compilar el frontend"
    exit 1
fi

