export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

export interface Ingredient {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeStep {
  id?: string;
  order: number;
  description: string;
}

export interface RecipeAuthor {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: RecipeDifficulty;
  prepTimeMinutes: number;
  servings: number;
  coverImageUrl?: string | null;
  videoUrl?: string | null;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  author: RecipeAuthor;
  createdAt: string;
  updatedAt: string;
  favoritesCount: number;
  isFavoritedByMe?: boolean;
}

export interface RecipePayload {
  title: string;
  description: string;
  category: string;
  difficulty: RecipeDifficulty;
  prepTimeMinutes: number;
  servings: number;
  coverImageBase64?: string | null;
  videoUrl?: string | null;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}

export interface RecipeListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  authorId?: string;
}

export interface PagedResult<T> {
  results: T[];
  count: number;
  previousPage: string | null;
  nextPage: string | null;
}
