import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { ApiService, News } from '../../core/api';
import { UserSearchComponent } from '../user-search/user-search.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, UserSearchComponent],
  template: `
    <!-- Barra de búsqueda de usuarios (top de la página) -->
    <div class="search-bar-top">
      <div class="container">
        <div class="row">
          <div class="col-12 d-flex justify-content-end py-2">
            <app-user-search></app-user-search>
          </div>
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-pattern"></div>
      <div class="floating-elements">
        <div class="floating-icon" style="top: 10%; left: 5%; animation-delay: 0s;">⚽</div>
        <div class="floating-icon" style="top: 60%; right: 10%; animation-delay: 1s;">🏆</div>
        <div class="floating-icon" style="top: 30%; right: 20%; animation-delay: 2s;">⚽</div>
      </div>
      <div class="container">
        <div class="row align-items-center min-vh-50">
          <div class="col-lg-6 text-center text-lg-start">
            <div class="hero-badge mb-3">
              <span class="badge-text">⚡ Plataforma de Fútbol</span>
            </div>
            <h1 class="display-3 fw-bold text-white mb-4 hero-title">
              Orsai
              <span class="text-warning hero-emoji">⚽</span>
            </h1>
            <p class="lead text-white mb-4 hero-subtitle">
              Tu plataforma para seguir el fútbol y compartir tus opiniones con la comunidad
            </p>
            <p class="text-white-50 mb-4 hero-description">
              <i class="bi bi-star-fill text-warning me-2"></i>Explora partidos de las mejores ligas del mundo, comenta y conecta con otros aficionados
            </p>
            <div class="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start hero-buttons" style="position: relative; z-index: 10;">
              <button type="button" class="btn btn-primary btn-lg px-4 hero-btn" (click)="navigateToMatches()" style="position: relative; z-index: 10; cursor: pointer;">
                <i class="bi bi-calendar-event me-2"></i>Ver Partidos
              </button>
              <button *ngIf="!isAuthenticated" type="button" class="btn btn-success btn-lg px-4 hero-btn" (click)="navigateToRegister()" style="position: relative; z-index: 10; cursor: pointer;">
                <i class="bi bi-person-plus me-2"></i>Registrarse
              </button>
              <button *ngIf="!isAuthenticated" type="button" class="btn btn-outline-light btn-lg px-4 hero-btn" (click)="navigateToLogin()" style="position: relative; z-index: 10; cursor: pointer;">
                <i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión
              </button>
              <button *ngIf="isAuthenticated" type="button" class="btn btn-info btn-lg px-4 hero-btn" (click)="navigateToProfile()" style="position: relative; z-index: 10; cursor: pointer;">
                <i class="bi bi-person-circle me-2"></i>Ver Perfil
              </button>
              <button *ngIf="isAuthenticated && isAdmin" type="button" class="btn btn-warning btn-lg px-4 hero-btn" (click)="navigateToAdmin()" style="position: relative; z-index: 10; cursor: pointer;">
                <i class="bi bi-shield-check me-2"></i>Administración
              </button>
              <button *ngIf="isAuthenticated" type="button" class="btn btn-outline-light btn-lg px-4 hero-btn" (click)="logout()" style="position: relative; z-index: 10; cursor: pointer;">
                <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
              </button>
              <button type="button" class="btn btn-danger btn-lg px-4 hero-btn pulse-btn" (click)="loadLiveMatches()" [disabled]="loadingLive || syncing" style="position: relative; z-index: 10; cursor: pointer;">
                <span *ngIf="loadingLive || syncing" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!loadingLive && !syncing" class="bi bi-broadcast me-2"></i>
                {{ (loadingLive || syncing) ? 'Cargando...' : 'Partidos en Vivo' }}
              </button>
            </div>
          </div>
          <div class="col-lg-6 text-center mt-4 mt-lg-0">
            <div class="hero-image">
              <div class="football-icon">⚽</div>
              <div class="glow-effect"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Matches Section -->
    <div *ngIf="showLiveMatches" class="bg-dark text-white py-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="mb-0">
            <i class="bi bi-broadcast me-2"></i>Partidos en Vivo
          </h2>
          <button class="btn btn-outline-light btn-sm" (click)="showLiveMatches = false">
            <i class="bi bi-x me-1"></i>Ocultar
          </button>
        </div>
        <div *ngIf="liveMatches.length === 0" class="text-center py-4">
          <p class="text-muted">No hay partidos en vivo en este momento</p>
        </div>
        <div *ngIf="liveMatches.length > 0" class="row g-3">
          <div *ngFor="let match of liveMatches" class="col-md-6 col-lg-4">
            <div class="card bg-dark border-light">
              <div class="card-body">
                <h6 class="card-title text-warning mb-3">
                  <i class="bi bi-trophy me-1"></i>{{ match.competition }}
                </h6>
                
                <!-- Equipos -->
                <div class="match-teams mb-3">
                  <div class="team-row">
                    <div class="team-name text-end flex-grow-1">
                      <strong class="text-white">{{ match.home_team }}</strong>
                    </div>
                    <div class="score-section mx-3">
                      <span class="badge bg-danger d-inline-flex align-items-center justify-content-center" style="min-width: 50px; height: 24px;">
                        LIVE
                      </span>
                    </div>
                    <div class="team-name text-start flex-grow-1">
                      <strong class="text-white">{{ match.away_team }}</strong>
                    </div>
                  </div>
                </div>
                
                <!-- Resultado -->
                <div class="text-center mb-3">
                  <h3 class="text-danger mb-0 fw-bold">
                    {{ match.home_score ?? 0 }} - {{ match.away_score ?? 0 }}
                  </h3>
                </div>
                
                <!-- Botón ver detalles -->
                <div class="text-center mt-3">
                  <a [routerLink]="['/match', match.id]" class="btn btn-sm btn-outline-light w-100">
                    <i class="bi bi-eye me-1"></i>Ver Detalles
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- News Section -->
    <div class="news-section-wrapper">
      <div class="container my-5">
        <div class="row text-center mb-4">
          <div class="col-12">
            <div class="section-header">
              <div class="section-icon-wrapper">
                <i class="bi bi-newspaper section-icon"></i>
              </div>
              <h2 class="fw-bold mb-3 section-title">
                Noticias de Fútbol
              </h2>
              <div class="section-divider"></div>
              <p class="text-muted section-subtitle">Últimas noticias de las principales ligas del mundo</p>
            </div>
          </div>
        </div>
      
      <div *ngIf="loadingNews" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando noticias...</span>
        </div>
        <p class="mt-3 text-muted">Cargando noticias...</p>
      </div>
      
      <div *ngIf="!loadingNews && news.length === 0" class="text-center py-4">
        <p class="text-muted">No hay noticias disponibles en este momento</p>
      </div>
      
      <div *ngIf="!loadingNews && news.length > 0" class="row g-4">
        <div *ngFor="let article of news; let i = index" class="col-md-6 col-lg-4">
          <div class="card news-card h-100" [style.animation-delay]="(i * 0.1) + 's'">
            <div class="news-image-wrapper">
              <img [src]="article.image" [alt]="article.title" class="card-img-top news-image" 
                   (error)="$event.target.src='https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop'">
              <div class="news-overlay"></div>
            </div>
            <div class="card-body d-flex flex-column">
              <div class="news-category-badge mb-2">
                <i class="bi bi-newspaper me-1"></i>Noticia
              </div>
              <h5 class="card-title news-title">{{ article.title }}</h5>
              <p class="card-text text-muted flex-grow-1 news-description">{{ article.description | slice:0:120 }}{{ article.description.length > 120 ? '...' : '' }}</p>
              <div class="mt-auto">
                <small class="text-muted d-block mb-2 news-date">
                  <i class="bi bi-clock me-1"></i>{{ formatNewsDate(article.publishedAt) }}
                </small>
                <a [href]="article.url" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm w-100 news-btn">
                  <i class="bi bi-arrow-right me-1"></i>Ver Detalles
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section-wrapper">
      <div class="container my-5">
        <div class="row text-center mb-5">
          <div class="col-12">
            <div class="section-header">
              <div class="section-icon-wrapper">
                <i class="bi bi-star-fill section-icon"></i>
              </div>
              <h2 class="fw-bold mb-3 section-title">¿Por qué Orsai?</h2>
              <div class="section-divider"></div>
              <p class="text-muted section-subtitle">La mejor experiencia para los amantes del fútbol</p>
            </div>
          </div>
        </div>
        <div class="row g-4">
          <div class="col-md-4" *ngFor="let feature of features; let i = index">
            <div class="feature-card text-center p-4 h-100" [style.animation-delay]="(i * 0.15) + 's'">
              <div class="feature-icon-wrapper mb-3">
                <div class="feature-icon">{{ feature.icon }}</div>
                <div class="feature-icon-bg"></div>
              </div>
              <h4 class="feature-title">{{ feature.title }}</h4>
              <p class="text-muted feature-text">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section-wrapper">
      <div class="container my-5">
        <div class="row text-center g-4">
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <i class="bi bi-calendar-event stat-icon"></i>
              </div>
              <h3 class="text-primary fw-bold stat-number">{{ totalMatches }}</h3>
              <p class="text-muted mb-0 stat-label">Partidos Disponibles</p>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <i class="bi bi-trophy stat-icon"></i>
              </div>
              <h3 class="text-success fw-bold stat-number">7</h3>
              <p class="text-muted mb-0 stat-label">Ligas Principales</p>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <i class="bi bi-clock stat-icon"></i>
              </div>
              <h3 class="text-warning fw-bold stat-number">24/7</h3>
              <p class="text-muted mb-0 stat-label">Actualización</p>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <i class="bi bi-heart stat-icon"></i>
              </div>
              <h3 class="text-info fw-bold stat-number">100%</h3>
              <p class="text-muted mb-0 stat-label">Gratis</p>
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
    }
    :host-context(body.dark-theme) .search-bar-top {
      background-color: #121212;
      border-bottom: 1px solid #333;
    }
    
    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 100px 0 80px;
      position: relative;
      overflow: hidden;
    }
    :host-context(body.dark-theme) .hero-section {
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
    }
    .hero-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 20%, rgba(255,255,255,0.05) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }
    .floating-elements {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 1;
    }
    .floating-icon {
      position: absolute;
      font-size: 3rem;
      opacity: 0.2;
      animation: float 6s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-30px) rotate(10deg); }
    }
    .hero-section .container {
      position: relative;
      z-index: 2;
    }
    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
      background-size: cover;
      opacity: 0.3;
      pointer-events: none !important;
      z-index: 0;
    }
    .hero-section .row {
      position: relative;
      z-index: 2;
    }
    .hero-section button {
      position: relative !important;
      z-index: 10 !important;
      pointer-events: auto !important;
      cursor: pointer !important;
    }
    .hero-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      padding: 8px 20px;
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .badge-text {
      color: white;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .hero-title {
      animation: fadeInUp 0.8s ease-out;
      text-shadow: 2px 2px 10px rgba(0,0,0,0.2);
    }
    .hero-emoji {
      display: inline-block;
      animation: rotate 3s ease-in-out infinite;
    }
    @keyframes rotate {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-10deg); }
      75% { transform: rotate(10deg); }
    }
    .hero-subtitle {
      animation: fadeInUp 0.8s ease-out 0.2s both;
    }
    .hero-description {
      animation: fadeInUp 0.8s ease-out 0.4s both;
    }
    .hero-buttons {
      animation: fadeInUp 0.8s ease-out 0.6s both;
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .hero-btn {
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .hero-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }
    .pulse-btn {
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4); }
      50% { box-shadow: 0 4px 25px rgba(220, 53, 69, 0.7); }
    }
    .min-vh-50 {
      min-height: 50vh;
    }
    .hero-image {
      position: relative;
      animation: fadeInRight 1s ease-out 0.3s both;
    }
    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .football-icon {
      font-size: 200px;
      animation: bounce 2s infinite;
      filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
      position: relative;
      z-index: 2;
    }
    .glow-effect {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
      border-radius: 50%;
      animation: pulse-glow 3s ease-in-out infinite;
      z-index: 1;
    }
    @keyframes pulse-glow {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
      50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(10deg); }
    }
    
    /* News Section */
    .news-section-wrapper {
      background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
      padding: 40px 0;
    }
    .section-header {
      margin-bottom: 3rem;
    }
    .section-icon-wrapper {
      display: inline-block;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
      animation: iconFloat 3s ease-in-out infinite;
      position: relative;
    }
    @keyframes iconFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .section-icon {
      font-size: 2.5rem;
      color: white !important;
      display: block;
      line-height: 1;
      z-index: 2;
      position: relative;
    }
    .section-title {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .section-divider {
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, transparent, #667eea, transparent);
      margin: 1rem auto 1.5rem;
      border-radius: 2px;
    }
    .section-subtitle {
      font-size: 1.1rem;
    }
    .news-card {
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      overflow: hidden;
      border: none;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      animation: fadeInUp 0.6s ease-out both;
    }
    .news-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
    }
    .news-image-wrapper {
      position: relative;
      overflow: hidden;
      height: 200px;
    }
    .news-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .news-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .news-card:hover .news-overlay {
      opacity: 1;
    }
    .news-card:hover .news-image {
      transform: scale(1.1);
    }
    .news-category-badge {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .news-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.75rem;
      line-height: 1.4;
    }
    .news-description {
      font-size: 0.9rem;
      line-height: 1.6;
      color: #6c757d;
    }
    .news-date {
      font-size: 0.85rem;
    }
    .news-btn {
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }
    .news-btn::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }
    .news-btn:hover::before {
      width: 300px;
      height: 300px;
    }
    
    /* Features Section */
    .features-section-wrapper {
      background: #ffffff;
      padding: 40px 0;
    }
    .feature-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 20px;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 2px solid transparent;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      animation: fadeInUp 0.6s ease-out both;
      position: relative;
      overflow: hidden;
    }
    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
      transition: left 0.5s;
    }
    .feature-card:hover::before {
      left: 100%;
    }
    .feature-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 35px rgba(102, 126, 234, 0.2);
      border-color: #667eea;
    }
    .feature-icon-wrapper {
      position: relative;
      display: inline-block;
    }
    .feature-icon {
      font-size: 64px;
      position: relative;
      z-index: 2;
      transition: transform 0.3s;
    }
    .feature-card:hover .feature-icon {
      transform: scale(1.1) rotate(5deg);
    }
    .feature-icon-bg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      border-radius: 50%;
      z-index: 1;
      transition: transform 0.3s;
    }
    .feature-card:hover .feature-icon-bg {
      transform: translate(-50%, -50%) scale(1.3);
    }
    .feature-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
    }
    .feature-text {
      font-size: 0.95rem;
      line-height: 1.6;
    }
    
    /* Stats Section */
    .stats-section-wrapper {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 60px 0;
      position: relative;
      overflow: hidden;
    }
    :host-context(body.dark-theme) .stats-section-wrapper {
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
    }
    .stats-section-wrapper::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.05)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
      background-size: cover;
      opacity: 0.3;
    }
    .stat-card {
      padding: 30px 20px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
      animation: fadeInUp 0.6s ease-out both;
    }
    .stat-card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      transition: transform 0.5s;
    }
    .stat-card:hover::before {
      transform: scale(1.5);
    }
    .stat-card:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .stat-icon-wrapper {
      width: 70px;
      height: 70px;
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      transition: transform 0.3s;
      border: 2px solid rgba(255, 255, 255, 0.3);
      position: relative;
    }
    .stat-card:hover .stat-icon-wrapper {
      transform: scale(1.1) rotate(5deg);
      background: rgba(255, 255, 255, 0.35);
    }
    .stat-icon {
      font-size: 2rem !important;
      color: white !important;
      display: block;
      line-height: 1;
      z-index: 2;
      position: relative;
    }
    .stat-number {
      font-size: 3rem;
      color: white;
      text-shadow: 2px 2px 10px rgba(0,0,0,0.2);
      margin-bottom: 0.5rem;
    }
    .stat-label {
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.95rem;
      font-weight: 500;
    }
    .match-teams {
      padding: 0.5rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .team-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .team-name {
      font-size: 0.95rem;
      flex: 1;
    }
    .score-section {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Modo Oscuro - Home Component */
    :host-context(body.dark-theme) .news-section-wrapper {
      background: linear-gradient(to bottom, #1e1e1e 0%, #121212 100%);
    }
    :host-context(body.dark-theme) .news-card {
      background-color: #2d2d2d;
      color: #e0e0e0;
    }
    :host-context(body.dark-theme) .news-title {
      color: #e0e0e0;
    }
    :host-context(body.dark-theme) .news-description {
      color: #aaa;
    }
    :host-context(body.dark-theme) .features-section-wrapper {
      background: #1e1e1e;
    }
    :host-context(body.dark-theme) .feature-card {
      background: linear-gradient(135deg, #2d2d2d 0%, #1e1e1e 100%);
      color: #e0e0e0;
    }
    :host-context(body.dark-theme) .feature-title {
      color: #e0e0e0;
    }
    :host-context(body.dark-theme) .feature-text {
      color: #aaa;
    }
    :host-context(body.dark-theme) .section-title {
      background: linear-gradient(135deg, #8b9aff 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    :host-context(body.dark-theme) .section-subtitle {
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .text-muted {
      color: #aaa !important;
    }
    :host-context(body.dark-theme) .bg-dark {
      background-color: #1a202c !important;
    }
    :host-context(body.dark-theme) .bg-dark.text-white {
      background-color: #1a202c !important;
    }
    :host-context(body.dark-theme) .bg-dark .text-muted {
      color: #ccc !important;
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isAdmin = false;
  liveMatches: any[] = [];
  loadingLive = false;
  syncing = false;
  totalMatches = 0;
  showLiveMatches = false;
  news: News[] = [];
  loadingNews = false;
  private destroy$ = new Subject<void>();
  
  features = [
    {
      icon: '🏆',
      title: 'Ligas Principales',
      description: 'Sigue las mejores ligas: Premier League, La Liga, Serie A, Bundesliga y más'
    },
    {
      icon: '💬',
      title: 'Comunidad',
      description: 'Comparte tus opiniones y debate con otros aficionados del fútbol'
    },
    {
      icon: '⚡',
      title: 'Tiempo Real',
      description: 'Información actualizada de partidos en vivo y resultados'
    }
  ];

  constructor(
    private authService: AuthService,
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.checkAdminStatus();
    }
    this.loadTotalMatches();
    this.loadNews();
  }

  checkAdminStatus() {
    console.log('Verificando estado de admin...');
    this.api.isAdmin().subscribe({
      next: (response) => {
        console.log('Respuesta de isAdmin:', response);
        this.isAdmin = response.isAdmin;
        console.log('isAdmin establecido a:', this.isAdmin);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al verificar admin:', error);
        this.isAdmin = false;
      }
    });
  }

  navigateToAdmin() {
    this.router.navigate(['/admin']);
  }

  loadTotalMatches() {
    this.api.getMatches().subscribe({
      next: (response) => {
        this.totalMatches = response.matches?.length || 0;
      },
      error: () => {
        this.totalMatches = 0;
      }
    });
  }

  loadLiveMatches() {
    if (this.syncing || this.loadingLive) return;
    
    this.syncing = true;
    this.loadingLive = true;
    this.showLiveMatches = false;
    this.liveMatches = [];
    
    this.api.syncMatches().subscribe({
      next: () => {
        this.api.getMatches().subscribe({
          next: (response) => {
            this.liveMatches = (response.matches || []).filter((m: any) => m.status === 'LIVE');
            this.loadingLive = false;
            this.syncing = false;
            this.showLiveMatches = true;
            this.cdr.detectChanges();
            
            if (this.liveMatches.length === 0) {
              alert('No hay partidos en vivo en este momento');
              this.showLiveMatches = false;
              this.cdr.detectChanges();
            } else {
              setTimeout(() => {
                const element = document.querySelector('.bg-dark.text-white.py-5');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 200);
            }
          },
          error: () => {
            this.loadingLive = false;
            this.syncing = false;
            this.showLiveMatches = false;
            alert('Error al cargar partidos en vivo');
          }
        });
      },
      error: () => {
        this.loadingLive = false;
        this.syncing = false;
        this.showLiveMatches = false;
        alert('Error al sincronizar partidos. Verifica tu conexión.');
      }
    });
  }

  navigateToMatches() {
    this.router.navigate(['/matches']);
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

  logout() {
    this.authService.logout();
  }

  loadNews() {
    // Resetear el estado antes de cargar
    this.loadingNews = true;
    this.news = [];
    this.cdr.detectChanges();
    
    this.api.getNews().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.news = (response.news || []).slice(0, 9);
        this.loadingNews = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar noticias:', error);
        this.news = [];
        this.loadingNews = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatNewsDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Hace menos de una hora';
    if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    if (days < 7) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
