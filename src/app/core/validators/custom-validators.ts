import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;

    const errors: Record<string, boolean> = {};
    if (value.length < 8) errors['minLength'] = true;
    if (!/[A-Z]/.test(value)) errors['upper'] = true;
    if (!/[a-z]/.test(value)) errors['lower'] = true;
    if (!/[0-9]/.test(value)) errors['number'] = true;
    if (!/[^A-Za-z0-9]/.test(value)) errors['symbol'] = true;

    return Object.keys(errors).length ? { strongPassword: errors } : null;
  };
}

export function passwordsMatchValidator(
  passwordKey = 'password',
  confirmKey = 'confirmPassword'
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    if (!confirm) return null;
    return password === confirm ? null : { passwordsMismatch: true };
  };
}
