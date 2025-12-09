import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { UserSearchComponent } from '../user-search/user-search.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, UserSearchComponent],
  template: `
    <div class="login-container">
      <div class="container">
        <!-- Barra de búsqueda de usuarios -->
        <div class="search-bar-top mb-3">
          <div class="row">
            <div class="col-12 d-flex justify-content-end">
              <app-user-search></app-user-search>
            </div>
          </div>
        </div>
        
        <div class="row justify-content-center align-items-center min-vh-100">
          <div class="col-md-6 col-lg-5">
            <div class="login-card">
              <div class="login-header text-center mb-4">
                <div class="login-icon mb-3">⚽</div>
                <h2 class="fw-bold">Bienvenido a Orsai</h2>
                <p class="text-muted">Inicia sesión para continuar</p>
              </div>
              
              <div *ngIf="error" class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
                <button type="button" class="btn-close" (click)="error = ''"></button>
              </div>

              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="username" class="form-label">
                    <i class="bi bi-person me-2"></i>Usuario
                  </label>
                  <input
                    type="text"
                    class="form-control form-control-lg"
                    id="username"
                    [(ngModel)]="username"
                    name="username"
                    placeholder="Ingresa tu usuario"
                    required
                  />
                </div>

                <div class="mb-4">
                  <label for="password" class="form-label">
                    <i class="bi bi-lock me-2"></i>Contraseña
                  </label>
                  <input
                    type="password"
                    class="form-control form-control-lg"
                    id="password"
                    [(ngModel)]="password"
                    name="password"
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                </div>

                <button type="submit" class="btn btn-primary btn-lg w-100 mb-3" [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i *ngIf="!loading" class="bi bi-box-arrow-in-right me-2"></i>
                  {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
                </button>
              </form>

              <div class="text-center">
                <p class="text-muted mb-0">
                  ¿No tienes cuenta? 
                  <a routerLink="/register" class="text-primary fw-bold text-decoration-none">
                    Regístrate aquí
                  </a>
                </p>
                <a routerLink="/" class="btn btn-link text-muted mt-3">
                  <i class="bi bi-arrow-left me-1"></i>Volver al inicio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Barra de búsqueda top */
    .search-bar-top {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom: none;
      padding: 0.5rem 0;
    }
    :host-context(body.dark-theme) .search-bar-top {
      background-color: #121212;
      border-bottom: 1px solid #333;
    }
    
    .login-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem 0;
    }
    .login-card {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }
    .login-icon {
      font-size: 4rem;
      animation: bounce 2s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .login-header h2 {
      color: #333;
    }
    .form-control-lg {
      border-radius: 10px;
      border: 2px solid #e9ecef;
      transition: border-color 0.3s;
    }
    .form-control-lg:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
    
    /* Modo Oscuro - Login */
    :host-context(body.dark-theme) .login-card {
      background-color: #2d2d2d;
      color: #e0e0e0;
    }
    :host-context(body.dark-theme) .login-header h2 {
      color: #e0e0e0;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.error = '';
    this.loading = true;

    this.authService.login(this.username, this.password)
      .then(() => {
        this.router.navigate(['/matches']);
      })
      .catch((err) => {
        this.error = err.error?.error || 'Error al iniciar sesión';
        this.loading = false;
      });
  }
}
