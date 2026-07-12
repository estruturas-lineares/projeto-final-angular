import { AbstractControl } from '@angular/forms';

export function firstErrorMessage(control: AbstractControl | null, fieldLabel: string): string | null {
  if (!control || !control.errors || !(control.touched || control.dirty)) return null;
  const errors = control.errors;

  if (errors['required']) return `${fieldLabel} é obrigatório.`;
  if (errors['email']) return 'Informe um e-mail válido.';
  if (errors['minlength']) {
    return `${fieldLabel} deve ter ao menos ${errors['minlength'].requiredLength} caracteres.`;
  }
  if (errors['min']) return `${fieldLabel} deve ser maior ou igual a ${errors['min'].min}.`;
  if (errors['max']) return `${fieldLabel} deve ser menor ou igual a ${errors['max'].max}.`;
  if (errors['strongPassword']) {
    const se = errors['strongPassword'];
    if (se.minLength) return 'A senha deve ter ao menos 8 caracteres.';
    if (se.upper) return 'A senha deve conter ao menos 1 letra maiúscula.';
    if (se.lower) return 'A senha deve conter ao menos 1 letra minúscula.';
    if (se.number) return 'A senha deve conter ao menos 1 número.';
    if (se.symbol) return 'A senha deve conter ao menos 1 símbolo (ex: !@#$%).';
  }
  if (errors['passwordsMismatch']) return 'As senhas não coincidem.';

  return `${fieldLabel} é inválido.`;
}
