import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { firstErrorMessage } from '../../core/validators/error-messages.util';
import { MediaUploaderComponent } from '../../shared/components/media-uploader/media-uploader.component';

@Component({
  selector: 'rc-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  imports: [ReactiveFormsModule, MediaUploaderComponent],
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly saving = signal(false);
  readonly avatarPreview = signal<string | null>(this.auth.currentUser()?.avatarUrl ?? null);

  readonly form = this.fb.group({
    name: [this.auth.currentUser()?.name ?? '', [Validators.required, Validators.minLength(2)]],
  });

  errorFor(field: string, label: string): string | null {
    return firstErrorMessage(this.form.get(field), label);
  }

  onAvatarChange(base64: string | null): void {
    this.avatarPreview.set(base64);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.auth
      .updateProfile({ name: this.form.getRawValue().name!, avatarBase64: this.avatarPreview() })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success('Perfil atualizado!');
        },
        error: () => {
          this.saving.set(false);
          this.toast.error('Não foi possível atualizar o perfil.');
        },
      });
  }
}
