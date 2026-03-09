import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { startWith } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';
import { SocialButtonComponent } from '../../../../shared/ui/social-button/social-button.component';
import { UserTypeOption } from '../../../../core/models/auth.models';
import { AuthService } from '../../../../core/services/auth.service';
import {
  getPasswordRequirementStatus,
  registerPasswordValidators
} from '../../../../core/validators';

type UserType = 'buyer' | 'seller' | 'renter' | 'agent';

interface SignupFormControls {
  fullName: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  location: FormControl<string>;
  userType: FormControl<UserType>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  agree: FormControl<boolean>;
}

@Component({
  selector: 'app-signup-card',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    SocialButtonComponent
  ],
  templateUrl: './signup-card.component.html',
  styleUrl: './signup-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupCardComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly hidePassword = signal(true);
  readonly hideConfirmPassword = signal(true);
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  private readonly formValid = signal(false);

  readonly userTypes = signal<UserTypeOption[]>([
    { value: 'buyer', label: 'Buyer' },
    { value: 'seller', label: 'Seller' },
    { value: 'renter', label: 'Renter' },
    { value: 'agent', label: 'Agent' }
  ]);

  readonly form = new FormGroup<SignupFormControls>(
    {
      fullName: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      phone: this.fb.nonNullable.control('', [Validators.required]),
      location: this.fb.nonNullable.control('', [Validators.required]),
      userType: this.fb.nonNullable.control<UserType>('buyer', [Validators.required]),
      password: this.fb.nonNullable.control('', registerPasswordValidators()),
      confirmPassword: this.fb.nonNullable.control('', [Validators.required]),
      agree: this.fb.nonNullable.control(false, [Validators.requiredTrue])
    },
    { validators: passwordMatchValidator('password', 'confirmPassword') }
  );

  constructor() {
    this.form.statusChanges
      .pipe(
        startWith(this.form.status),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.formValid.set(this.form.valid));
  }

  readonly passwordMismatch = computed(() => {
    const group = this.form;
    return group.hasError('passwordMismatch') && group.touched;
  });

  readonly passwordRequirementStatus = computed(() =>
    getPasswordRequirementStatus(this.form.controls.password.value)
  );

  readonly showPasswordRequirements = computed(
    () => (this.form.controls.password.value ?? '').length > 0
  );

  readonly canSubmit = computed(() => this.formValid() && !this.loading());

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    const { fullName, email, phone, password, userType } = this.form.getRawValue();
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] ?? '';
    const lastName = (parts.slice(1).join(' ') || parts[0]) ?? '';
    const roleName =
      userType.charAt(0).toUpperCase() + userType.slice(1).toLowerCase();
    this.auth
      .register({
        email: email.trim(),
        password,
        firstName,
        lastName,
        roleName,
        phoneNumber: phone.trim()
      })
      .subscribe({
        next: () =>
          this.router.navigate(['/login'], {
            queryParams: { registered: 'true' },
            replaceUrl: true
          }),
        error: (err) => {
          this.loading.set(false);
          const msg =
            err?.error?.message ?? err?.message ?? 'Registration failed. Please try again.';
          this.error.set(msg);
        },
        complete: () => this.loading.set(false)
      });
  }
}