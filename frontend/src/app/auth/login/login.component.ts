import { afterNextRender, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, LoginPayload, RegisterPayload } from '../../core/services/auth.service';

const QUERY_PARAM_REGISTERED = 'registered';
const QUERY_PARAM_VERIFIED = 'verified';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  isRegister = false;
  roles: string[] = [];
  rolesLoading = true;

  form: FormGroup;
  error = '';
  successMessage = '';
  loading = false;
  passwordVisible = false;

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.form = this.buildForm();
    afterNextRender(() => {
      this.loadRoles();
      this.checkQueryParams();
    });
  }

  private checkQueryParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        if (params[QUERY_PARAM_REGISTERED] === 'true') {
          this.successMessage =
            'User registered successfully. Please verify your email.';
          this.isRegister = false;
        }
        if (params[QUERY_PARAM_VERIFIED] === 'true') {
          this.successMessage = 'Email verified. You can sign in now.';
        }
      });
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      firstName: [''],
      lastName: [''],
      roleName: ['']
    });
  }

  private loadRoles(): void {
    this.auth
      .getRoles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((roles) => {
        this.roles = roles;
        this.rolesLoading = false;
        if (roles.length) {
          const current = this.form.get('roleName')?.value;
          if (!current || !roles.includes(current)) {
            this.form.patchValue({ roleName: roles[0] });
          }
        }
      });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleMode(): void {
    this.isRegister = !this.isRegister;
    this.error = '';
    this.successMessage = '';
    const validators = this.isRegister ? [Validators.required] : [];
    ['firstName', 'lastName'].forEach((name) => {
      this.form.get(name)?.setValidators(validators);
      this.form.get(name)?.updateValueAndValidity();
    });
    this.form.get('password')?.setValidators([Validators.required]);
    this.form.get('password')?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.error = '';
    this.successMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    if (this.isRegister) {
      this.auth.register(this.getRegisterPayload()).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/login'], {
            queryParams: { [QUERY_PARAM_REGISTERED]: 'true' },
            replaceUrl: true,
          });
        },
        error: (err: unknown) => {
          this.loading = false;
          this.error =
            (err as { message?: string }).message ?? 'Registration failed.';
        },
      });
    } else {
      this.submitAuthRequest(this.auth.login(this.getLoginPayload()), 'Login failed.');
    }
  }

  private getLoginPayload(): LoginPayload {
    const v = this.form.getRawValue();
    return { email: v.email.trim(), password: v.password };
  }

  private getRegisterPayload(): RegisterPayload {
    const v = this.form.getRawValue();
    return {
      email: v.email.trim(),
      password: v.password,
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      roleName: v.roleName || 'Buyer',
      phoneNumber: (v as { phone?: string }).phone?.trim() ?? ''
    };
  }

  private submitAuthRequest(
    request$: Observable<{ user: unknown }>,
    errorFallback: string
  ): void {
    request$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: unknown) => {
        this.loading = false;
        this.error =
          (err as { message?: string }).message ?? errorFallback;
      },
    });
  }

}
