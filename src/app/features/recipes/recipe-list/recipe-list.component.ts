import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { Recipe } from '../../../core/models/recipe.model';
import { RecipeService } from '../../../core/services/recipe.service';
import { ToastService } from '../../../core/services/toast.service';
import { RecipeCardComponent } from '../../../shared/components/recipe-card/recipe-card.component';

const CATEGORIES = ['Massas', 'Saudável', 'Sobremesas', 'Carnes', 'Vegano', 'Bebidas'];

@Component({
  selector: 'rc-recipe-list',
  standalone: true,
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.scss',
  imports: [FormsModule, RecipeCardComponent],
})
export class RecipeListComponent {
  private destroyRef = inject(DestroyRef);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  readonly recipeService = inject(RecipeService);

  readonly categories = CATEGORIES;
  readonly search = signal('');
  readonly category = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(9);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.recipeService.total() / this.pageSize())));

  constructor() {
    const queryParams = computed(() => ({
      search: this.search(),
      category: this.category(),
      page: this.page(),
      pageSize: this.pageSize(),
    }));

    toObservable(queryParams)
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        switchMap((params) => this.recipeService.list(params)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  onCategoryChange(value: string): void {
    this.category.set(value);
    this.page.set(1);
  }

  prevPage(): void {
    this.page.update((p) => Math.max(1, p - 1));
  }

  nextPage(): void {
    this.page.update((p) => Math.min(this.totalPages(), p + 1));
  }

  toggleFavorite(recipe: Recipe): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Entre na sua conta para favoritar receitas.');
      return;
    }
    this.recipeService.toggleFavorite(recipe.id).subscribe({
      next: (updated) => this.recipeService.patchLocalRecipe(updated),
      error: () => this.toast.error('Não foi possível favoritar agora.'),
    });
  }
}
