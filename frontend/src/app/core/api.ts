/**
 * Servicio para comunicación con la API backend
 * Maneja todas las peticiones HTTP al servidor PHP
 */
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
}

export interface Match {
  id: number;
  api_match_id: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  match_date: string;
  competition: string;
}

export interface Comment {
  id: number;
  match_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
  profile_picture?: string;
  nationality?: string;
  display_name?: string;
  favorite_team?: string;
  karma?: number;
  upvotes?: number;
  downvotes?: number;
  score?: number;
  user_vote?: 'up' | 'down' | null;
}

export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  profile_picture?: string;
  nationality?: string;
  display_name?: string;
  favorite_team?: string;
  karma?: number;
  created_at: string;
}

export interface News {
  title: string;
  description: string;
  image: string;
  url: string;
  publishedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiBaseUrl;
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los headers HTTP incluyendo el token de autenticación si existe
   */
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  ping(): Observable<any> {
    return this.http.get(`${this.baseUrl}/index.php`, {
      params: { action: 'ping' }
    });
  }

  register(username: string, password: string, email?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/index.php?action=register`, {
      username,
      password,
      email
    });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/index.php?action=login`, {
      username,
      password
    });
  }

  getMatches(): Observable<{ status: string; matches: Match[] }> {
    return this.http.get<{ status: string; matches: Match[] }>(
      `${this.baseUrl}/index.php?action=matches`
    );
  }

  getMatchesHistory(): Observable<{ status: string; matches: Match[] }> {
    return this.http.get<{ status: string; matches: Match[] }>(
      `${this.baseUrl}/index.php?action=matches-history`
    );
  }

  getMatch(id: number): Observable<{ status: string; match: Match }> {
    return this.http.get<{ status: string; match: Match }>(
      `${this.baseUrl}/index.php?action=match&id=${id}`
    );
  }

  syncMatches(): Observable<any> {
    return this.http.post(`${this.baseUrl}/index.php?action=sync-matches`, {});
  }

  syncMatchesHistory(): Observable<any> {
    return this.http.post(`${this.baseUrl}/index.php?action=sync-matches-history`, {});
  }

  getComments(matchId: number): Observable<{ status: string; comments: Comment[] }> {
    return this.http.get<{ status: string; comments: Comment[] }>(
      `${this.baseUrl}/index.php?action=comments&match_id=${matchId}`
    );
  }

  createComment(matchId: number, content: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/index.php?action=comments`,
      { match_id: matchId, content },
      { headers: this.getHeaders() }
    );
  }

  getNews(): Observable<{ status: string; news: News[] }> {
    return this.http.get<{ status: string; news: News[] }>(
      `${this.baseUrl}/index.php?action=news`
    );
  }

  getProfile(): Observable<{ status: string; profile: UserProfile }> {
    const headers = this.getHeaders();
    console.log('Headers enviados:', headers.keys());
    return this.http.get<{ status: string; profile: UserProfile }>(
      `${this.baseUrl}/index.php?action=profile`,
      { headers }
    );
  }

  updateProfile(profile: Partial<UserProfile>): Observable<{ status: string; message: string; profile: UserProfile }> {
    return this.http.put<{ status: string; message: string; profile: UserProfile }>(
      `${this.baseUrl}/index.php?action=profile`,
      profile,
      { headers: this.getHeaders() }
    );
  }

  voteComment(commentId: number, voteType: 'up' | 'down'): Observable<{ status: string; message: string; upvotes: number; downvotes: number; score: number; user_vote: 'up' | 'down' | null }> {
    return this.http.post<{ status: string; message: string; upvotes: number; downvotes: number; score: number; user_vote: 'up' | 'down' | null }>(
      `${this.baseUrl}/index.php?action=vote`,
      { comment_id: commentId, vote_type: voteType },
      { headers: this.getHeaders() }
    );
  }

  getCommentVotes(commentId: number): Observable<{ status: string; upvotes: number; downvotes: number; score: number; user_vote: 'up' | 'down' | null }> {
    return this.http.get<{ status: string; upvotes: number; downvotes: number; score: number; user_vote: 'up' | 'down' | null }>(
      `${this.baseUrl}/index.php?action=comment-votes&comment_id=${commentId}`,
      { headers: this.getHeaders() }
    );
  }

  // Perfil público
  getPublicProfile(userId: number): Observable<{ status: string; profile: UserProfile }> {
    return this.http.get<{ status: string; profile: UserProfile }>(
      `${this.baseUrl}/index.php?action=public-profile&user_id=${userId}`
    );
  }

  // Subida de foto de perfil
  uploadProfilePicture(file: File): Observable<{ status: string; message: string; url: string }> {
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    const headers = new HttpHeaders();
    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return this.http.post<{ status: string; message: string; url: string }>(
      `${this.baseUrl}/upload_profile_picture.php`,
      formData,
      { headers }
    );
  }

  // Administración - Usuarios
  adminGetUsers(): Observable<{ status: string; users: any[] }> {
    return this.http.get<{ status: string; users: any[] }>(
      `${this.baseUrl}/index.php?action=admin-users`,
      { headers: this.getHeaders() }
    );
  }

  adminCreateUser(user: any): Observable<{ status: string; message: string; user: any }> {
    return this.http.post<{ status: string; message: string; user: any }>(
      `${this.baseUrl}/index.php?action=admin-users`,
      user,
      { headers: this.getHeaders() }
    );
  }

  adminUpdateUser(user: any): Observable<{ status: string; message: string; user: any }> {
    return this.http.put<{ status: string; message: string; user: any }>(
      `${this.baseUrl}/index.php?action=admin-users`,
      user,
      { headers: this.getHeaders() }
    );
  }

  adminDeleteUser(userId: number): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(
      `${this.baseUrl}/index.php?action=admin-users&user_id=${userId}`,
      { headers: this.getHeaders() }
    );
  }

  // Administración - Comentarios
  adminGetComments(): Observable<{ status: string; comments: any[] }> {
    return this.http.get<{ status: string; comments: any[] }>(
      `${this.baseUrl}/index.php?action=admin-comments`,
      { headers: this.getHeaders() }
    );
  }

  adminDeleteComment(commentId: number): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(
      `${this.baseUrl}/index.php?action=admin-comments&comment_id=${commentId}`,
      { headers: this.getHeaders() }
    );
  }

  // Verificar si el usuario es admin
  isAdmin(): Observable<{ status: string; isAdmin: boolean }> {
    return this.http.get<{ status: string; isAdmin: boolean }>(
      `${this.baseUrl}/index.php?action=check-admin`,
      { headers: this.getHeaders() }
    );
  }

  // Búsqueda de usuarios
  searchUsers(query: string): Observable<{ status: string; users: UserProfile[] }> {
    return this.http.get<{ status: string; users: UserProfile[] }>(
      `${this.baseUrl}/index.php?action=search-users&q=${encodeURIComponent(query)}`
    );
  }

  // Generar comentarios ficticios (solo admin)
  generateFakeComments(): Observable<{ status: string; message: string; users_created: number; comments_created: number; matches_processed: number }> {
    return this.http.post<{ status: string; message: string; users_created: number; comments_created: number; matches_processed: number }>(
      `${this.baseUrl}/index.php?action=generate-fake-comments`,
      {},
      { headers: this.getHeaders() }
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  }
}
