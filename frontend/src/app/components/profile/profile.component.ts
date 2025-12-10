import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, UserProfile } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { UserSearchComponent } from '../user-search/user-search.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UserSearchComponent],
  template: `
    <div class="profile-page-wrapper">
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
          <div class="d-flex justify-content-between align-items-center mb-3">
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
                <i class="bi bi-arrow-left me-1"></i>Volver
              </a>
              <button *ngIf="isAdmin" class="btn btn-warning btn-sm" (click)="navigateToAdmin()">
                <i class="bi bi-shield-check me-1"></i>Panel Administrador
              </button>
              <button class="btn btn-outline-light btn-sm" (click)="logout()">
                <i class="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="container mt-4">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card shadow-sm">
              <div class="card-header bg-primary text-white">
                <h4 class="mb-0">
                  <i class="bi bi-person-circle me-2"></i>Mi Perfil
                </h4>
              </div>
              <div class="card-body p-4">
                <div *ngIf="loading" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                  <p class="mt-3 text-muted">Cargando perfil...</p>
                </div>

                <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
                  <i class="bi bi-exclamation-triangle me-2"></i>{{ errorMessage }}
                  <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
                </div>

                <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
                  <i class="bi bi-check-circle me-2"></i>{{ successMessage }}
                  <button type="button" class="btn-close" (click)="successMessage = ''"></button>
                </div>

                <div *ngIf="!loading && !profile && !errorMessage" class="text-center py-4">
                  <p class="text-muted">No se pudo cargar el perfil</p>
                </div>

                <form *ngIf="!loading && profile" (ngSubmit)="onSubmit()">
                  <!-- Foto de Perfil -->
                  <div class="mb-4 text-center">
                    <label class="form-label fw-bold">Foto de Perfil</label>
                    <div class="profile-picture-wrapper mb-3">
                      <img 
                        [src]="profile.profile_picture || getDefaultAvatar(profile.username)" 
                        alt="Foto de perfil" 
                        class="profile-picture-preview"
                        (error)="$event.target.src = getDefaultAvatar(profile.username)"
                      />
                    </div>
                    
                    <!-- Opción 1: Subir archivo -->
                    <div class="mb-3">
                      <label class="form-label">Subir foto desde tu computadora</label>
                      <input
                        type="file"
                        class="form-control"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        (change)="onFileSelected($event)"
                        #fileInput
                      />
                      <small class="text-muted">Formatos permitidos: JPEG, PNG, GIF, WEBP (máx. 5MB)</small>
                      <div *ngIf="uploading" class="mt-2">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                        <span>Subiendo imagen...</span>
                      </div>
                    </div>
                    
                    <!-- Opción 2: URL -->
                    <div class="mb-3">
                      <label class="form-label">O ingresa una URL de imagen</label>
                      <input
                        type="url"
                        class="form-control"
                        [(ngModel)]="profile.profile_picture"
                        name="profile_picture"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                      <small class="text-muted">Ingresa la URL de una imagen para tu foto de perfil</small>
                    </div>
                  </div>

                  <!-- Nombre de Usuario (solo lectura) -->
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-person me-2"></i>Usuario
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      [value]="profile.username"
                      disabled
                    />
                    <small class="text-muted">El nombre de usuario no se puede cambiar</small>
                  </div>

                  <!-- Karma/Puntaje -->
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-star-fill me-2"></i>Karma
                    </label>
                    <div class="karma-display">
                      <span class="badge" [ngClass]="getKarmaBadgeClass(profile.karma || 0)" style="font-size: 1.2rem; padding: 0.5rem 1rem;">
                        <i class="bi bi-star-fill me-2"></i>{{ profile.karma || 0 }} puntos
                      </span>
                    </div>
                    <small class="text-muted">Tu karma se basa en los votos que recibes en tus comentarios</small>
                  </div>

                  <!-- Nombre de Perfil -->
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-card-text me-2"></i>Nombre de Perfil
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="profile.display_name"
                      name="display_name"
                      placeholder="Tu nombre público"
                      maxlength="50"
                    />
                    <small class="text-muted">Este nombre aparecerá en tus comentarios</small>
                  </div>

                  <!-- Nacionalidad -->
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-flag me-2"></i>Nacionalidad
                    </label>
                    <select
                      class="form-select"
                      [(ngModel)]="profile.nationality"
                      name="nationality"
                    >
                      <option value="">Selecciona tu nacionalidad</option>
                      <option value="AR">🇦🇷 Argentina</option>
                      <option value="BR">🇧🇷 Brasil</option>
                      <option value="CL">🇨🇱 Chile</option>
                      <option value="CO">🇨🇴 Colombia</option>
                      <option value="ES">🇪🇸 España</option>
                      <option value="MX">🇲🇽 México</option>
                      <option value="PE">🇵🇪 Perú</option>
                      <option value="UY">🇺🇾 Uruguay</option>
                      <option value="US">🇺🇸 Estados Unidos</option>
                      <option value="GB">🇬🇧 Reino Unido</option>
                      <option value="FR">🇫🇷 Francia</option>
                      <option value="DE">🇩🇪 Alemania</option>
                      <option value="IT">🇮🇹 Italia</option>
                      <option value="PT">🇵🇹 Portugal</option>
                      <option value="NL">🇳🇱 Países Bajos</option>
                      <option value="BE">🇧🇪 Bélgica</option>
                      <option value="CR">🇨🇷 Costa Rica</option>
                      <option value="EC">🇪🇨 Ecuador</option>
                      <option value="VE">🇻🇪 Venezuela</option>
                      <option value="PY">🇵🇾 Paraguay</option>
                      <option value="BO">🇧🇴 Bolivia</option>
                    </select>
                    <small class="text-muted">Tu bandera aparecerá en tus comentarios</small>
                  </div>

                  <!-- Equipo Favorito -->
                  <div class="mb-4">
                    <label class="form-label fw-bold">
                      <i class="bi bi-trophy me-2"></i>Equipo Favorito
                    </label>
                    <select
                      class="form-select"
                      [(ngModel)]="profile.favorite_team"
                      name="favorite_team"
                    >
                      <option value="">Selecciona tu equipo favorito</option>
                      <optgroup label="🏆 Bundesliga (Alemania)">
                        <option *ngFor="let team of teamsByLeague['Bundesliga']" [value]="team">{{ team }}</option>
                      </optgroup>
                      <optgroup label="🏆 Premier League (Inglaterra)">
                        <option *ngFor="let team of teamsByLeague['Premier League']" [value]="team">{{ team }}</option>
                      </optgroup>
                      <optgroup label="🏆 La Liga (España)">
                        <option *ngFor="let team of teamsByLeague['La Liga']" [value]="team">{{ team }}</option>
                      </optgroup>
                      <optgroup label="🏆 Liga Profesional (Argentina)">
                        <option *ngFor="let team of teamsByLeague['Liga Profesional']" [value]="team">{{ team }}</option>
                      </optgroup>
                      <optgroup label="🏆 Primeira Liga (Portugal)">
                        <option *ngFor="let team of teamsByLeague['Primeira Liga']" [value]="team">{{ team }}</option>
                      </optgroup>
                      <optgroup label="🏆 Ligue 1 (Francia)">
                        <option *ngFor="let team of teamsByLeague['Ligue 1']" [value]="team">{{ team }}</option>
                      </optgroup>
                      <optgroup label="🏆 Serie A (Italia)">
                        <option *ngFor="let team of teamsByLeague['Serie A']" [value]="team">{{ team }}</option>
                      </optgroup>
                    </select>
                    <small class="text-muted">El escudo de tu equipo aparecerá en tus comentarios</small>
                  </div>

                  <!-- Botones -->
                  <div class="d-flex gap-2 justify-content-end">
                    <button type="button" class="btn btn-secondary" (click)="navigateToHome()">
                      <i class="bi bi-x me-1"></i>Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary" [disabled]="saving || !hasChanges()">
                      <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
                      <i *ngIf="!saving" class="bi bi-check-lg me-2"></i>
                      {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  `,
  styles: [`
    .profile-page-wrapper {
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    :host-context(body.dark-theme) .profile-page-wrapper {
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
    .profile-picture-wrapper {
      display: flex;
      justify-content: center;
    }
    .profile-picture-preview {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #667eea;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    
    /* Modo Oscuro - Profile */
    :host-context(body.dark-theme) {
      background-color: #121212;
    }
    :host-context(body.dark-theme) .container-fluid {
      background-color: #121212;
    }
    :host-context(body.dark-theme) .container {
      background-color: transparent;
    }
    :host-context(body.dark-theme) .profile-picture-preview {
      border-color: #8b9aff;
    }
    :host-context(body.dark-theme) .page-header {
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%) !important;
    }
    :host-context(body.dark-theme) .bg-primary {
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%) !important;
    }
    :host-context(body.dark-theme) .card {
      background-color: #2d2d2d !important;
      color: #e0e0e0 !important;
      border-color: #444 !important;
    }
    :host-context(body.dark-theme) .card-body {
      background-color: #2d2d2d !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .card-header {
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%) !important;
      border-bottom-color: #444 !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .form-label {
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .form-control {
      background-color: #2d2d2d !important;
      border-color: #444 !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .form-control:disabled {
      background-color: #1e1e1e !important;
      color: #aaa !important;
      border-color: #444 !important;
    }
    :host-context(body.dark-theme) .form-select {
      background-color: #2d2d2d !important;
      border-color: #444 !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .alert {
      background-color: #2d2d2d !important;
      border-color: #444 !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) small {
      color: #aaa !important;
    }
    :host-context(body.dark-theme) h4 {
      color: #e0e0e0 !important;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  originalProfile: UserProfile | null = null; // Para detectar cambios
  loading = false;
  saving = false;
  uploading = false;
  isAdmin = false;
  errorMessage = '';
  successMessage = '';

  // Estructura de equipos por liga
  teamsByLeague: { [key: string]: string[] } = {
    'Bundesliga': [
      'Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen',
      'Eintracht Frankfurt', 'VfL Wolfsburg', 'Borussia Mönchengladbach', '1. FC Union Berlin',
      'SC Freiburg', '1. FC Köln', 'TSG Hoffenheim', 'VfL Bochum',
      'Mainz 05', 'Werder Bremen', 'VfB Stuttgart', 'FC Augsburg',
      'Hertha BSC', 'Schalke 04'
    ],
    'Premier League': [
      'Manchester City', 'Arsenal', 'Manchester United', 'Newcastle United',
      'Liverpool', 'Brighton & Hove Albion', 'Aston Villa', 'Tottenham Hotspur',
      'Brentford', 'Fulham', 'Crystal Palace', 'Chelsea',
      'Wolverhampton Wanderers', 'West Ham United', 'Bournemouth', 'Nottingham Forest',
      'Everton', 'Leicester City', 'Leeds United', 'Southampton'
    ],
    'La Liga': [
      'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Real Sociedad',
      'Villarreal', 'Real Betis', 'Girona', 'Athletic Bilbao',
      'Valencia', 'Sevilla', 'Osasuna', 'Rayo Vallecano',
      'Celta Vigo', 'Mallorca', 'Getafe', 'Cadiz',
      'Almeria', 'Valladolid', 'Espanyol', 'Elche'
    ],
    'Liga Profesional': [
      'River Plate', 'Boca Juniors', 'Racing Club', 'Independiente',
      'San Lorenzo', 'Estudiantes', 'Huracán', 'Gimnasia La Plata',
      'Defensa y Justicia', 'Talleres', 'Lanús', 'Argentinos Juniors',
      'Rosario Central', 'Newell\'s Old Boys', 'Unión', 'Colón',
      'Banfield', 'Vélez Sarsfield', 'Godoy Cruz', 'Atlético Tucumán'
    ],
    'Primeira Liga': [
      'Benfica', 'Porto', 'Sporting CP', 'Braga',
      'Vitória Guimarães', 'Arouca', 'Famalicão', 'Casa Pia',
      'Vizela', 'Rio Ave', 'Boavista', 'Portimonense',
      'Estoril', 'Marítimo', 'Paços de Ferreira', 'Santa Clara',
      'Chaves', 'Gil Vicente'
    ],
    'Ligue 1': [
      'Paris Saint-Germain', 'Lens', 'Marseille', 'Monaco',
      'Rennes', 'Lille', 'Nice', 'Lorient',
      'Clermont', 'Lyon', 'Toulouse', 'Reims',
      'Montpellier', 'Toulouse', 'Nantes', 'Brest',
      'Auxerre', 'Strasbourg', 'Ajaccio', 'Troyes'
    ],
    'Serie A': [
      'Napoli', 'Juventus', 'Inter Milan', 'AC Milan',
      'Lazio', 'Roma', 'Atalanta', 'Udinese',
      'Torino', 'Fiorentina', 'Bologna', 'Empoli',
      'Monza', 'Sassuolo', 'Lecce', 'Salernitana',
      'Spezia', 'Verona', 'Cremonese', 'Sampdoria'
    ]
  };

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    // Forzar refresco de sesión para asegurar token válido
    this.authService.refreshSession().then((ok) => {
      if (!ok) {
        this.router.navigate(['/login']);
        return;
      }
      this.checkAdminStatus();
      this.loadProfile();
    });
  }

  checkAdminStatus() {
    this.api.isAdmin().subscribe({
      next: (response) => {
        this.isAdmin = response.isAdmin;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al verificar admin (profile):', error);
        this.isAdmin = false;
      }
    });
  }

  navigateToAdmin() {
    this.router.navigate(['/admin']);
  }

  loadProfile() {
    this.loading = true;
    this.errorMessage = '';
    this.profile = null; // Resetear perfil
    
    this.api.getProfile().subscribe({
      next: (response) => {
        if (response && response.profile) {
          // Establecer ambos valores juntos
          this.profile = response.profile;
          // Guardar una copia del perfil original para detectar cambios
          this.originalProfile = JSON.parse(JSON.stringify(response.profile));
          this.loading = false;
          // Forzar detección de cambios
          this.cdr.detectChanges();
        } else {
          console.error('Respuesta inválida:', response);
          this.errorMessage = 'No se pudo cargar el perfil. Respuesta inválida.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al cargar perfil:', error);
        this.errorMessage = error.error?.error || error.message || 'Error al cargar el perfil';
        this.loading = false;
        this.cdr.detectChanges();
        if (error.status === 401) {
          this.authService.logout();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1000);
        }
      }
    });
  }

  onSubmit() {
    if (!this.profile) return;

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData: Partial<UserProfile> = {
      profile_picture: this.profile.profile_picture || '',
      nationality: this.profile.nationality || '',
      display_name: this.profile.display_name || '',
      favorite_team: this.profile.favorite_team || ''
    };

    this.api.updateProfile(updateData).subscribe({
      next: (response) => {
        this.profile = response.profile;
        // Actualizar el perfil original después de guardar
        this.originalProfile = JSON.parse(JSON.stringify(response.profile));
        this.saving = false;
        this.successMessage = 'Perfil actualizado correctamente';
        setTimeout(() => this.successMessage = '', 3000);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Error al actualizar el perfil';
        this.saving = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  getDefaultAvatar(username?: string): string {
    // Usar un data URI SVG como placeholder en lugar de una URL externa
    const initial = (username || this.profile?.username || 'U').charAt(0).toUpperCase();
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="150" height="150" fill="#667eea"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initial}</text>
      </svg>
    `)}`;
  }

  getKarmaBadgeClass(karma: number): string {
    if (karma > 0) return 'bg-success';
    if (karma < 0) return 'bg-danger';
    return 'bg-secondary';
  }

  /**
   * Verifica si hay cambios en el formulario comparando con el perfil original
   */
  hasChanges(): boolean {
    if (!this.profile || !this.originalProfile) return false;
    
    return (
      (this.profile.profile_picture || '') !== (this.originalProfile.profile_picture || '') ||
      (this.profile.nationality || '') !== (this.originalProfile.nationality || '') ||
      (this.profile.display_name || '') !== (this.originalProfile.display_name || '') ||
      (this.profile.favorite_team || '') !== (this.originalProfile.favorite_team || '')
    );
  }

  /**
   * Maneja la selección de archivo para subir foto de perfil
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'El archivo es demasiado grande. Máximo 5MB';
        return;
      }
      
      // Validar tipo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, GIF, WEBP)';
        return;
      }
      
      this.uploading = true;
      this.errorMessage = '';
      
      this.api.uploadProfilePicture(file).subscribe({
        next: (response) => {
          if (this.profile) {
            this.profile.profile_picture = response.url;
          }
          this.uploading = false;
          this.successMessage = 'Foto de perfil subida correctamente';
          setTimeout(() => this.successMessage = '', 3000);
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error.error?.error || 'Error al subir la imagen';
          this.uploading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}

