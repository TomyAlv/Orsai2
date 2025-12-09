/**
 * Utilidades para formateo de fechas
 * Centraliza todas las funciones de formateo de fechas para mantener consistencia
 * Todas las fechas se muestran en horario de Argentina (America/Argentina/Buenos_Aires, UTC-3)
 */
export class DateUtil {
  /**
   * Formatea una fecha completa con hora en horario de Argentina (ej: "15 de enero de 2024, 20:30")
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formatea solo la fecha sin hora en horario de Argentina (ej: "15 de enero de 2024")
   */
  static formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatea solo la hora en horario de Argentina (ej: "20:30")
   */
  static formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

