/**
 * Utilidades para partidos de fútbol
 * Centraliza funciones relacionadas con el estado y formato de partidos
 */
export class MatchUtil {
  /**
   * Convierte el estado del partido a texto en español
   */
  static getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'FINISHED': 'Finalizado',
      'SCHEDULED': 'Programado',
      'LIVE': 'En Vivo'
    };
    return statusMap[status] || status;
  }

  /**
   * Retorna la clase CSS de Bootstrap para el badge según el estado
   */
  static getStatusBadgeClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'FINISHED': 'bg-secondary',
      'SCHEDULED': 'bg-primary',
      'LIVE': 'bg-danger'
    };
    return classMap[status] || 'bg-secondary';
  }
}

