import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Recipe } from '../../../core/models/recipe.model';
import { RecipeService } from '../../../core/services/recipe.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { VideoPlayerComponent } from '../../../shared/components/video-player/video-player.component';

@Component({
  selector: 'rc-recipe-detail',
  standalone: true,
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.scss',
  imports: [RouterLink, VideoPlayerComponent, ConfirmModalComponent],
})
export class RecipeDetailComponent implements OnChanges {
  @Input() id!: string;

  private recipeService = inject(RecipeService);
  readonly auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly recipe = signal<Recipe | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly showDeleteModal = signal(false);

  readonly difficultyLabel: Record<string, string> = {
    facil: 'Fácil',
    medio: 'Médio',
    dificil: 'Difícil',
  };

  ngOnChanges(): void {
    if (!this.id) return;
    this.loading.set(true);
    this.notFound.set(false);
    this.recipeService.getById(this.id).subscribe({
      next: (recipe) => {
        this.recipe.set(recipe);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  isAuthor(): boolean {
    return this.auth.currentUser()?.id === this.recipe()?.author.id;
  }

  toggleFavorite(): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Entre na sua conta para favoritar receitas.');
      return;
    }
    const current = this.recipe();
    if (!current) return;
    this.recipeService.toggleFavorite(current.id).subscribe({
      next: (data) => {
        let recipeObj = this.recipe()!;
        recipeObj.favoritesCount=data.favoritesCount;
        recipeObj.isFavoritedByMe=data.isFavoritedByMe;

        this.recipe.set(recipeObj);
      },
      error: () => this.toast.error('Não foi possível favoritar agora.'),
    });
  }

  deleteRecipe(): void {
    this.showDeleteModal.set(false);
    const current = this.recipe();
    if (!current) return;
    this.recipeService.delete(current.id).subscribe({
      next: () => {
        this.toast.success('Receita excluída.');
        this.router.navigateByUrl('/minhas-receitas');
      },
      error: () => this.toast.error('Não foi possível excluir a receita.'),
    });
  }
}
