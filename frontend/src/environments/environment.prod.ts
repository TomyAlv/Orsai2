export const environment = {
  production: true,
  // En producción, usar variable de entorno o URL del backend desplegado
  // Vercel inyecta variables de entorno en process.env
  apiBaseUrl: (typeof process !== 'undefined' && process.env && process.env['API_BASE_URL']) 
    ? process.env['API_BASE_URL'] 
    : 'https://tu-backend.railway.app/api' // Reemplazar con tu URL de backend real
};
