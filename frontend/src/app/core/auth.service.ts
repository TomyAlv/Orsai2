/**
 * Servicio de autenticación
 * Maneja el login, registro, logout y verificación de autenticación
 * Compatible con Server-Side Rendering (SSR)
 */
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from './api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  /**
   * Obtiene localStorage de forma segura (compatible con SSR)
   */
  private getLocalStorage(): Storage | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage;
    }
    return null;
  }

  isAuthenticated(): boolean {
    const storage = this.getLocalStorage();
    if (!storage) return false;
    return !!storage.getItem('token');
  }

  getToken(): string | null {
    const storage = this.getLocalStorage();
    if (!storage) return null;
    return storage.getItem('token');
  }

  getUser(): { id: number; username: string } | null {
    const storage = this.getLocalStorage();
    if (!storage) return null;
    const userStr = storage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Fuerza la recarga de token/usuario desde localStorage y valida contra el backend.
   */
  refreshSession(): Promise<boolean> {
    const storage = this.getLocalStorage();
    if (!storage) return Promise.resolve(false);
    const token = storage.getItem('token');
    if (!token) return Promise.resolve(false);

    return new Promise((resolve) => {
      this.api.getProfile().subscribe({
        next: (response: any) => {
          if (response?.profile) {
            storage.setItem('user', JSON.stringify({ id: response.profile.id, username: response.profile.username }));
            resolve(true);
          } else {
            this.logout();
            resolve(false);
          }
        },
        error: () => {
          this.logout();
          resolve(false);
        }
      });
    });
  }

  login(username: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.api.login(username, password).subscribe({
        next: (response: any) => {
          if (response.status === 'ok' && response.token) {
            const storage = this.getLocalStorage();
            if (storage) {
              storage.setItem('token', response.token);
              storage.setItem('user', JSON.stringify(response.user));
              // Verificar si es admin después del login
              this.checkAdminStatus();
            }
            resolve(true);
          } else {
            reject(new Error('Error en el login'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  checkAdminStatus(): void {
    // Esta función se llamará después del login para verificar el rol
    // Por ahora, se verifica en cada componente que lo necesite
  }

  register(username: string, password: string, email?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.api.register(username, password, email).subscribe({
        next: (response: any) => {
          if (response.status === 'ok') {
            resolve(true);
          } else {
            reject(new Error('Error en el registro'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  logout(): void {
    const storage = this.getLocalStorage();
    if (storage) {
      storage.removeItem('token');
      storage.removeItem('user');
    }
    this.router.navigate(['/login']);
  }

  // Verificar si el usuario es admin (cacheado en localStorage)
  isAdmin(): boolean {
    const storage = this.getLocalStorage();
    if (!storage) return false;
    return storage.getItem('isAdmin') === 'true';
  }

  setAdminStatus(isAdmin: boolean): void {
    const storage = this.getLocalStorage();
    if (storage) {
      storage.setItem('isAdmin', isAdmin.toString());
    }
  }
}

