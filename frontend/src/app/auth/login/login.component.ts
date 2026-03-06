import { afterNextRender, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, LoginPayload, RegisterPayload } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isRegister = false;
  roles: string[] = [];
  rolesLoading = true;

  form: FormGroup;
  error = '';
  loading = false;

  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.form = this.buildForm();
    afterNextRender(() => this.loadRoles());
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

  toggleMode(): void {
    this.isRegister = !this.isRegister;
    this.error = '';
    const validators = this.isRegister ? [Validators.required] : [];
    ['firstName', 'lastName'].forEach((name) => {
      this.form.get(name)?.setValidators(validators);
      this.form.get(name)?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const request$ = this.isRegister ? this.auth.register(this.getRegisterPayload()) : this.auth.login(this.getLoginPayload());
    this.submitAuthRequest(request$, this.isRegister ? 'Registration failed.' : 'Login failed.');
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
      roleName: v.roleName || 'Buyer'
    };
  }

  private submitAuthRequest(request$: Observable<{ user: unknown }>, errorFallback: string): void {
    request$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = this.getErrorMessage(err, errorFallback);
      }
    });
  }

  private getErrorMessage(err: { error?: { message?: string; errors?: Array<{ msg?: string }> }; message?: string }, fallback: string): string {
    return err.error?.message ?? err.error?.errors?.[0]?.msg ?? err.message ?? fallback;
  }
}
