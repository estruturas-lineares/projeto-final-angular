import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../models/user.model';

const STORAGE_TOKEN_KEY = 'rc_token';
const STORAGE_USER_KEY = 'rc_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<User | null>(this.readStoredUser());
  private readonly _token = signal<string | null>(localStorage.getItem(STORAGE_TOKEN_KEY));

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token() && !!this._currentUser());
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  constructor(private http: HttpClient, private router: Router) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap((res) => this.persistSession(res)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap((res) => this.persistSession(res)));
  }

  updateProfile(payload: { name: string; avatarBase64?: string | null }): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/me`, payload).pipe(
      tap((user) => {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
        this._currentUser.set(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    this._token.set(null);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private persistSession(res: AuthResponse): void {
    localStorage.setItem(STORAGE_TOKEN_KEY, res.token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(res.user));
    this._token.set(res.token);
    this._currentUser.set(res.user);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
