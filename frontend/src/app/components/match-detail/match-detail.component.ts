import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, Match, Comment } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { DateUtil } from '../../utils/date.util';
import { MatchUtil } from '../../utils/match.util';
import { forkJoin } from 'rxjs';
import { UserSearchComponent } from '../user-search/user-search.component';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UserSearchComponent],
  template: `
    <div class="match-detail-page-wrapper">
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

      <div class="container-fluid px-0">
      <!-- Page Header -->
      <div class="page-header bg-primary text-white py-3 mb-4">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-0">
                <a (click)="navigateToHome()" class="brand-link">
                  <span class="brand-icon">⚽</span>
                  <span class="brand-name">Orsai</span>
                </a>
              </h2>
            </div>
            <div class="d-flex gap-2">
              <a routerLink="/matches" class="btn btn-outline-light btn-sm">
                <i class="bi bi-arrow-left me-1"></i>Volver a Partidos
              </a>
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

      <div class="container mt-4">
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-3">Cargando información del partido...</p>
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <!-- Mostrar información del partido tan pronto como esté disponible -->
        <div *ngIf="match" class="match-detail">
          <!-- Información principal del partido -->
          <div class="card shadow-sm mb-4">
            <div class="card-body p-4">
              <!-- Competición -->
              <div class="text-center mb-4">
                <h5 class="text-muted mb-1">{{ match.competition }}</h5>
                <span class="badge" [ngClass]="getStatusBadgeClass(match.status)">
                  {{ getStatusText(match.status) }}
                </span>
                <p class="text-muted small mt-2 mb-0">
                  <i class="bi bi-calendar"></i> {{ formatDate(match.match_date) }}
                </p>
              </div>

              <!-- Equipos y resultado -->
              <div class="row align-items-center py-4">
                <div class="col-md-5 text-center">
                  <div class="team-section">
                    <h2 class="mb-2 fw-bold">{{ match.home_team }}</h2>
                    <div class="team-badge bg-primary text-white rounded px-3 py-2 d-inline-block">
                      Local
                    </div>
                  </div>
                </div>
                
                <div class="col-md-2 text-center">
                  <div class="score-section">
                    <div *ngIf="match.status === 'FINISHED'" class="score-display">
                      <h1 class="display-3 fw-bold mb-0">
                        {{ match.home_score ?? 0 }}
                      </h1>
                      <span class="mx-2">-</span>
                      <h1 class="display-3 fw-bold mb-0">
                        {{ match.away_score ?? 0 }}
                      </h1>
                    </div>
                    <div *ngIf="match.status === 'SCHEDULED'" class="vs-display">
                      <span class="text-muted fs-1">VS</span>
                    </div>
                    <div *ngIf="match.status === 'LIVE'" class="live-score">
                      <h1 class="display-4 fw-bold text-danger mb-0">
                        {{ match.home_score ?? 0 }} - {{ match.away_score ?? 0 }}
                      </h1>
                      <span class="badge bg-danger mt-2">EN VIVO</span>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-5 text-center">
                  <div class="team-section">
                    <h2 class="mb-2 fw-bold">{{ match.away_team }}</h2>
                    <div class="team-badge bg-secondary text-white rounded px-3 py-2 d-inline-block">
                      Visitante
                    </div>
                  </div>
                </div>
              </div>

              <!-- Información adicional -->
              <div class="row mt-4 pt-4 border-top">
                <div class="col-md-4 text-center">
                  <small class="text-muted d-block">Estado</small>
                  <strong>{{ getStatusText(match.status) }}</strong>
                </div>
                <div class="col-md-4 text-center">
                  <small class="text-muted d-block">Fecha</small>
                  <strong>{{ formatDateShort(match.match_date) }}</strong>
                </div>
                <div class="col-md-4 text-center">
                  <small class="text-muted d-block">Hora</small>
                  <strong>{{ formatTime(match.match_date) }}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección de comentarios -->
          <div class="card shadow-sm">
            <div class="card-header bg-light">
              <h4 class="mb-0">
                <i class="bi bi-chat-dots"></i> Comentarios
                <span class="badge bg-primary ms-2">{{ comments.length }}</span>
              </h4>
            </div>
            <div class="card-body">
              <!-- Formulario de comentario -->
              <div *ngIf="isAuthenticated" class="mb-4 p-3 bg-light rounded">
                <h5 class="mb-3">Escribe un comentario</h5>
                <form (ngSubmit)="onSubmitComment()">
                  <div class="mb-3">
                    <textarea
                      class="form-control"
                      rows="4"
                      [(ngModel)]="newComment"
                      name="newComment"
                      placeholder="Comparte tu opinión sobre este partido..."
                      required
                    ></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary" [disabled]="submitting">
                    <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2"></span>
                    {{ submitting ? 'Publicando...' : 'Publicar Comentario' }}
                  </button>
                </form>
              </div>

              <div *ngIf="!isAuthenticated" class="alert alert-info">
                <a routerLink="/login" class="alert-link">Inicia sesión</a> para comentar sobre este partido.
              </div>

              <!-- Mensaje de error al comentar -->
              <div *ngIf="commentError" class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>{{ commentError }}
                <button type="button" class="btn-close" (click)="commentError = ''"></button>
              </div>

              <!-- Loading comentarios -->
              <div *ngIf="loadingComments" class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
              </div>

              <!-- Lista de comentarios -->
              <div *ngIf="!loadingComments && comments.length === 0" class="alert alert-secondary text-center">
                No hay comentarios aún. ¡Sé el primero en comentar!
              </div>

              <div *ngIf="!loadingComments && comments.length > 0" class="comments-list">
                <div *ngFor="let comment of comments" class="comment-item mb-3 p-3 border rounded">
                  <div class="d-flex align-items-start">
                    <!-- Foto de perfil -->
                    <div class="comment-avatar me-3">
                      <img 
                        [src]="comment.profile_picture || getDefaultAvatar(comment)" 
                        [alt]="comment.username || 'Usuario'"
                        class="comment-avatar-img"
                        (error)="$event.target.src = getDefaultAvatar(comment)"
                      />
                    </div>
                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <a [routerLink]="['/user', comment.user_id]" class="text-primary text-decoration-none fw-bold" style="cursor: pointer;">
                            {{ comment.display_name || comment.username }}
                          </a>
                          <span *ngIf="comment.karma !== undefined && comment.karma !== null" class="ms-2">
                            <span class="badge" [ngClass]="getKarmaBadgeClass(comment.karma)">
                              <i class="bi bi-star-fill me-1"></i>{{ comment.karma }}
                            </span>
                          </span>
                          <span *ngIf="comment.nationality" class="ms-2">
                            <span class="flag-emoji">{{ getCountryFlag(comment.nationality) }}</span>
                          </span>
                          <span *ngIf="comment.favorite_team" class="ms-2">
                            <i class="bi bi-trophy text-warning"></i>
                            <small class="text-muted">{{ comment.favorite_team }}</small>
                          </span>
                        </div>
                        <small class="text-muted">{{ formatDate(comment.created_at) }}</small>
                      </div>
                      <p class="mb-0">{{ comment.content }}</p>
                    </div>
                    
                    <!-- Sistema de votos - A la derecha del comentario -->
                    <div *ngIf="isAuthenticated" class="ms-3 d-flex flex-column align-items-center vote-section">
                      <button 
                        type="button" 
                        class="btn btn-sm p-1 vote-btn"
                        [ngClass]="{'btn-success': comment.user_vote === 'up', 'btn-outline-success': comment.user_vote !== 'up'}"
                        (click)="voteComment(comment.id, 'up')"
                        [disabled]="votingComments.has(comment.id) || isOwnComment(comment)"
                        title="Voto positivo"
                      >
                        <i class="bi bi-arrow-up"></i>
                      </button>
                      <span class="vote-score my-1" [ngClass]="getScoreClass(comment.score || 0)">
                        {{ comment.score !== undefined ? comment.score : 0 }}
                      </span>
                      <button 
                        type="button" 
                        class="btn btn-sm p-1 vote-btn"
                        [ngClass]="{'btn-danger': comment.user_vote === 'down', 'btn-outline-danger': comment.user_vote !== 'down'}"
                        (click)="voteComment(comment.id, 'down')"
                        [disabled]="votingComments.has(comment.id) || isOwnComment(comment)"
                        title="Voto negativo"
                      >
                        <i class="bi bi-arrow-down"></i>
                      </button>
                      <small class="text-muted mt-1 text-center" style="font-size: 0.7rem;">
                        <div *ngIf="comment.upvotes !== undefined && comment.upvotes > 0" class="text-success">
                          <i class="bi bi-hand-thumbs-up"></i> {{ comment.upvotes }}
                        </div>
                        <div *ngIf="comment.downvotes !== undefined && comment.downvotes > 0" class="text-danger">
                          <i class="bi bi-hand-thumbs-down"></i> {{ comment.downvotes }}
                        </div>
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && !match && !errorMessage" class="alert alert-warning text-center">
          <h5>Partido no encontrado</h5>
          <p>El partido que buscas no existe o ha sido eliminado.</p>
          <a routerLink="/matches" class="btn btn-primary">Volver a Partidos</a>
        </div>
      </div>
    </div>
    </div>
  `,
  styles: [`
    /* Wrapper de la página */
    .match-detail-page-wrapper {
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    :host-context(body.dark-theme) .match-detail-page-wrapper {
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
    
    .match-detail {
      max-width: 1200px;
      margin: 0 auto;
    }
    .team-section h2 {
      font-size: 1.8rem;
      color: #333;
    }
    :host-context(body.dark-theme) .team-section h2 {
      color: #e0e0e0 !important;
    }
    .score-display {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .score-display h1 {
      color: #0d6efd;
    }
    :host-context(body.dark-theme) .score-display h1 {
      color: #8b9aff !important;
    }
    .vs-display {
      font-size: 2rem;
    }
    :host-context(body.dark-theme) .vs-display {
      color: #aaa !important;
    }
    .live-score h1 {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .comment-item {
      background-color: #f8f9fa;
      transition: box-shadow 0.2s;
    }
    :host-context(body.dark-theme) .comment-item {
      background-color: #2d2d2d !important;
      border-color: #444 !important;
      color: #e0e0e0 !important;
    }
    .comment-item:hover {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    :host-context(body.dark-theme) .comment-item:hover {
      box-shadow: 0 2px 4px rgba(255,255,255,0.1);
    }
    .comment-avatar {
      flex-shrink: 0;
    }
    .comment-avatar-img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #667eea;
    }
    .flag-emoji {
      font-size: 1.2rem;
    }
    .vote-section {
      min-width: 60px;
      flex-shrink: 0;
    }
    .vote-btn {
      min-width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    .vote-score {
      min-width: 30px;
      text-align: center;
      font-size: 1rem;
      font-weight: 600;
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
      font-size: 1.8rem;
      animation: bounce 2s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    .brand-name {
      font-size: 1.8rem;
      font-weight: bold;
    }
    
    /* Modo Oscuro - Match Detail */
    :host-context(body.dark-theme) .match-detail {
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .team-section {
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .page-header {
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%) !important;
    }
    :host-context(body.dark-theme) .bg-primary {
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%) !important;
    }
    :host-context(body.dark-theme) .card {
      background-color: #1e1e1e !important;
      color: #e0e0e0 !important;
      border-color: #444 !important;
    }
    :host-context(body.dark-theme) .card-body {
      background-color: #1e1e1e !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .card-header {
      background-color: #2d2d2d !important;
      border-bottom-color: #444 !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .bg-light {
      background-color: #2d2d2d !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .text-muted {
      color: #aaa !important;
    }
    :host-context(body.dark-theme) h2,
    :host-context(body.dark-theme) h4,
    :host-context(body.dark-theme) h5 {
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) strong {
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .border-top {
      border-top-color: #444 !important;
    }
    :host-context(body.dark-theme) .border {
      border-color: #444 !important;
    }
    :host-context(body.dark-theme) .alert {
      background-color: #2d2d2d !important;
      border-color: #444 !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .alert-info {
      background-color: #1a3a5c !important;
      border-color: #2d5a8a !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .alert-danger {
      background-color: #5a1a1a !important;
      border-color: #8a2d2d !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .alert-warning {
      background-color: #5a4a1a !important;
      border-color: #8a6d2d !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .alert-secondary {
      background-color: #2d2d2d !important;
      border-color: #444 !important;
      color: #aaa !important;
    }
    :host-context(body.dark-theme) .team-badge {
      background-color: #495057 !important;
    }
    :host-context(body.dark-theme) .container {
      background-color: transparent !important;
    }
    :host-context(body.dark-theme) .container-fluid {
      background-color: transparent !important;
    }
    :host-context(body.dark-theme) p {
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .form-control {
      background-color: #2d2d2d !important;
      border-color: #444 !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .form-control::placeholder {
      color: #aaa !important;
    }
    :host-context(body.dark-theme) .btn-outline-light {
      border-color: #666 !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .btn-outline-light:hover {
      background-color: #444 !important;
      border-color: #666 !important;
    }
    :host-context(body.dark-theme) .text-primary {
      color: #8b9aff !important;
    }
    :host-context(body.dark-theme) .spinner-border.text-primary {
      color: #8b9aff !important;
    }
  `]
})
export class MatchDetailComponent implements OnInit {
  match: Match | null = null;
  comments: Comment[] = [];
  loading = false;
  loadingComments = false;
  submitting = false;
  newComment = '';
  isAuthenticated = false;
  isAdmin = false;
  matchId: number | null = null;
  errorMessage = '';
  commentError = '';
  votingComments: Set<number> = new Set(); // Para rastrear comentarios que se están votando

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  navigateToHome() {
    this.router.navigate(['/']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout();
  }

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.checkAdminStatus();
    }
    this.route.params.subscribe(params => {
      this.matchId = +params['id'];
      if (this.matchId && !isNaN(this.matchId)) {
        this.loadMatchAndComments();
      } else {
        this.errorMessage = 'ID de partido inválido';
        this.loading = false;
      }
    });
  }

  checkAdminStatus() {
    this.api.isAdmin().subscribe({
      next: (response) => {
        this.isAdmin = response.isAdmin;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al verificar admin (match-detail):', error);
        this.isAdmin = false;
      }
    });
  }

  navigateToAdmin() {
    this.router.navigate(['/admin']);
  }

  /**
   * Carga el partido y los comentarios en paralelo para optimizar tiempos
   */
  loadMatchAndComments() {
    if (!this.matchId || isNaN(this.matchId)) {
      this.errorMessage = 'ID de partido no válido';
      this.loading = false;
      return;
    }
    
    this.loading = true;
    this.loadingComments = true;
    this.errorMessage = '';
    this.match = null;
    this.comments = [];
    
    // Cargar partido y comentarios en paralelo
    forkJoin({
      match: this.api.getMatch(this.matchId),
      comments: this.api.getComments(this.matchId)
    }).subscribe({
      next: (results) => {
        // Procesar partido
        if (results.match?.match) {
          this.match = results.match.match;
          this.loading = false;
        } else {
          console.error('No se encontró el partido en la respuesta:', results.match);
          this.errorMessage = 'No se pudo cargar la información del partido';
          this.loading = false;
        }
        
        // Procesar comentarios
        this.comments = results.comments?.comments || [];
        this.loadingComments = false;
        
        // Cargar votos para cada comentario
        this.comments.forEach(comment => {
          this.loadCommentVotes(comment.id);
        });
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar partido/comentarios:', error);
        
        // Si falla el partido, mostrar error
        if (!this.match) {
          this.errorMessage = error.error?.error || error.message || 'Error al cargar el partido';
          this.loading = false;
        }
        
        // Si solo fallan los comentarios, continuar sin ellos
        this.comments = [];
        this.loadingComments = false;
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Carga solo el partido (método legacy, mantenido por compatibilidad)
   */
  loadMatch() {
    if (!this.matchId || isNaN(this.matchId)) {
      this.errorMessage = 'ID de partido no válido';
      this.loading = false;
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    this.api.getMatch(this.matchId).subscribe({
      next: (response) => {
        if (response?.match) {
          this.match = response.match;
        } else {
          this.errorMessage = 'No se pudo cargar la información del partido';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.error || error.message || 'Error al cargar el partido';
        this.loading = false;
        this.match = null;
      }
    });
  }

  /**
   * Recarga solo los comentarios (usado después de crear un nuevo comentario)
   */
  loadComments() {
    if (!this.matchId) return;
    
    this.loadingComments = true;
    this.api.getComments(this.matchId).subscribe({
      next: (response) => {
        this.comments = response.comments || [];
        // Cargar votos para cada comentario
        this.comments.forEach(comment => {
          this.loadCommentVotes(comment.id);
        });
        this.loadingComments = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.comments = [];
        this.loadingComments = false;
      }
    });
  }

  onSubmitComment() {
    if (!this.matchId || !this.newComment.trim()) return;

    this.submitting = true;
    this.commentError = '';
    const commentContent = this.newComment.trim();
    
    this.api.createComment(this.matchId, commentContent).subscribe({
      next: (response: any) => {
        // Limpiar formulario
        this.newComment = '';
        this.submitting = false;
        this.commentError = '';
        
        // Si el backend retorna el comentario creado, agregarlo directamente
        if (response?.comment) {
          this.comments.unshift(response.comment);
        } else {
          // Si no, recargar todos los comentarios
          this.loadComments();
        }
      },
      error: (error) => {
        this.submitting = false;
        
        if (error.status === 401) {
          this.commentError = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          const errorMsg = error.error?.error || error.message || 'Error al publicar el comentario. Intenta nuevamente.';
          this.commentError = errorMsg;
        }
      }
    });
  }

  formatDate(dateString: string): string {
    return DateUtil.formatDate(dateString);
  }

  formatDateShort(dateString: string): string {
    return DateUtil.formatDateShort(dateString);
  }

  formatTime(dateString: string): string {
    return DateUtil.formatTime(dateString);
  }

  getStatusText(status: string): string {
    return MatchUtil.getStatusText(status);
  }

  getStatusBadgeClass(status: string): string {
    return MatchUtil.getStatusBadgeClass(status);
  }

  getCountryFlag(countryCode: string | null | undefined): string {
    if (!countryCode) return '';
    
    // Normalizar el código (mayúsculas, sin espacios)
    const normalized = countryCode.trim().toUpperCase();
    
    const flags: { [key: string]: string } = {
      'AR': '🇦🇷', 'BR': '🇧🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'ES': '🇪🇸',
      'MX': '🇲🇽', 'PE': '🇵🇪', 'UY': '🇺🇾', 'US': '🇺🇸', 'GB': '🇬🇧',
      'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹', 'PT': '🇵🇹', 'NL': '🇳🇱',
      'BE': '🇧🇪', 'CR': '🇨🇷', 'EC': '🇪🇨', 'VE': '🇻🇪', 'PY': '🇵🇾', 'BO': '🇧🇴'
    };
    return flags[normalized] || '';
  }

  getInitial(comment: Comment): string {
    const name = comment.display_name || comment.username || '';
    return name.length > 0 ? name.charAt(0).toUpperCase() : 'U';
  }

  getDefaultAvatar(comment: Comment): string {
    // Usar un data URI SVG como placeholder en lugar de una URL externa
    const initial = this.getInitial(comment);
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
        <rect width="50" height="50" fill="#667eea"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initial}</text>
      </svg>
    `)}`;
  }

  /**
   * Carga los votos de un comentario específico
   */
  loadCommentVotes(commentId: number) {
    this.api.getCommentVotes(commentId).subscribe({
      next: (response) => {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
          comment.upvotes = response.upvotes;
          comment.downvotes = response.downvotes;
          comment.score = response.score;
          comment.user_vote = response.user_vote;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        // Si falla, dejar valores por defecto
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
          comment.upvotes = 0;
          comment.downvotes = 0;
          comment.score = 0;
          comment.user_vote = null;
        }
      }
    });
  }

  /**
   * Vota un comentario (positivo o negativo)
   */
  voteComment(commentId: number, voteType: 'up' | 'down') {
    console.log('voteComment llamado:', { commentId, voteType, isAuthenticated: this.isAuthenticated });
    
    if (!this.isAuthenticated) {
      this.commentError = 'Debes iniciar sesión para votar';
      return;
    }

    if (this.votingComments.has(commentId)) {
      return; // Ya se está votando
    }

    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) {
      console.error('Comentario no encontrado:', commentId);
      return;
    }

    // Verificar si es el propio comentario
    if (this.isOwnComment(comment)) {
      this.commentError = 'No puedes votar tu propio comentario';
      return;
    }

    this.votingComments.add(commentId);
    const previousVote = comment?.user_vote;

    this.api.voteComment(commentId, voteType).subscribe({
      next: (response) => {
        if (comment) {
          comment.upvotes = response.upvotes;
          comment.downvotes = response.downvotes;
          comment.score = response.score;
          comment.user_vote = response.user_vote;
          
          // Si el voto cambió, recargar comentarios para actualizar el karma visible
          if (previousVote !== response.user_vote) {
            // Recargar todos los comentarios para actualizar el karma de los usuarios
            this.loadComments();
          }
        }
        this.votingComments.delete(commentId);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.commentError = error.error?.error || 'Error al votar el comentario';
        this.votingComments.delete(commentId);
        if (error.status === 401) {
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Verifica si un comentario pertenece al usuario actual
   */
  isOwnComment(comment: Comment): boolean {
    if (!this.isAuthenticated) {
      return false;
    }
    const user = this.authService.getUser();
    if (!user || !user.id) {
      return false;
    }
    return comment.user_id === user.id;
  }

  /**
   * Obtiene la clase CSS para el badge de karma según su valor
   */
  getKarmaBadgeClass(karma: number): string {
    if (karma > 0) return 'bg-success';
    if (karma < 0) return 'bg-danger';
    return 'bg-secondary';
  }

  /**
   * Obtiene la clase CSS para el score según su valor
   */
  getScoreClass(score: number): string {
    if (score > 0) return 'text-success fw-bold';
    if (score < 0) return 'text-danger fw-bold';
    return 'text-muted';
  }
}
