import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult, Recipe, RecipePayload } from '../models/recipe.model';
import { AuthResponse, LoginPayload, RegisterPayload } from '../models/user.model';
import { AuthService } from '../auth/auth.service';
import { MockUserRecord, SEED_RECIPES, SEED_USERS } from './mock-data';

/**
 * Simula, no navegador, os endpoints que o back-end real deve implementar:
 *
 *   POST   /api/auth/login          -> AuthResponse
 *   POST   /api/auth/register       -> AuthResponse
 *   PUT    /api/users/me            -> User
 *   GET    /api/recipes             -> PagedResult<Recipe>
 *   GET    /api/recipes/:id         -> Recipe
 *   POST   /api/recipes             -> Recipe
 *   PUT    /api/recipes/:id         -> Recipe
 *   DELETE /api/recipes/:id         -> void
 *   POST   /api/recipes/:id/favorite-> Recipe
 *
 * Quando a API real estiver pronta: `environment.useMockBackend = false`.
 * Nenhum componente ou serviço precisa ser alterado.
 */

const USERS_KEY = 'rc_mock_users';
const RECIPES_KEY = 'rc_mock_recipes';
const LATENCY = 450;

function loadUsers(): MockUserRecord[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
  return SEED_USERS;
}

function saveUsers(users: MockUserRecord[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadRecipes(): Recipe[] {
  const raw = localStorage.getItem(RECIPES_KEY);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(RECIPES_KEY, JSON.stringify(SEED_RECIPES));
  return SEED_RECIPES;
}

function saveRecipes(recipes: Recipe[]): void {
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

function fakeToken(userId: string): string {
  return btoa(`${userId}.${Date.now()}`);
}

function ok<T>(body: T, status = 200): Observable<any> {
  return of(new HttpResponse({ status, body })).pipe(delay(LATENCY));
}

function fail(status: number, message: string): Observable<any> {
  return throwError(() => new HttpErrorResponse({ status, error: { message } })).pipe(delay(LATENCY));
}

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMockBackend || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const path = req.url.replace(environment.apiUrl, '');

  // ---------- AUTH ----------
  if (path === '/auth/login' && req.method === 'POST') {
    const { email, password } = req.body as LoginPayload;
    const users = loadUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return fail(401, 'E-mail ou senha inválidos.');
    const { password: _pw, ...user } = found;
    return ok<AuthResponse>({ user, token: fakeToken(user.id) });
  }

  if (path === '/auth/register' && req.method === 'POST') {
    const { name, email, password } = req.body as RegisterPayload;
    const users = loadUsers();
    if (users.some((u) => u.email === email)) {
      return fail(409, 'Já existe uma conta com este e-mail.');
    }
    const newUser: MockUserRecord = {
      id: 'u' + Math.random().toString(36).slice(2, 9),
      name,
      email,
      password,
      avatarUrl: null,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    const { password: _pw, ...user } = newUser;
    return ok<AuthResponse>({ user, token: fakeToken(user.id) }, 201);
  }

  if (path === '/users/me' && req.method === 'PUT') {
    const users = loadUsers();
    const currentRaw = localStorage.getItem('rc_user');
    const current = currentRaw ? JSON.parse(currentRaw) : null;
    if (!current) return fail(401, 'Sessão expirada.');

    const idx = users.findIndex((u) => u.id === current.id);
    if (idx === -1) return fail(404, 'Usuário não encontrado.');

    const body = req.body as { name: string; avatarBase64?: string | null };
    users[idx] = { ...users[idx], name: body.name, avatarUrl: body.avatarBase64 ?? users[idx].avatarUrl };
    saveUsers(users);

    const { password: _pw, ...user } = users[idx];
    return ok(user);
  }

  // ---------- RECIPES ----------
  const recipeIdMatch = path.match(/^\/recipes\/([^/]+)$/);
  const favoriteMatch = path.match(/^\/recipes\/([^/]+)\/favorite$/);

  if (path === '/recipes' && req.method === 'GET') {
    let recipes = loadRecipes();
    const search = req.params.get('search');
    const category = req.params.get('category');
    const authorId = req.params.get('authorId');
    const page = Number(req.params.get('page') ?? 1);
    const pageSize = Number(req.params.get('pageSize') ?? 12);

    if (search) {
      const s = search.toLowerCase();
      recipes = recipes.filter((r) => r.title.toLowerCase().includes(s));
    }
    if (category) recipes = recipes.filter((r) => r.category === category);
    if (authorId) recipes = recipes.filter((r) => r.author.id === authorId);

    const total = recipes.length;
    const start = (page - 1) * pageSize;
    const items = recipes.slice(start, start + pageSize);
    return ok<PagedResult<Recipe>>({ items, total, page, pageSize });
  }

  if (path === '/recipes' && req.method === 'POST') {
    const payload = req.body as RecipePayload;
    const recipes = loadRecipes();
    const currentUser = auth.currentUser();
    const newRecipe: Recipe = {
      id: 'r' + Math.random().toString(36).slice(2, 9),
      title: payload.title,
      description: payload.description,
      category: payload.category,
      difficulty: payload.difficulty,
      prepTimeMinutes: payload.prepTimeMinutes,
      servings: payload.servings,
      coverImageUrl: payload.coverImageBase64 ?? null,
      videoUrl: payload.videoUrl ?? null,
      ingredients: payload.ingredients,
      steps: payload.steps,
      author: currentUser
        ? { id: currentUser.id, name: currentUser.name, avatarUrl: currentUser.avatarUrl }
        : { id: 'u1', name: 'Você', avatarUrl: null },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favoritesCount: 0,
      isFavoritedByMe: false,
    };
    saveRecipes([newRecipe, ...recipes]);
    return ok(newRecipe, 201);
  }

  if (favoriteMatch && req.method === 'POST') {
    const recipes = loadRecipes();
    const idx = recipes.findIndex((r) => r.id === favoriteMatch[1]);
    if (idx === -1) return fail(404, 'Receita não encontrada.');
    const current = recipes[idx];
    const updated: Recipe = {
      ...current,
      isFavoritedByMe: !current.isFavoritedByMe,
      favoritesCount: current.favoritesCount + (current.isFavoritedByMe ? -1 : 1),
    };
    recipes[idx] = updated;
    saveRecipes(recipes);
    return ok(updated);
  }

  if (recipeIdMatch && req.method === 'GET') {
    const recipes = loadRecipes();
    const found = recipes.find((r) => r.id === recipeIdMatch[1]);
    return found ? ok(found) : fail(404, 'Receita não encontrada.');
  }

  if (recipeIdMatch && req.method === 'PUT') {
    const recipes = loadRecipes();
    const idx = recipes.findIndex((r) => r.id === recipeIdMatch[1]);
    if (idx === -1) return fail(404, 'Receita não encontrada.');
    const payload = req.body as RecipePayload;
    const updated: Recipe = {
      ...recipes[idx],
      ...payload,
      coverImageUrl: payload.coverImageBase64 ?? recipes[idx].coverImageUrl,
      updatedAt: new Date().toISOString(),
    };
    recipes[idx] = updated;
    saveRecipes(recipes);
    return ok(updated);
  }

  if (recipeIdMatch && req.method === 'DELETE') {
    const recipes = loadRecipes();
    saveRecipes(recipes.filter((r) => r.id !== recipeIdMatch[1]));
    return ok(undefined, 200);
  }

  return fail(404, `Endpoint mock não implementado: ${req.method} ${path}`);
};
