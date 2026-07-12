import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Recipe } from '../../../core/models/recipe.model';

@Component({
  selector: 'rc-recipe-card',
  standalone: true,
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
  imports: [RouterLink],
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: Recipe;
  @Output() favoriteToggled = new EventEmitter<Recipe>();

  readonly difficultyLabel: Record<string, string> = {
    facil: 'Fácil',
    medio: 'Médio',
    dificil: 'Difícil',
  };

  onFavoriteClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoriteToggled.emit(this.recipe);
  }
}
