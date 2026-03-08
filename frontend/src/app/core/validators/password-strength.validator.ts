import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

/** Single requirement: id, label, and a test (regex or function). */
export interface PasswordRequirement {
  readonly id: string;
  readonly label: string;
  readonly test: (value: string) => boolean;
}

/** Result for UI: requirement plus whether it is satisfied for the given value. */
export interface PasswordRequirementStatus {
  readonly id: string;
  readonly label: string;
  readonly satisfied: boolean;
}

/** Default requirements for a strong password. Kept in one place so validator and UI stay in sync. */
export const PASSWORD_REQUIREMENTS: readonly PasswordRequirement[] = [
  {
    id: 'minLength',
    label: 'At least 8 characters',
    test: (v) => v.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (v) => /[A-Z]/.test(v),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (v) => /[a-z]/.test(v),
  },
  {
    id: 'number',
    label: 'One number',
    test: (v) => /\d/.test(v),
  },
  {
    id: 'special',
    label: 'One special character (!@#$%^&* etc.)',
    test: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v),
  },
];

/**
 * Returns the status of each password requirement for the given value.
 * Use in templates to show a checklist (e.g. only in register mode).
 */
export function getPasswordRequirementStatus(
  value: string | null | undefined
): PasswordRequirementStatus[] {
  const v = value ?? '';
  return PASSWORD_REQUIREMENTS.map((r) => ({
    id: r.id,
    label: r.label,
    satisfied: r.test(v),
  }));
}

/**
 * Angular validator that enforces strong password rules.
 * Use on the password control when you require a strong password (e.g. registration).
 * Returns null when valid; otherwise { passwordStrength: { failedIds: string[] } }.
 */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value == null || value === '') {
      return null;
    }
    const str = typeof value === 'string' ? value : String(value);
    const failedIds = PASSWORD_REQUIREMENTS.filter((r) => !r.test(str)).map(
      (r) => r.id
    );
    if (failedIds.length === 0) return null;
    return { passwordStrength: { failedIds } };
  };
}

/**
 * Composes required + strong password validators for registration.
 * Use when building the password control for a register form.
 */
export function registerPasswordValidators(): ValidatorFn[] {
  return [Validators.required, strongPasswordValidator()];
}
