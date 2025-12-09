import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { UserSearchComponent } from '../user-search/user-search.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UserSearchComponent],
  template: `
    <div class="admin-page-wrapper">
      <div class="container mt-4 mb-5">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1><i class="bi bi-shield-check me-2"></i>Panel de Administración</h1>
        <button class="btn btn-secondary" (click)="navigateToHome()">
          <i class="bi bi-house me-2"></i>Volver al Inicio
        </button>
      </div>
      
      <!-- Barra de búsqueda de usuarios -->
      <div class="search-bar-top mb-4">
        <div class="d-flex justify-content-end">
          <app-user-search></app-user-search>
        </div>
      </div>

      <div *ngIf="!isAdmin" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>
        No tienes permisos de administrador para acceder a esta sección.
      </div>

      <div *ngIf="isAdmin">
        <!-- Herramientas de Administración -->
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-tools me-2"></i>Herramientas de Administración</h5>
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-info" (click)="generateFakeComments()" [disabled]="generatingComments">
                <span *ngIf="generatingComments" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!generatingComments" class="bi bi-chat-square-text me-2"></i>
                {{ generatingComments ? 'Generando...' : 'Generar Comentarios Ficticios' }}
              </button>
            </div>
            <div *ngIf="fakeCommentsMessage" class="alert mt-3 mb-0" [ngClass]="fakeCommentsMessageType === 'success' ? 'alert-success' : 'alert-danger'">
              {{ fakeCommentsMessage }}
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <ul class="nav nav-tabs mb-4" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link" [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">
              <i class="bi bi-people me-2"></i>Usuarios
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" [class.active]="activeTab === 'comments'" (click)="activeTab = 'comments'">
              <i class="bi bi-chat-dots me-2"></i>Comentarios
            </button>
          </li>
        </ul>

        <!-- Tab: Usuarios -->
        <div *ngIf="activeTab === 'users'" class="tab-content">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3>Gestión de Usuarios</h3>
            <button class="btn btn-primary" (click)="showCreateUserForm = !showCreateUserForm">
              <i class="bi bi-plus-circle me-2"></i>Crear Usuario
            </button>
          </div>

          <!-- Formulario de creación -->
          <div *ngIf="showCreateUserForm" class="card mb-4">
            <div class="card-body">
              <h5>Crear Nuevo Usuario</h5>
              <form (ngSubmit)="createUser()">
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Usuario</label>
                    <input type="text" class="form-control" [(ngModel)]="newUser.username" name="username" required>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Contraseña</label>
                    <input type="password" class="form-control" [(ngModel)]="newUser.password" name="password" required>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" [(ngModel)]="newUser.email" name="email">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Rol</label>
                  <select class="form-select" [(ngModel)]="newUser.role" name="role">
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-success" [disabled]="creatingUser">
                    <span *ngIf="creatingUser" class="spinner-border spinner-border-sm me-2"></span>
                    Crear Usuario
                  </button>
                  <button type="button" class="btn btn-secondary" (click)="showCreateUserForm = false">Cancelar</button>
                </div>
              </form>
            </div>
          </div>

          <!-- Lista de usuarios -->
          <div *ngIf="loadingUsers" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Cargando usuarios...</p>
          </div>

          <div *ngIf="!loadingUsers && users.length > 0" class="table-responsive">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Karma</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users">
                  <td>{{ user.id }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email || '-' }}</td>
                  <td>
                    <span class="badge" [ngClass]="user.role === 'admin' ? 'bg-danger' : 'bg-primary'">
                      {{ user.role === 'admin' ? 'Admin' : 'Usuario' }}
                    </span>
                  </td>
                  <td>{{ user.karma || 0 }}</td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td>
                    <button class="btn btn-sm btn-warning me-2" (click)="editUser(user)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" (click)="deleteUser(user.id)" [disabled]="user.id === currentUserId">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab: Comentarios -->
        <div *ngIf="activeTab === 'comments'" class="tab-content">
          <h3 class="mb-3">Gestión de Comentarios</h3>

          <div *ngIf="loadingComments" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Cargando comentarios...</p>
          </div>

          <div *ngIf="!loadingComments && comments.length > 0" class="table-responsive">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Partido</th>
                  <th>Comentario</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let comment of comments">
                  <td>{{ comment.id }}</td>
                  <td>{{ comment.display_name || comment.username }}</td>
                  <td>{{ comment.home_team }} vs {{ comment.away_team }}</td>
                  <td class="text-truncate" style="max-width: 300px;">{{ comment.content }}</td>
                  <td>{{ formatDate(comment.created_at) }}</td>
                  <td>
                    <button class="btn btn-sm btn-danger" (click)="deleteComment(comment.id)">
                      <i class="bi bi-trash"></i> Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </div>
  `,
  styles: [`
    .admin-page-wrapper {
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    :host-context(body.dark-theme) .admin-page-wrapper {
      background-color: #121212 !important;
    }
    
    .nav-tabs .nav-link {
      cursor: pointer;
    }
    .table-responsive {
      max-height: 600px;
      overflow-y: auto;
    }
    
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
    
    /* Modo Oscuro - Admin */
    :host-context(body.dark-theme) {
      background-color: #121212;
    }
    :host-context(body.dark-theme) .container {
      background-color: transparent;
    }
    :host-context(body.dark-theme) h1 {
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) h3 {
      color: #e0e0e0 !important;
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
      background-color: #1e1e1e !important;
      border-bottom-color: #444 !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .table {
      color: #e0e0e0 !important;
      background-color: #2d2d2d !important;
    }
    :host-context(body.dark-theme) .table thead {
      background-color: #1e1e1e !important;
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .table thead th {
      background-color: #1e1e1e !important;
      color: #e0e0e0 !important;
      border-color: #444 !important;
    }
    :host-context(body.dark-theme) .table tbody {
      background-color: #2d2d2d !important;
    }
    :host-context(body.dark-theme) .table tbody td {
      background-color: inherit !important;
      color: #e0e0e0 !important;
      border-color: #444 !important;
    }
    :host-context(body.dark-theme) .table-striped > tbody > tr:nth-of-type(odd) {
      background-color: #1e1e1e !important;
    }
    :host-context(body.dark-theme) .table-striped > tbody > tr:nth-of-type(odd) > td {
      background-color: #1e1e1e !important;
    }
    :host-context(body.dark-theme) .table-striped > tbody > tr:nth-of-type(even) {
      background-color: #2d2d2d !important;
    }
    :host-context(body.dark-theme) .table-striped > tbody > tr:nth-of-type(even) > td {
      background-color: #2d2d2d !important;
    }
    :host-context(body.dark-theme) .table-hover > tbody > tr:hover {
      background-color: #3d3d3d !important;
    }
    :host-context(body.dark-theme) .table-hover > tbody > tr:hover > td {
      background-color: #3d3d3d !important;
    }
    :host-context(body.dark-theme) .table td,
    :host-context(body.dark-theme) .table th {
      border-color: #444 !important;
    }
    :host-context(body.dark-theme) .nav-tabs {
      border-bottom-color: #444 !important;
    }
    :host-context(body.dark-theme) .nav-tabs .nav-link {
      color: #aaa !important;
      background-color: transparent !important;
      border-color: transparent transparent #444 transparent !important;
    }
    :host-context(body.dark-theme) .nav-tabs .nav-link:hover {
      color: #e0e0e0 !important;
      background-color: #2d2d2d !important;
      border-color: #555 #555 #444 #555 !important;
    }
    :host-context(body.dark-theme) .nav-tabs .nav-link.active {
      color: #e0e0e0 !important;
      background-color: transparent !important;
      border-color: #444 #444 transparent #444 !important;
    }
    :host-context(body.dark-theme) .form-label {
      color: #e0e0e0 !important;
    }
    :host-context(body.dark-theme) .form-control {
      background-color: #2d2d2d !important;
      border-color: #444 !important;
      color: #e0e0e0 !important;
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
    :host-context(body.dark-theme) p {
      color: #e0e0e0 !important;
    }
  `]
})
export class AdminComponent implements OnInit {
  isAdmin = false;
  activeTab: 'users' | 'comments' = 'users';
  loadingUsers = false;
  loadingComments = false;
  creatingUser = false;
  users: any[] = [];
  comments: any[] = [];
  showCreateUserForm = false;
  editingUser: any = null;
  newUser: any = {
    username: '',
    password: '',
    email: '',
    role: 'user'
  };
  currentUserId: number | null = null;
  generatingComments = false;
  fakeCommentsMessage = '';
  fakeCommentsMessageType: 'success' | 'error' = 'success';

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

