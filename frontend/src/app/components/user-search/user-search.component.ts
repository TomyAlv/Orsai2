import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { ApiService, UserProfile } from '../../core/api';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="user-search-container">
      <div class="input-group">
        <span class="input-group-text">
          <i class="bi bi-search"></i>
        </span>
        <input
          type="text"
          class="form-control"
          placeholder="Buscar usuarios..."
          [(ngModel)]="searchQuery"
          (input)="onSearchInput()"
          (focus)="showResults = true"
          (blur)="onBlur()"
        />
        <button *ngIf="searchQuery" class="btn btn-outline-secondary" type="button" (click)="clearSearch()">
          <i class="bi bi-x"></i>
        </button>
      </div>

      <!-- Resultados de búsqueda -->
      <div 
        *ngIf="showResults && (searchResults.length > 0 || searching)" 
        class="search-results"
        (mouseenter)="onResultsMouseEnter()"
        (mouseleave)="onResultsMouseLeave()"
      >
        <div *ngIf="searching" class="search-loading">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          <span>Buscando...</span>
        </div>
        
        <div *ngIf="!searching && searchResults.length > 0" class="results-list">
          <div
            *ngFor="let user of searchResults"
            class="result-item"
            (mousedown)="navigateToUser(user.id)"
          >
            <img
              [src]="user.profile_picture || getDefaultAvatar(user.username)"
              [alt]="user.username"
              class="result-avatar"
              (error)="$event.target.src = getDefaultAvatar(user.username)"
            />
            <div class="result-info">
              <div class="result-name">{{ user.display_name || user.username }}</div>
              <div class="result-username">@{{ user.username }}</div>
              <div *ngIf="user.favorite_team" class="result-team">
                <i class="bi bi-trophy text-warning"></i> {{ user.favorite_team }}
              </div>
            </div>
            <div *ngIf="user.karma !== undefined && user.karma !== null" class="result-karma">
              <span class="badge" [ngClass]="getKarmaBadgeClass(user.karma)">
                {{ user.karma }}
              </span>
            </div>
          </div>
        </div>

        <div *ngIf="!searching && searchResults.length === 0 && searchQuery.length >= 2" class="no-results">
          <i class="bi bi-person-x"></i>
          <p>No se encontraron usuarios</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-search-container {
      position: relative;
      max-width: 400px;
    }
    .input-group {
      border: none;
      box-shadow: none;
    }
    .input-group-text {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
    }
    :host-context(body.dark-theme) .input-group-text {
      background-color: #2d2d2d;
      border-color: #444;
      color: #e0e0e0;
    }
    .form-control {
      border: 1px solid #dee2e6;
    }
    :host-context(body.dark-theme) .form-control {
      background-color: #2d2d2d;
      border-color: #444;
      color: #e0e0e0;
    }
    :host-context(body.dark-theme) .form-control:focus {
      background-color: #2d2d2d;
      border-color: #667eea;
      color: #e0e0e0;
    }
    .btn-outline-secondary {
      border-color: #dee2e6;
    }
    :host-context(body.dark-theme) .btn-outline-secondary {
      background-color: #2d2d2d;
      border-color: #444;
      color: #e0e0e0;
    }
    :host-context(body.dark-theme) .btn-outline-secondary:hover {
      background-color: #3d3d3d;
      border-color: #555;
    }
    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      z-index: 1000;
      max-height: 400px;
      overflow-y: auto;
      margin-top: 0.25rem;
    }
    :host-context(body.dark-theme) .search-results {
      background: #212529;
      border-color: #495057;
    }
    .search-loading {
      padding: 1rem;
      text-align: center;
      color: #6c757d;
    }
    .results-list {
      padding: 0.5rem 0;
    }
    .result-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .result-item:hover {
      background-color: #f8f9fa;
    }
    :host-context(body.dark-theme) .result-item:hover {
      background-color: #343a40;
    }
    .result-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 0.75rem;
    }
    .result-info {
      flex: 1;
      min-width: 0;
    }
    .result-name {
      font-weight: 600;
      color: #212529;
      margin-bottom: 0.25rem;
    }
    :host-context(body.dark-theme) .result-name {
      color: #f8f9fa;
    }
    .result-username {
      font-size: 0.875rem;
      color: #6c757d;
      margin-bottom: 0.25rem;
    }
    .result-team {
      font-size: 0.75rem;
      color: #6c757d;
    }
    .result-karma {
      margin-left: 0.5rem;
    }
    .no-results {
      padding: 2rem 1rem;
      text-align: center;
      color: #6c757d;
    }
    .no-results i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      display: block;
    }
  `]
})
export class UserSearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  searchResults: UserProfile[] = [];
  searching = false;
  showResults = false;
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    // Configurar búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          this.searchResults = [];
          return [];
        }
        this.searching = true;
        return this.api.searchUsers(query);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.searchResults = response.users || [];
        this.searching = false;
      },
      error: () => {
        this.searchResults = [];
        this.searching = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput() {
    if (this.searchQuery.length >= 2) {
      this.showResults = true;
      this.searchSubject.next(this.searchQuery);
    } else {
      this.searchResults = [];
      this.showResults = false;
    }
  }

  onBlur() {
    // Delay para permitir clicks en los resultados
    setTimeout(() => {
      // Solo ocultar si no estamos haciendo hover sobre los resultados
      if (!this.isHoveringResults) {
        this.showResults = false;
      }
    }, 200);
  }

  isHoveringResults = false;

  onResultsMouseEnter() {
    this.isHoveringResults = true;
  }

  onResultsMouseLeave() {
    this.isHoveringResults = false;
    this.showResults = false;
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.showResults = false;
  }

  navigateToUser(userId: number) {
    this.router.navigate(['/user', userId]);
    this.clearSearch();
  }

  getDefaultAvatar(username: string): string {
    const initial = (username || 'U').charAt(0).toUpperCase();
    const bgColor = '#667eea';
    const textColor = '#ffffff';
    const svg = `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="20" fill="${bgColor}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-size="18" font-family="Arial, sans-serif">${initial}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  getKarmaBadgeClass(karma: number): string {
    if (karma > 0) return 'bg-success';
    if (karma < 0) return 'bg-danger';
    return 'bg-secondary';
  }
}

