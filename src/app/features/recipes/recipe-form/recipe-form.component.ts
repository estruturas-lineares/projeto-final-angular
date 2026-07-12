import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecipeDifficulty, RecipePayload } from '../../../core/models/recipe.model';
import { fileToBase64, isVideoFile } from '../../../core/services/file.util';
import { RecipeService } from '../../../core/services/recipe.service';
import { ToastService } from '../../../core/services/toast.service';
import { firstErrorMessage } from '../../../core/validators/error-messages.util';
import { MediaUploaderComponent } from '../../../shared/components/media-uploader/media-uploader.component';

const CATEGORIES = ['Massas', 'Saudável', 'Sobremesas', 'Carnes', 'Vegano', 'Bebidas'];
const UNITS = ['g', 'kg', 'ml', 'l', 'unid', 'tsp', 'tbsp', 'cup', 'pitada'];

@Component({
  selector: 'rc-recipe-form',
  standalone: true,
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.scss',
  imports: [ReactiveFormsModule, MediaUploaderComponent],
})
export class RecipeFormComponent implements OnChanges {
  /** Presente somente na rota de edição: /receitas/:id/editar */
  @Input() id?: string;

  private fb = inject(FormBuilder);
  private recipeService = inject(RecipeService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly categories = CATEGORIES;
  readonly units = UNITS;
  readonly saving = signal(false);
  readonly coverImagePreview = signal<string | null>(null);
  readonly videoPreviewUrl = signal<string | null>(null);
  readonly isEditMode = signal(false);

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    category: ['', [Validators.required]],
    difficulty: ['medio' as RecipeDifficulty, [Validators.required]],
    prepTimeMinutes: [30, [Validators.required, Validators.min(1)]],
    servings: [4, [Validators.required, Validators.min(1)]],
    videoUrl: [''],
    ingredients: this.fb.array([this.buildIngredientGroup()], [Validators.required, Validators.minLength(1)]),
    steps: this.fb.array([this.buildStepGroup()], [Validators.required, Validators.minLength(1)]),
  });

  ngOnChanges(): void {
    if (!this.id) {
      this.isEditMode.set(false);
      return;
    }
    this.isEditMode.set(true);
    this.recipeService.getById(this.id).subscribe({
      next: (r) => {
        this.ingredients.clear();
        r.ingredients.forEach((ing) => this.ingredients.push(this.buildIngredientGroup(ing.name, ing.quantity, ing.unit)));
        this.steps.clear();
        r.steps.forEach((s) => this.steps.push(this.buildStepGroup(s.description)));

        this.form.patchValue({
          title: r.title,
          description: r.description,
          category: r.category,
          difficulty: r.difficulty,
          prepTimeMinutes: r.prepTimeMinutes,
          servings: r.servings,
          videoUrl: r.videoUrl ?? '',
        });
        this.coverImagePreview.set(r.coverImageUrl ?? null);
        this.videoPreviewUrl.set(r.videoUrl ?? null);
      },
      error: () => this.toast.error('Não foi possível carregar a receita para edição.'),
    });
  }

  get ingredients(): FormArray {
    return this.form.get('ingredients') as FormArray;
  }

  get steps(): FormArray {
    return this.form.get('steps') as FormArray;
  }

  buildIngredientGroup(name = '', quantity: number | null = null, unit = 'g') {
    return this.fb.group({
      name: [name, [Validators.required]],
      quantity: [quantity, [Validators.required, Validators.min(0.1)]],
      unit: [unit, [Validators.required]],
    });
  }

  buildStepGroup(description = '') {
    return this.fb.group({
      description: [description, [Validators.required, Validators.minLength(5)]],
    });
  }

  addIngredient(): void {
    this.ingredients.push(this.buildIngredientGroup());
  }

  removeIngredient(index: number): void {
    if (this.ingredients.length <= 1) {
      this.toast.info('A receita precisa de ao menos 1 ingrediente.');
      return;
    }
    this.ingredients.removeAt(index);
  }

  addStep(): void {
    this.steps.push(this.buildStepGroup());
  }

  removeStep(index: number): void {
    if (this.steps.length <= 1) {
      this.toast.info('A receita precisa de ao menos 1 passo.');
      return;
    }
    this.steps.removeAt(index);
  }

  errorFor(control: string, label: string): string | null {
    return firstErrorMessage(this.form.get(control), label);
  }

  ingredientError(index: number, control: string, label: string): string | null {
    return firstErrorMessage(this.ingredients.at(index).get(control), label);
  }

  stepError(index: number): string | null {
    return firstErrorMessage(this.steps.at(index).get('description'), 'Passo');
  }

  onCoverChange(base64: string | null): void {
    this.coverImagePreview.set(base64);
  }

  async onVideoFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!isVideoFile(file)) {
      this.toast.error('Selecione um arquivo de vídeo válido.');
      return;
    }
    // Nota: em produção, este arquivo deve ser enviado via multipart/form-data
    // para um endpoint de upload do back-end, que devolve a URL definitiva.
    // Aqui usamos um object URL local apenas para pré-visualização na demo.
    const objectUrl = URL.createObjectURL(file);
    this.videoPreviewUrl.set(objectUrl);
    this.form.patchValue({ videoUrl: objectUrl });
  }

  removeVideo(): void {
    this.videoPreviewUrl.set(null);
    this.form.patchValue({ videoUrl: '' });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Revise os campos destacados antes de salvar.');
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();

    const payload: RecipePayload = {
      title: raw.title!,
      description: raw.description!,
      category: raw.category!,
      difficulty: raw.difficulty as RecipeDifficulty,
      prepTimeMinutes: raw.prepTimeMinutes!,
      servings: raw.servings!,
      coverImageBase64: this.coverImagePreview(),
      videoUrl: raw.videoUrl || null,
      ingredients: raw.ingredients!.map((i) => ({ name: i.name!, quantity: i.quantity!, unit: i.unit! })),
      steps: raw.steps!.map((s, idx) => ({ order: idx + 1, description: s.description! })),
    };

    const request$ = this.isEditMode() ? this.recipeService.update(this.id!, payload) : this.recipeService.create(payload);

    request$.subscribe({
      next: (recipe) => {
        this.saving.set(false);
        this.toast.success(this.isEditMode() ? 'Receita atualizada!' : 'Receita publicada!');
        this.router.navigate(['/receitas', recipe.id]);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Não foi possível salvar a receita.');
      },
    });
  }
}
