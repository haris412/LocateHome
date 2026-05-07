# Advanced Login Test Cases (Optional)

These are additional test cases you can implement as your application grows.

## 1. Integration Tests with AuthService

```typescript
describe('LoginCardComponent - Integration with AuthService', () => {
  let component: LoginCardComponent;
  let fixture: ComponentFixture<LoginCardComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginCardComponent],
      providers: [AuthService]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
  });

  it('should call AuthService.login when form is submitted with valid credentials', () => {
    spyOn(authService, 'login').and.returnValue(of({ user: { id: '1' } }));

    component.form.patchValue({
      identifier: 'user@example.com',
      password: 'SecurePassword123'
    });

    component.submit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'SecurePassword123'
    });
  });

  it('should handle login error response', () => {
    spyOn(authService, 'login').and.returnValue(
      throwError(() => new Error('Invalid credentials'))
    );

    component.form.patchValue({
      identifier: 'user@example.com',
      password: 'WrongPassword'
    });

    component.submit();

    expect(component.error).toBe('Invalid credentials');
  });

  it('should display loading state during login', (done) => {
    spyOn(authService, 'login').and.returnValue(
      of({ user: { id: '1' } }).pipe(delay(100))
    );

    component.form.patchValue({
      identifier: 'user@example.com',
      password: 'SecurePassword123'
    });

    component.submit();

    expect(component.loading()).toBe(true);

    setTimeout(() => {
      expect(component.loading()).toBe(false);
      done();
    }, 150);
  });

  it('should navigate to dashboard on successful login', (done) => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    spyOn(authService, 'login').and.returnValue(
      of({ user: { id: '1' } })
    );

    component.form.patchValue({
      identifier: 'user@example.com',
      password: 'SecurePassword123'
    });

    component.submit();

    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      done();
    }, 0);
  });
});
```

## 2. Async/Wait Pattern Tests

```typescript
describe('LoginCardComponent - Async Operations', () => {
  let component: LoginCardComponent;
  let fixture: ComponentFixture<LoginCardComponent>;

  // ... setup ...

  it('should handle async form validation', fakeAsync(() => {
    const control = component.form.get('identifier');
    control?.setAsyncValidators(emailExistsValidator);

    control?.setValue('user@example.com');
    tick(500); // Simulate async operation delay

    expect(control?.pending).toBe(false);
  }));

  it('should debounce password validation', fakeAsync(() => {
    const control = component.form.get('password');
    const validateSpy = spyOn(component, 'validatePassword');

    control?.setValue('password');
    tick(100);

    expect(validateSpy).toHaveBeenCalled();
  }));
});
```

## 3. Accessibility (a11y) Tests

```typescript
describe('LoginCardComponent - Accessibility', () => {
  let component: LoginCardComponent;
  let fixture: ComponentFixture<LoginCardComponent>;

  // ... setup ...

  it('should have proper ARIA labels for form fields', () => {
    const emailLabel = fixture.nativeElement.querySelector('label[for="login-identifier"]');
    expect(emailLabel).toBeTruthy();
    expect(emailLabel.textContent).toContain('Email or mobile number');
  });

  it('should have ARIA label for password toggle button', () => {
    const toggleButton = fixture.nativeElement.querySelector('[aria-label]');
    expect(toggleButton).toBeTruthy();
    expect(toggleButton.getAttribute('aria-label')).toContain('Show password');
  });

  it('should announce password visibility state to screen readers', () => {
    component.hidePassword.set(true);
    fixture.detectChanges();

    let button = fixture.nativeElement.querySelector('[aria-label]');
    expect(button.getAttribute('aria-label')).toContain('Show password');

    component.hidePassword.set(false);
    fixture.detectChanges();

    button = fixture.nativeElement.querySelector('[aria-label]');
    expect(button.getAttribute('aria-label')).toContain('Hide password');
  });

  it('should have proper heading hierarchy', () => {
    const heading = fixture.nativeElement.querySelector('h2');
    expect(heading.textContent).toContain('Log in');
    expect(heading.id).toBe('login-title');
  });

  it('should have proper form structure with fieldsets', () => {
    const form = fixture.nativeElement.querySelector('form');
    expect(form).toBeTruthy();
  });

  it('should focus management on error', () => {
    const emailInput = fixture.nativeElement.querySelector('[formControlName="identifier"]');
    spyOn(emailInput, 'focus');

    component.form.get('identifier')?.setErrors({ 'required': true });
    component.highlightErrors();

    expect(emailInput.focus).toHaveBeenCalled();
  });
});
```

