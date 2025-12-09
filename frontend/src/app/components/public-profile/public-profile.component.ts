import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService, UserProfile } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { UserSearchComponent } from '../user-search/user-search.component';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, UserSearchComponent],
  template: `
    <div class="container mt-4 mb-5">
      <!-- Barra de búsqueda de usuarios -->
      <div class="search-bar-top mb-3">
        <div class="row">
          <div class="col-12 d-flex justify-content-end">
            <app-user-search></app-user-search>
          </div>
        </div>
      </div>
      
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow">
            <div class="card-body p-4">
              <div *ngIf="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-3">Cargando perfil...</p>
              </div>

              <div *ngIf="!loading && profile" class="profile-view">
                <!-- Header del perfil -->
                <div class="text-center mb-4">
                  <img 
                    [src]="profile.profile_picture || getDefaultAvatar(profile.username)" 
                    alt="Foto de perfil" 
                    class="profile-picture-large mb-3"
                    (error)="$event.target.src=getDefaultAvatar(profile.username)"
                  />
                  <h2 class="mb-2">{{ profile.display_name || profile.username }}</h2>
                  <p class="text-muted mb-3">@{{ profile.username }}</p>
                  
                  <!-- Karma -->
                  <div class="mb-3">
                    <span class="badge" [ngClass]="getKarmaBadgeClass(profile.karma || 0)" style="font-size: 1.1rem; padding: 0.5rem 1rem;">
                      <i class="bi bi-star-fill me-2"></i>{{ profile.karma || 0 }} puntos de karma
                    </span>
                  </div>
                </div>

                <!-- Información del perfil -->
                <div class="profile-info">
                  <div class="row">
                    <div class="col-md-6 mb-3" *ngIf="profile.nationality">
                      <div class="d-flex align-items-center">
                        <i class="bi bi-flag me-2 fs-4"></i>
                        <div>
                          <strong>Nacionalidad</strong>
                          <p class="mb-0">
                            <span class="flag-emoji">{{ getCountryFlag(profile.nationality) }}</span>
                            {{ getCountryName(profile.nationality) }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div class="col-md-6 mb-3" *ngIf="profile.favorite_team">
                      <div class="d-flex align-items-center">
                        <i class="bi bi-trophy me-2 fs-4 text-warning"></i>
                        <div>
                          <strong>Equipo Favorito</strong>
                          <p class="mb-0">{{ profile.favorite_team }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mb-3" *ngIf="profile.created_at">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-calendar me-2 fs-4"></i>
                      <div>
                        <strong>Miembro desde</strong>
                        <p class="mb-0">{{ formatDate(profile.created_at) }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Botón para volver -->
                <div class="text-center mt-4">
                  <button class="btn btn-secondary" (click)="goBack()">
                    <i class="bi bi-arrow-left me-2"></i>Volver
                  </button>
                </div>
              </div>

              <div *ngIf="!loading && !profile && errorMessage" class="alert alert-danger">
                {{ errorMessage }}
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
      margin: -1.5rem -1.5rem 1.5rem -1.5rem;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
    :host-context(body.dark-theme) .search-bar-top {
      background-color: #121212;
      border-bottom: 1px solid #333;
    }
    
    .profile-picture-large {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #667eea;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .flag-emoji {
      font-size: 1.5rem;
    }
    .profile-info {
      background-color: #f8f9fa;
      padding: 1.5rem;
      border-radius: 0.5rem;
    }
    
    /* Modo Oscuro - Public Profile */
    :host-context(body.dark-theme) .profile-info {
      background-color: #2d2d2d;
      color: #e0e0e0;
    }
    :host-context(body.dark-theme) .profile-picture-large {
      border-color: #8b9aff;
    }
  `]
})
export class PublicProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const userId = +params['id'];
      if (userId && !isNaN(userId)) {
        this.loadProfile(userId);
      } else {
        this.errorMessage = 'ID de usuario inválido';
      }
    });
  }

  loadProfile(userId: number) {
    this.loading = true;
    this.errorMessage = '';
    
    this.api.getPublicProfile(userId).subscribe({
      next: (response) => {
        this.profile = response.profile;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Error al cargar el perfil';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getDefaultAvatar(username: string): string {
    const initial = (username || 'U').charAt(0).toUpperCase();
    const bgColor = '#667eea';
    const textColor = '#ffffff';
    const svg = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" rx="100" fill="${bgColor}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-size="80" font-family="Arial, sans-serif">${initial}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  getKarmaBadgeClass(karma: number): string {
    if (karma > 0) return 'bg-success';
    if (karma < 0) return 'bg-danger';
    return 'bg-secondary';
  }

  getCountryFlag(countryCode: string | undefined): string {
    if (!countryCode) return '';
    const normalizedCode = countryCode.toUpperCase().trim();
    const flags: { [key: string]: string } = {
      'AR': '🇦🇷', 'BR': '🇧🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'ES': '🇪🇸',
      'MX': '🇲🇽', 'PE': '🇵🇪', 'UY': '🇺🇾', 'US': '🇺🇸', 'GB': '🇬🇧',
      'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹', 'PT': '🇵🇹', 'NL': '🇳🇱',
      'BE': '🇧🇪', 'CR': '🇨🇷', 'EC': '🇪🇨', 'VE': '🇻🇪', 'PY': '🇵🇾', 'BO': '🇧🇴'
    };
    return flags[normalizedCode] || '🏳️';
  }

  getCountryName(countryCode: string | undefined): string {
    if (!countryCode) return '';
    const countries: { [key: string]: string } = {
      'AR': 'Argentina', 'BR': 'Brasil', 'CL': 'Chile', 'CO': 'Colombia', 'ES': 'España',
      'MX': 'México', 'PE': 'Perú', 'UY': 'Uruguay', 'US': 'Estados Unidos', 'GB': 'Reino Unido',
      'FR': 'Francia', 'DE': 'Alemania', 'IT': 'Italia', 'PT': 'Portugal', 'NL': 'Países Bajos',
      'BE': 'Bélgica', 'CR': 'Costa Rica', 'EC': 'Ecuador', 'VE': 'Venezuela', 'PY': 'Paraguay', 'BO': 'Bolivia'
    };
    return countries[countryCode.toUpperCase()] || countryCode;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Argentina/Buenos_Aires'
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}

