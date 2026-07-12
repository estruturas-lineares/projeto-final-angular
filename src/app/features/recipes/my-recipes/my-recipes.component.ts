import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Recipe } from '../../../core/models/recipe.model';
import { RecipeService } from '../../../core/services/recipe.service';
import { RecipeCardComponent } from '../../../shared/components/recipe-card/recipe-card.component';

@Component({
  selector: 'rc-my-recipes',
  standalone: true,
  templateUrl: './my-recipes.component.html',
  styleUrl: './my-recipes.component.scss',
  imports: [RouterLink, RecipeCardComponent],
})
export class MyRecipesComponent {
  private recipeService = inject(RecipeService);
  private auth = inject(AuthService);
  
  readonly loading = signal(true);
  readonly myRecipes = signal<Recipe[]>([]);

  ngOnInit() : void{
    const authorId = this.auth.currentUser()?.id;
    this.recipeService.list({ authorId, pageSize: 50 }).subscribe({
      next: (res) => {
        this.myRecipes.set(res.results);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
