import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { firstErrorMessage } from '../../../core/validators/error-messages.util';
import {
  passwordsMatchValidator,
  strongPasswordValidator,
} from '../../../core/validators/custom-validators';

@Component({
  selector: 'rc-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  imports: [ReactiveFormsModule, RouterLink],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly hidePassword = signal(true);
  readonly hideConfirm = signal(true);

  readonly form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator() }
  );

  errorFor(field: string, label: string): string | null {
    return firstErrorMessage(this.form.get(field), label);
  }

  get confirmError(): string | null {
    const control = this.form.get('confirmPassword');
    if (!control || !(control.touched || control.dirty)) return null;
    if (this.form.errors?.['passwordsMismatch']) return 'As senhas não coincidem.';
    return firstErrorMessage(control, 'Confirmação de senha');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { name, email, password, confirmPassword } = this.form.getRawValue();

    this.auth.register({ name: name!, email: email!, password: password!, confirmPassword: confirmPassword! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Conta criada com sucesso! Bem-vindo(a).');
        this.router.navigateByUrl('/receitas');
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err?.error?.message ?? 'Não foi possível criar a conta.');
      },
    });
  }
}
