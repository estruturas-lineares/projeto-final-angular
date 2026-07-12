import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // ---- Rotas públicas ----
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
        title: 'Caderno de Receitas',
      },
      {
        path: 'receitas',
        loadComponent: () =>
          import('./features/recipes/recipe-list/recipe-list.component').then((m) => m.RecipeListComponent),
        title: 'Explorar receitas',
      },

      // ---- Rotas de visitante (bloqueadas para quem já está logado) ----
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
        title: 'Entrar',
      },
      {
        path: 'cadastro',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
        title: 'Criar conta',
      },

      // ---- Rotas protegidas (exigem autenticação) ----
      // IMPORTANTE: 'receitas/nova' precisa vir antes de 'receitas/:id'
      {
        path: 'receitas/nova',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/recipes/recipe-form/recipe-form.component').then((m) => m.RecipeFormComponent),
        title: 'Nova receita',
      },
      {
        path: 'receitas/:id/editar',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/recipes/recipe-form/recipe-form.component').then((m) => m.RecipeFormComponent),
        title: 'Editar receita',
      },
      {
        path: 'minhas-receitas',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/recipes/my-recipes/my-recipes.component').then((m) => m.MyRecipesComponent),
        title: 'Minhas receitas',
      },
      {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
        title: 'Meu perfil',
      },

      // ---- Rota pública dinâmica (precisa vir depois das rotas literais acima) ----
      {
        path: 'receitas/:id',
        loadComponent: () =>
          import('./features/recipes/recipe-detail/recipe-detail.component').then(
            (m) => m.RecipeDetailComponent
          ),
        title: 'Detalhes da receita',
      },

      { path: '**', redirectTo: '' },
    ],
  },
];
