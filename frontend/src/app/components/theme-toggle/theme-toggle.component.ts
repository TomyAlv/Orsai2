import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../core/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="theme-toggle-btn"
      (click)="toggleTheme()"
      [title]="isDarkMode() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    >
      <i [class]="isDarkMode() ? 'bi bi-sun-fill' : 'bi bi-moon-fill'"></i>
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .theme-toggle-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }
    .theme-toggle-btn:active {
      transform: scale(0.95);
    }
    .dark-theme .theme-toggle-btn {
      background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
    }
  `]
})
export class ThemeToggleComponent implements OnInit {
  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    // Aplicar tema inicial
    this.themeService.getTheme().subscribe(theme => {
      // El servicio ya aplica el tema automáticamente
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}






