import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService, Match } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { MatchUtil } from '../../utils/match.util';
import { DateUtil } from '../../utils/date.util';
import { UserSearchComponent } from '../user-search/user-search.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, RouterModule, UserSearchComponent],
  template: `
    <div class="matches-page-wrapper">
      <!-- Barra de búsqueda top -->
      <div class="search-bar-top">
        <div class="container">
          <div class="row">
            <div class="col-12 d-flex justify-content-end py-2">
              <app-user-search></app-user-search>
            </div>
          </div>
        </div>
      </div>

      <!-- Page Header -->
    <div class="page-header bg-primary text-white py-4 mb-4">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h1 class="mb-2">
              <a (click)="navigateToHome()" class="brand-link">
                <span class="brand-icon">⚽</span>
                <span class="brand-name">Orsai</span>
              </a>
            </h1>
            <p class="mb-0 text-white-50">
              <i class="bi bi-chat-dots me-2"></i>Comparte tus opiniones sobre los mejores partidos
            </p>
          </div>
          <div class="d-flex gap-2 align-items-center">
            <button class="btn btn-light btn-sm" (click)="syncMatches()" [disabled]="syncing" style="min-width: 130px;">
              <span *ngIf="syncing" class="spinner-border spinner-border-sm me-2" style="width: 1rem; height: 1rem; border-width: 0.15em;"></span>
              <i *ngIf="!syncing" class="bi bi-arrow-clockwise me-2"></i>
              {{ syncing ? 'Sincronizando...' : 'Sincronizar' }}
            </button>
            <button *ngIf="!showingHistory" class="btn btn-outline-light btn-sm" (click)="loadMatchesHistory()" [disabled]="loadingHistory || syncing" style="min-width: 200px;">
              <span *ngIf="loadingHistory" class="spinner-border spinner-border-sm me-2" style="width: 1rem; height: 1rem; border-width: 0.15em;"></span>
              <i *ngIf="!loadingHistory" class="bi bi-clock-history me-2"></i>
              {{ loadingHistory ? 'Cargando antiguos...' : 'Ver partidos antiguos (30 días)' }}
            </button>
            <button *ngIf="showingHistory" class="btn btn-outline-light btn-sm" (click)="syncMatchesHistory()" [disabled]="syncingHistory" style="min-width: 180px;">
              <span *ngIf="syncingHistory" class="spinner-border spinner-border-sm me-2" style="width: 1rem; height: 1rem; border-width: 0.15em;"></span>
              <i *ngIf="!syncingHistory" class="bi bi-arrow-counterclockwise me-2"></i>
              {{ syncingHistory ? 'Sincronizando...' : 'Sincronizar antiguos' }}
            </button>
            <button *ngIf="showingHistory" class="btn btn-light btn-sm" (click)="loadMatches()" [disabled]="loading" style="min-width: 150px;">
              <i class="bi bi-arrow-left me-2"></i>Volver a actuales
            </button>
            <button *ngIf="!isAuthenticated" class="btn btn-success btn-sm" (click)="navigateToRegister()">
              <i class="bi bi-person-plus me-1"></i>Registrarse
            </button>
            <button *ngIf="!isAuthenticated" class="btn btn-outline-light btn-sm" (click)="navigateToLogin()">
              <i class="bi bi-box-arrow-in-right me-1"></i>Iniciar Sesión
            </button>
            <button *ngIf="isAuthenticated" class="btn btn-info btn-sm" (click)="navigateToProfile()">
              <i class="bi bi-person-circle me-1"></i>Ver Perfil
            </button>
            <button *ngIf="isAuthenticated && isAdmin" class="btn btn-warning btn-sm" (click)="navigateToAdmin()">
              <i class="bi bi-shield-check me-1"></i>Panel Administrador
            </button>
            <button *ngIf="isAuthenticated" class="btn btn-outline-light btn-sm" (click)="logout()">
              <i class="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- Título de la página -->
      <div class="page-title-section mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="fw-bold">
              <i class="bi bi-calendar-event me-2 text-primary"></i>Partidos de Fútbol
            </h2>
            <p class="text-muted">Sigue las mejores ligas del mundo</p>
          </div>
          <div *ngIf="showingHistory" class="alert alert-info mb-0">
            <i class="bi bi-clock-history me-2"></i>Mostrando partidos antiguos (últimos 30 días)
          </div>
        </div>
      </div>

      <!-- Mensajes -->
      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>{{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <div *ngIf="syncMessage" class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle me-2"></i>{{ syncMessage }}
        <button type="button" class="btn-close" (click)="syncMessage = ''"></button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">
          {{ showingHistory 
              ? 'Cargando partidos antiguos (puedes sincronizar si falta información).' 
              : 'Pulsa \"Sincronizar\" para cargar partidos. Si ya sincronizaste, estamos cargando la lista.' }}
        </p>
      </div>

      <!-- Sin partidos -->
      <div *ngIf="!loading && !errorMessage && matches.length === 0" class="text-center py-5">
        <div class="empty-state">
          <i class="bi bi-calendar-x" style="font-size: 4rem; color: #6c757d;"></i>
          <h3 class="mt-3">No hay partidos disponibles</h3>
          <p class="text-muted">Haz clic en "Sincronizar" para cargar partidos de las mejores ligas</p>
          <button class="btn btn-primary btn-lg mt-3" (click)="syncMatches()">
            <i class="bi bi-arrow-clockwise me-2"></i>Sincronizar Partidos
          </button>
        </div>
      </div>

      <!-- Grid de partidos -->
      <div *ngIf="!loading && matches.length > 0" class="row g-4">
        <div *ngFor="let match of matches" class="col-md-6 col-lg-4">
          <div class="card match-card h-100">
            <div class="card-body">
              <!-- Competición -->
              <div class="d-flex justify-content-between align-items-start mb-3">
                <h6 class="card-title text-primary mb-0">
                  <i class="bi bi-trophy me-1"></i>{{ match.competition }}
                </h6>
                <span class="badge" [ngClass]="getStatusBadgeClass(match.status)">
                  {{ getStatusText(match.status) }}
                </span>
              </div>

              <!-- Equipos y resultado -->
              <div class="match-teams mb-3">
                <div class="team-row">
                  <div class="team-name text-end flex-grow-1">
                    <strong>{{ match.home_team }}</strong>
                  </div>
                  <div class="score-section mx-3">
                    <span *ngIf="match.status === 'FINISHED'" class="score">
                      {{ match.home_score ?? 0 }} - {{ match.away_score ?? 0 }}
                    </span>
                    <span *ngIf="match.status !== 'FINISHED'" class="vs-text">vs</span>
                  </div>
                  <div class="team-name text-start flex-grow-1">
                    <strong>{{ match.away_team }}</strong>
                  </div>
                </div>
              </div>

              <!-- Fecha -->
              <div class="text-center mb-3">
                <small class="text-muted">
                  <i class="bi bi-clock me-1"></i>{{ formatDate(match.match_date) }}
                </small>
              </div>

              <!-- Botón ver detalles -->
              <a [routerLink]="['/match', match.id]" class="btn btn-primary w-100">
                <i class="bi bi-eye me-2"></i>Ver Detalles y Comentarios
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .matches-page-wrapper {
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    :host-context(body.dark-theme) .matches-page-wrapper {
      background-color: #121212 !important;
    }
    
    /* Barra de búsqueda top */
    .search-bar-top {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom: none;
    }
    :host-context(body.dark-theme) .search-bar-top {
      background-color: #121212;
      border-bottom: 1px solid #333;
    }
    
    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 0 0 15px 15px;
    }
    .brand-link {
      color: white;
      text-decoration: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: transform 0.2s, color 0.2s;
    }
    .brand-link:hover {
      color: #ffc107;
      transform: scale(1.05);
      text-decoration: none;
    }
    .brand-icon {
      font-size: 2rem;
      animation: bounce 2s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    .brand-name {
      font-size: 2rem;
      font-weight: bold;
    }
    .match-card {
      transition: transform 0.3s, box-shadow 0.3s;
      border: 1px solid #e9ecef;
    }
    .match-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
    .match-teams {
      padding: 1rem 0;
      border-top: 1px solid #e9ecef;
      border-bottom: 1px solid #e9ecef;
    }
    .team-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .team-name {
      font-size: 1.1rem;
    }
    .score {
      font-size: 1.5rem;
      font-weight: bold;
      color: #0d6efd;
    }
    .vs-text {
      color: #6c757d;
      font-size: 1.2rem;
    }
    .empty-state {
      padding: 3rem;
    }
    .page-title-section {
      padding-top: 1rem;
    }
    .page-title-section h2 {
      font-size: 2rem;
      color: #333;
    }
    
    /* Modo Oscuro - Matches */
    :host-context(body.dark-theme) .match-card {
      background-color: #2d2d2d !important;
      color: #e0e0e0 !important;
      border-color: #444 !important;
    }
    :host-context(body.dark-theme) .match-card .card-body {
      background-color: #2d2d2d !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .match-card:hover {
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    }
    :host-context(body.dark-theme) .page-title-section {
      background-color: transparent;
    }
    :host-context(body.dark-theme) .page-title-section h2 {
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .page-title-section p {
      color: #aaa !important;
    }
    :host-context(body.dark-theme) .page-header {
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%) !important;
    }
    :host-context(body.dark-theme) .container {
      background-color: transparent;
    }
    :host-context(body.dark-theme) .empty-state {
      color: #e0e0e0;
      background-color: transparent;
    }
    :host-context(body.dark-theme) .empty-state h3 {
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .empty-state i {
      color: #aaa !important;
    }
    :host-context(body.dark-theme) .card-title {
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .text-primary {
      color: #8b9aff !important;
    }
    :host-context(body.dark-theme) strong {
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .score {
      color: #8b9aff !important;
    }
  `]
})
export class MatchesComponent implements OnInit {
  matches: Match[] = [];
  loading = false;
  loadingHistory = false;
  syncing = false;
  syncingHistory = false;
  isAuthenticated = false;
  isAdmin = false;
  errorMessage = '';
  syncMessage = '';
  showingHistory = false; // Indica si estamos mostrando partidos históricos

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.checkAdminStatus();
    }
    this.loadMatches();
  }

  checkAdminStatus() {
    this.api.isAdmin().subscribe({
      next: (response) => {
        this.isAdmin = response.isAdmin;
      },
      error: (error) => {
        console.error('Error al verificar admin (matches):', error);
        this.isAdmin = false;
      }
    });
  }

  navigateToAdmin() {
    this.router.navigate(['/admin']);
  }

  loadMatches() {
    this.loading = true;
    this.errorMessage = '';
    this.showingHistory = false; // Mostrando partidos actuales
    this.api.getMatches().subscribe({
      next: (response) => {
        this.matches = response.matches || [];
        this.loading = false;
        this.showingHistory = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.error || error.message || 'Error al cargar los partidos. Verifica que la API esté funcionando.';
        this.loading = false;
        this.matches = [];
        this.showingHistory = false;
      }
    });
  }

  syncMatches() {
    if (this.syncing) return;
    
    this.syncing = true;
    this.syncMessage = '';
    this.errorMessage = '';
    
    this.api.syncMatches().subscribe({
      next: (response: any) => {
        this.syncMessage = response.message || 'Partidos sincronizados correctamente';
        // Cargar partidos después de sincronizar
        this.api.getMatches().pipe(
          finalize(() => {
            // Asegurar que syncing siempre se establece en false al finalizar la carga
            this.syncing = false;
          })
        ).subscribe({
          next: (matchesResponse) => {
            this.matches = matchesResponse.matches || [];
            this.showingHistory = false;
            setTimeout(() => this.syncMessage = '', 5000);
          },
          error: (loadError) => {
            console.error('Error al cargar partidos después de sincronizar:', loadError);
            this.errorMessage = 'Partidos sincronizados, pero error al cargar. Recarga la página.';
            setTimeout(() => this.syncMessage = '', 5000);
            // finalize ya establece syncing en false
          }
        });
      },
      error: (error) => {
        console.error('Error al sincronizar partidos:', error);
        this.errorMessage = error.error?.error || error.message || 'Error al sincronizar partidos. Verifica tu conexión y la API key.';
        // Establecer syncing en false inmediatamente en caso de error
        this.syncing = false;
      }
    });
  }

  syncMatchesHistory() {
    if (this.syncingHistory) return;
    
    this.syncingHistory = true;
    this.syncMessage = '';
    this.errorMessage = '';
    
    this.api.syncMatchesHistory(30).subscribe({
      next: (response: any) => {
        this.syncMessage = response.message || 'Partidos antiguos sincronizados correctamente';
        // Cargar partidos históricos después de sincronizar
        this.api.getMatchesHistory(30).subscribe({
          next: (matchesResponse) => {
            this.matches = matchesResponse.matches || [];
            this.showingHistory = true;
            this.syncingHistory = false;
            setTimeout(() => this.syncMessage = '', 5000);
          },
          error: (loadError) => {
            console.error('Error al cargar partidos históricos después de sincronizar:', loadError);
            this.errorMessage = 'Partidos sincronizados, pero error al cargar. Intenta presionar "Ver partidos antiguos" nuevamente.';
            this.syncingHistory = false;
            setTimeout(() => this.syncMessage = '', 5000);
          }
        });
      },
      error: (error) => {
        console.error('Error al sincronizar partidos antiguos:', error);
        this.errorMessage = error.error?.error || error.message || 'Error al sincronizar partidos antiguos.';
        this.syncingHistory = false;
      }
    });
  }

  loadMatchesHistory() {
    this.loading = true;
    this.errorMessage = '';
    this.showingHistory = true; // Mostrando partidos históricos
    this.loadingHistory = true;
    this.api.getMatchesHistory(30).subscribe({
      next: (response) => {
        this.matches = response.matches || [];
        this.loading = false;
        this.loadingHistory = false;
        this.showingHistory = true;
        if (this.matches.length === 0) {
          this.errorMessage = 'No hay partidos antiguos disponibles. Intenta sincronizar primero.';
        }
      },
      error: (error) => {
        console.error('Error al cargar partidos históricos:', error);
        this.errorMessage = error.error?.error || error.message || 'Error al cargar los partidos antiguos.';
        this.loading = false;
        this.loadingHistory = false;
        this.matches = [];
        this.showingHistory = false;
      }
    });
  }

  formatDate(dateString: string): string {
    return DateUtil.formatDate(dateString);
  }

  getStatusText(status: string): string {
    return MatchUtil.getStatusText(status);
  }

  getStatusBadgeClass(status: string): string {
    return MatchUtil.getStatusBadgeClass(status);
  }

  logout() {
    this.authService.logout();
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}