## 4. Material Component Integration Tests

```typescript
describe('LoginCardComponent - Material Integration', () => {
  let component: LoginCardComponent;
  let fixture: ComponentFixture<LoginCardComponent>;

  // ... setup ...

  it('should display Material form field error messages', () => {
    const control = component.form.get('password');
    control?.setValue('short');
    control?.markAsTouched();

    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('mat-error');
    expect(errorElement?.textContent).toContain('Password must be at least 8 characters');
  });

  it('should disable submit button when form is invalid', () => {
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(true);

    component.form.patchValue({
      identifier: 'user@example.com',
      password: 'ValidPassword123'
    });

    fixture.detectChanges();
    expect(submitButton.disabled).toBe(false);
  });

  it('should show loading spinner on submit button during login', () => {
    component.loading.set(true);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });
});
```

## 5. Social Login Integration Tests

```typescript
describe('LoginCardComponent - Social Login', () => {
  let component: LoginCardComponent;
  let fixture: ComponentFixture<LoginCardComponent>;

  // ... setup ...

  it('should have social login buttons', () => {
    const socialButtons = fixture.nativeElement.querySelectorAll('app-social-button');
    expect(socialButtons.length).toBeGreaterThan(0);
  });

  it('should handle Google login click', () => {
    spyOn(component, 'handleSocialLogin');
    const googleButton = fixture.nativeElement.querySelector('[data-provider="google"]');

    googleButton.click();

    expect(component.handleSocialLogin).toHaveBeenCalledWith('google');
  });

  it('should handle Facebook login click', () => {
    spyOn(component, 'handleSocialLogin');
    const facebookButton = fixture.nativeElement.querySelector('[data-provider="facebook"]');

    facebookButton.click();

    expect(component.handleSocialLogin).toHaveBeenCalledWith('facebook');
  });
});
```

## 6. Password Strength Indicator Tests

```typescript
describe('LoginCardComponent - Password Strength', () => {
  let component: LoginCardComponent;
  let fixture: ComponentFixture<LoginCardComponent>;

  // ... setup ...

  it('should calculate weak password strength', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('password');

    expect(component.getPasswordStrength()).toBe('weak');
  });

  it('should calculate medium password strength', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('Pass123');

    expect(component.getPasswordStrength()).toBe('medium');
  });

  it('should calculate strong password strength', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('SecurePass@123!');

    expect(component.getPasswordStrength()).toBe('strong');
  });

  it('should display password strength indicator', () => {
    fixture.detectChanges();
    const strengthIndicator = fixture.nativeElement.querySelector('.password-strength');
    expect(strengthIndicator).toBeTruthy();
  });
});
```

## 7. Remember Me Persistence Tests

```typescript
describe('LoginCardComponent - Remember Me Persistence', () => {
  let component: LoginCardComponent;
  let fixture: ComponentFixture<LoginCardComponent>;

  // ... setup ...

  it('should save identifier to localStorage when remember me is checked', () => {
    spyOn(localStorage, 'setItem');

    component.form.patchValue({
      identifier: 'user@example.com',
      rememberMe: true
    });

    component.saveRememberMe();

    expect(localStorage.setItem).toHaveBeenCalledWith('rememberedEmail', 'user@example.com');
  });

  it('should load remembered identifier on component init', () => {
    spyOn(localStorage, 'getItem').and.returnValue('saved@example.com');

    component.loadRememberedEmail();

    expect(component.form.get('identifier')?.value).toBe('saved@example.com');
  });

  it('should clear localStorage when remember me is unchecked', () => {
    spyOn(localStorage, 'removeItem');

    component.form.patchValue({
      rememberMe: false
    });

    component.clearRememberedEmail();

    expect(localStorage.removeItem).toHaveBeenCalledWith('rememberedEmail');
  });
});
```

