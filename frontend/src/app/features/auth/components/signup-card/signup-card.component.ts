import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';
import { SocialButtonComponent } from '../../../../shared/ui/social-button/social-button.component';
import { UserTypeOption } from '../../../../core/models/auth.models';

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

  readonly hidePassword = signal(true);
  readonly hideConfirmPassword = signal(true);

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
      password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: this.fb.nonNullable.control('', [Validators.required]),
      agree: this.fb.nonNullable.control(false, [Validators.requiredTrue])
    },
    {
      validators: passwordMatchValidator('password', 'confirmPassword')
    }
  );

  readonly passwordMismatch = computed(() => {
    const group = this.form;
    return group.hasError('passwordMismatch') && group.touched;
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log(this.form.getRawValue());
  }
}