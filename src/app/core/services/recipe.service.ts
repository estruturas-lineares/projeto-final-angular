import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult, Recipe, RecipeListParams, RecipePayload } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly baseUrl = `${environment.apiUrl}/recipes`;

  private readonly _recipes = signal<Recipe[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _total = signal<number>(0);

  readonly recipes = this._recipes.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly total = this._total.asReadonly();
  readonly isEmpty = computed(() => !this._loading() && this._recipes().length === 0);

  constructor(private http: HttpClient) {}

  list(params: RecipeListParams = {}): Observable<PagedResult<Recipe>> {
    this._loading.set(true);
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return this.http.get<PagedResult<Recipe>>(this.baseUrl, { params: httpParams }).pipe(
      tap({
        next: (res) => {
          this._recipes.set(res.results);
          this._total.set(res.count);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      })
    );
  }

  search(query: string): Observable<PagedResult<Recipe>>{
    this._loading.set(true);
    return this.http.get<PagedResult<Recipe>>(`${this.baseUrl}/search/${query}`).pipe(
      tap({
        next: (res) => {
          this._recipes.set(res.results);
          this._total.set(res.count);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      })
    );
  }

  getById(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.baseUrl}/${id}`);
  }

  create(payload: RecipePayload): Observable<Recipe> {
    return this.http.post<Recipe>(`${this.baseUrl}/`, payload);
  }

  update(id: string, payload: RecipePayload): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.baseUrl}/${id}/`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}/`)
      .pipe(tap(() => this._recipes.update((list) => list.filter((r) => r.id !== id))));
  }

  toggleFavorite(id: string): Observable<Recipe> {
    return this.http.post<Recipe>(`${this.baseUrl}/${id}/favorite/`, {});
  }

  patchLocalRecipe(updated: Recipe): void {
    this._recipes.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
  }

  deleteVideoTutorial(id: string){
    return this.http
      .delete<void>(`${this.baseUrl}/${id}/video/`)
      .pipe(tap(() => this._recipes.update((list) => list.filter((r) => r.id !== id))));
  }
}