## 8. Rate Limiting / Brute Force Protection Tests

```typescript
describe('LoginCardComponent - Brute Force Protection', () => {
  let component: LoginCardComponent;
  let fixture: ComponentFixture<LoginCardComponent>;

  // ... setup ...

  it('should limit login attempts', () => {
    let attempts = 0;

    for (let i = 0; i < 6; i++) {
      component.form.patchValue({
        identifier: 'user@example.com',
        password: 'WrongPassword'
      });
      component.submit();
      attempts++;
    }

    expect(component.isLockedOut()).toBe(true);
    expect(component.lockoutTimeRemaining()).toBeGreaterThan(0);
  });

  it('should prevent login submission when locked out', () => {
    spyOn(console, 'log');
    component.setLockedOut(true);

    component.form.patchValue({
      identifier: 'user@example.com',
      password: 'ValidPassword123'
    });

    component.submit();

    expect(console.log).not.toHaveBeenCalled();
  });

  it('should show lockout message to user', () => {
    component.setLockedOut(true);
    fixture.detectChanges();

    const lockoutMessage = fixture.nativeElement.querySelector('.lockout-message');
    expect(lockoutMessage?.textContent).toContain('Too many attempts');
  });
});
```

## 9. Two-Factor Authentication (2FA) Tests

```typescript
describe('LoginCardComponent - Two-Factor Authentication', () => {
  let component: LoginCardComponent;
  let fixture: ComponentFixture<LoginCardComponent>;

  // ... setup ...

  it('should prompt for OTP after successful login attempt', (done) => {
    spyOn(component, 'show2FAPrompt');

    component.form.patchValue({
      identifier: 'user@example.com',
      password: 'ValidPassword123'
    });

    component.submit();

    setTimeout(() => {
      expect(component.show2FAPrompt).toHaveBeenCalled();
      done();
    }, 0);
  });

  it('should validate OTP code', () => {
    const otpCode = '123456';
    expect(component.validateOTP(otpCode)).toBe(true);
  });

  it('should resend OTP on request', () => {
    spyOn(component, 'resendOTP');
    const resendButton = fixture.nativeElement.querySelector('.resend-otp-btn');

    resendButton.click();

    expect(component.resendOTP).toHaveBeenCalled();
  });
});
```

## 10. Performance Tests

```typescript
describe('LoginCardComponent - Performance', () => {
  let component: LoginCardComponent;
  let fixture: ComponentFixture<LoginCardComponent>;

  // ... setup ...

  it('should render component within acceptable time', () => {
    const startTime = performance.now();
    fixture.detectChanges();
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100); // Less than 100ms
  });

  it('should debounce form value changes', fakeAsync(() => {
    const spy = spyOn(component, 'onFormValueChange');

    component.form.get('password')?.setValue('pass1');
    tick(50);
    component.form.get('password')?.setValue('pass12');
    tick(50);
    component.form.get('password')?.setValue('pass123');
    tick(300);

    expect(spy).toHaveBeenCalledTimes(1);
  }));
});
```

---

## How to Implement These Tests

### Step 1: Add Required Imports
```typescript
import { fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
```

### Step 2: Add Properties to Component (if needed)
```typescript
error: signal('');
loading: signal(false);
```

### Step 3: Add Methods to Component (if needed)
```typescript
saveRememberMe(): void { /* ... */ }
loadRememberedEmail(): void { /* ... */ }
getPasswordStrength(): string { /* ... */ }
```

### Step 4: Run Tests
```bash
npm test
```

---

**Note**: These are advanced examples. Implement them based on your actual application requirements.
