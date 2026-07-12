import { Recipe } from '../models/recipe.model';
import { User } from '../models/user.model';

export interface MockUserRecord extends User {
  password: string;
}

export const SEED_USERS: MockUserRecord[] = [
  {
    id: 'u1',
    name: 'Ana Beatriz',
    email: 'ana@exemplo.com',
    password: 'Senha@123',
    avatarUrl: null,
    role: 'user',
    createdAt: new Date('2025-02-10').toISOString(),
  },
];

export const SEED_RECIPES: Recipe[] = [
  {
    id: 'r1',
    title: 'Nhoque de Batata com Molho Sugo',
    description:
      'Um clássico caseiro: nhoque macio de batata acompanhado de um molho de tomate lento, aromatizado com manjericão fresco.',
    category: 'Massas',
    difficulty: 'medium',
    prepTimeMinutes: 70,
    servings: 4,
    coverImageUrl:
      'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?q=80&w=1200&auto=format&fit=crop',
    videoUrl: null,
    ingredients: [
      { id: 'i1', name: 'Batata', quantity: 1, unit: 'kg' },
      { id: 'i2', name: 'Farinha de trigo', quantity: 300, unit: 'g' },
      { id: 'i3', name: 'Gema de ovo', quantity: 1, unit: 'unid' },
      { id: 'i4', name: 'Sal', quantity: 1, unit: 'tsp' },
    ],
    steps: [
      { id: 's1', order: 1, description: 'Cozinhe as batatas com casca até ficarem macias.' },
      { id: 's2', order: 2, description: 'Amasse ainda quentes e misture a farinha e a gema.' },
      { id: 's3', order: 3, description: 'Modele os nhoques e cozinhe em água fervente até subirem.' },
      { id: 's4', order: 4, description: 'Sirva com o molho sugo bem quente.' },
    ],
    author: { id: 'u1', name: 'Ana Beatriz', avatarUrl: null },
    createdAt: new Date('2025-03-01').toISOString(),
    updatedAt: new Date('2025-03-01').toISOString(),
    favoritesCount: 12,
    isFavoritedByMe: false,
  },
  {
    id: 'r2',
    title: 'Bowl de Quinoa com Legumes Assados',
    description:
      'Receita leve e colorida, ótima para o almoço da semana. Fácil de adaptar aos vegetais que você tiver em casa.',
    category: 'Saudável',
    difficulty: 'easy',
    prepTimeMinutes: 35,
    servings: 2,
    coverImageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop',
    videoUrl: null,
    ingredients: [
      { id: 'i1', name: 'Quinoa', quantity: 1, unit: 'cup' },
      { id: 'i2', name: 'Abobrinha', quantity: 1, unit: 'unid' },
      { id: 'i3', name: 'Grão de bico cozido', quantity: 200, unit: 'g' },
      { id: 'i4', name: 'Azeite', quantity: 2, unit: 'tbsp' },
    ],
    steps: [
      { id: 's1', order: 1, description: 'Cozinhe a quinoa conforme a embalagem.' },
      { id: 's2', order: 2, description: 'Asse os legumes com azeite, sal e ervas por 20 min.' },
      { id: 's3', order: 3, description: 'Monte o bowl combinando todos os ingredientes.' },
    ],
    author: { id: 'u1', name: 'Ana Beatriz', avatarUrl: null },
    createdAt: new Date('2025-04-12').toISOString(),
    updatedAt: new Date('2025-04-12').toISOString(),
    favoritesCount: 27,
    isFavoritedByMe: true,
  },
];
