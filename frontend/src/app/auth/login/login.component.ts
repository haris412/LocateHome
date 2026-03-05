import { afterNextRender, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      firstName: [''],
      lastName: [''],
      roleName: ['']
    });

    afterNextRender(() => {
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
    });
  }

  toggleMode(): void {
    this.isRegister = !this.isRegister;
    this.error = '';
    if (this.isRegister) {
      this.form.get('firstName')?.setValidators([Validators.required]);
      this.form.get('lastName')?.setValidators([Validators.required]);
    } else {
      this.form.get('firstName')?.clearValidators();
      this.form.get('lastName')?.clearValidators();
    }
    this.form.get('firstName')?.updateValueAndValidity();
    this.form.get('lastName')?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.isRegister) {
      const first = this.form.get('firstName')?.value?.trim();
      const last = this.form.get('lastName')?.value?.trim();
      if (!first || !last) {
        this.error = 'First name and last name are required.';
        return;
      }
    }

    const { email, password, firstName, lastName, roleName } = this.form.getRawValue();
    this.loading = true;

    if (this.isRegister) {
      this.auth.register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        roleName: roleName || 'Admin'
      }).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          const msg = err.error?.message ?? err.error?.errors?.[0]?.msg ?? err.message ?? 'Registration failed.';
          this.error = msg;
        }
      });
    } else {
      this.auth.login(email.trim(), password).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          const msg = err.error?.message ?? err.error?.errors?.[0]?.msg ?? err.message ?? 'Login failed.';
          this.error = msg;
        }
      });
    }
  }
}