    const user = this.authService.getUser();
    if (user) {
      this.currentUserId = user.id;
    }

    this.checkAdmin();
  }

  checkAdmin() {
    this.api.isAdmin().subscribe({
      next: (response) => {
        this.isAdmin = response.isAdmin;
        if (this.isAdmin) {
          this.loadUsers();
          this.loadComments();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isAdmin = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadUsers() {
    this.loadingUsers = true;
    this.api.adminGetUsers().subscribe({
      next: (response) => {
        this.users = response.users;
        this.loadingUsers = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.loadingUsers = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadComments() {
    this.loadingComments = true;
    this.api.adminGetComments().subscribe({
      next: (response) => {
        this.comments = response.comments;
        this.loadingComments = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar comentarios:', error);
        this.loadingComments = false;
        this.cdr.detectChanges();
      }
    });
  }

  createUser() {
    this.creatingUser = true;
    this.api.adminCreateUser(this.newUser).subscribe({
      next: () => {
        this.creatingUser = false;
        this.showCreateUserForm = false;
        this.newUser = { username: '', password: '', email: '', role: 'user' };
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        this.creatingUser = false;
        alert(error.error?.error || 'Error al crear usuario');
      }
    });
  }

  editUser(user: any) {
    this.editingUser = { ...user };
    // Implementar modal o formulario de edición
    alert('Funcionalidad de edición en desarrollo');
  }

  deleteUser(userId: number) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.api.adminDeleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          alert(error.error?.error || 'Error al eliminar usuario');
        }
      });
    }
  }

  deleteComment(commentId: number) {
    if (confirm('¿Estás seguro de eliminar este comentario?')) {
      this.api.adminDeleteComment(commentId).subscribe({
        next: () => {
          this.loadComments();
        },
        error: (error) => {
          alert(error.error?.error || 'Error al eliminar comentario');
        }
      });
    }
  }

  generateFakeComments() {
    if (!confirm('¿Generar comentarios ficticios para todos los partidos? Esto creará usuarios ficticios y comentarios contextualizados.')) {
      return;
    }

    this.generatingComments = true;
    this.fakeCommentsMessage = '';
    
    this.api.generateFakeComments().subscribe({
      next: (response: any) => {
        this.generatingComments = false;
        this.fakeCommentsMessage = `${response.message}. Usuarios creados: ${response.users_created}, Comentarios creados: ${response.comments_created}, Partidos procesados: ${response.matches_processed}`;
        this.fakeCommentsMessageType = 'success';
        
        // Recargar comentarios después de un breve delay
        setTimeout(() => {
          this.loadComments();
        }, 1000);
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
          this.fakeCommentsMessage = '';
          this.cdr.detectChanges();
        }, 5000);
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.generatingComments = false;
        this.fakeCommentsMessage = error.error?.error || 'Error al generar comentarios ficticios';
        this.fakeCommentsMessageType = 'error';
        
        // Ocultar mensaje de error después de 5 segundos
        setTimeout(() => {
          this.fakeCommentsMessage = '';
          this.cdr.detectChanges();
        }, 5000);
        
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Argentina/Buenos_Aires'
    });
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}

