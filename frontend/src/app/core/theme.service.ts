/**
 * Servicio para gestión de temas (modo oscuro/claro)
 * Almacena la preferencia del usuario en localStorage
 */
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private currentTheme$ = new BehaviorSubject<Theme>('light');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Cargar tema guardado o usar el predeterminado
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        this.setTheme(savedTheme);
      } else {
        this.setTheme('light');
      }
    }
  }

  /**
   * Obtiene el tema actual como Observable
   */
  getTheme(): Observable<Theme> {
    return this.currentTheme$.asObservable();
  }

  /**
   * Obtiene el tema actual de forma síncrona
   */
  getCurrentTheme(): Theme {
    return this.currentTheme$.value;
  }

  /**
   * Establece el tema (light o dark)
   */
  setTheme(theme: Theme): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.currentTheme$.next(theme);
    localStorage.setItem('theme', theme);
    
    // Aplicar clase al body
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }

  /**
   * Alterna entre modo claro y oscuro
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme$.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Verifica si el tema actual es oscuro
   */
  isDarkMode(): boolean {
    return this.currentTheme$.value === 'dark';
  }
}






