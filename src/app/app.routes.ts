import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
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
