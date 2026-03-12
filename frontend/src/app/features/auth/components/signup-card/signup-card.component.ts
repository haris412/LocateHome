import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal
} from '@angular/core';
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import countryList from 'country-state-city/lib/assets/country.json';
import type { ICountry } from 'country-state-city';

import {
  filterCountriesBySearch,
  findCountryByCode,
  formatLocationCountryDisplay,
  formatPhoneCountryDisplay,
  getLocationIsoCode,
  validCountryCodeValidator,
  validLocationCountryValidator
} from '../../../../shared/utils/country-filter.util';
import { phoneNumberValidator } from '../../../../shared/validators/phone-number.validator';
import { SocialButtonComponent } from '../../../../shared/ui/social-button/social-button.component';
import type { UserTypeOption } from '../../../../core/models/auth.models';
import { AuthService, RegisterPayload } from '../../../../core/services/auth.service';
import { FormFieldErrorComponent } from '../../../../shared/ui/form-field-error/form-field-error.component';

const DEFAULT_PHONE_COUNTRY_CODE = 'US';

const USER_TYPE_OPTIONS: UserTypeOption[] = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'renter', label: 'Renter' },
  { value: 'agent', label: 'Agent' }
];

type UserType = 'buyer' | 'seller' | 'renter' | 'agent';

interface SignupFormValue {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phone: string;
  locationCountryCode: string | ICountry | null;
  userType: UserType;
  password: string;
  agree: boolean;
}

interface SignupFormControls {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phoneCountryCode: FormControl<string>;
  phone: FormControl<string>;
  locationCountryCode: FormControl<string | ICountry | null>;
  userType: FormControl<UserType>;
  password: FormControl<string>;
  agree: FormControl<boolean>;
}

@Component({
  selector: 'app-signup-card',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    SocialButtonComponent,
    FormFieldErrorComponent
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
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  private readonly formValid = signal(false);

  readonly userTypes = signal(USER_TYPE_OPTIONS);
  readonly countries: ICountry[] = countryList as ICountry[];

  readonly phoneCountrySearchTerm = signal('');
  readonly locationCountrySearchTerm = signal('');

  readonly filteredPhoneCountries = computed(() =>
    filterCountriesBySearch(this.countries, this.phoneCountrySearchTerm(), {
      includePhoneCode: true,
      codeOnly: true
    })
  );

  readonly filteredLocationCountries = computed(() =>
    filterCountriesBySearch(this.countries, this.locationCountrySearchTerm(), {
      codeOnly: false
    })
  );

  readonly form = this.buildForm();

  readonly canSubmit = computed(() => this.formValid() && !this.loading());

  displayPhoneCountry = (isoCode: string): string =>
    formatPhoneCountryDisplay(findCountryByCode(this.countries, isoCode));

  displayLocationCountry = (value: string | ICountry | null): string => {
    if (value != null && typeof value === 'object' && 'name' in value)
      return (value as ICountry).name ?? '';
    return formatLocationCountryDisplay(
      findCountryByCode(this.countries, typeof value === 'string' ? value : '')
    );
  };

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    const formValue = this.form.getRawValue();
    const payload = this.buildRegisterPayload(formValue);
    this.auth.register(payload).subscribe({
      next: () =>
        this.router.navigate(['/login'], {
          queryParams: { registered: 'true' },
          replaceUrl: true
        }),
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.getRegisterErrorMessage(err));
      },
      complete: () => this.loading.set(false)
    });
  }

  private setLocationSearchFromValue(value: string | ICountry | null): void {
    if (value == null) {
      this.locationCountrySearchTerm.set('');
      return;
    }
    const term =
      typeof value === 'object' && 'name' in value ? value.name ?? '' : String(value);
    this.locationCountrySearchTerm.set(term);
  }

  private getRegisterErrorMessage(err: unknown): string {
    if (err != null && typeof err === 'object' && 'error' in err) {
      const e = err as { error?: { message?: string }; message?: string };
      return e.error?.message ?? e.message ?? 'Registration failed. Please try again.';
    }
    return err instanceof Error ? err.message : 'Registration failed. Please try again.';
  }

  private buildForm(): FormGroup<SignupFormControls> {
    const form = new FormGroup<SignupFormControls>({
      firstName: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(2)
      ]),
      lastName: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(2)
      ]),
      email: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.email
      ]),
      phoneCountryCode: this.fb.nonNullable.control(DEFAULT_PHONE_COUNTRY_CODE, [
        Validators.required,
        validCountryCodeValidator(this.countries)
      ]),
      phone: this.fb.nonNullable.control('', [Validators.required]),
      locationCountryCode: this.fb.control<string | ICountry>('', [
        Validators.required,
        validLocationCountryValidator(this.countries)
      ]),
      userType: this.fb.nonNullable.control<UserType>('buyer', [Validators.required]),
      password: this.fb.nonNullable.control('', [Validators.required]),
      agree: this.fb.nonNullable.control(false, [Validators.requiredTrue])
    });

    form.controls.phone.addValidators(
      phoneNumberValidator(
        () => form.controls.phoneCountryCode.value ?? '',
        this.countries
      )
    );

    form.statusChanges
      .pipe(startWith(form.status), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.formValid.set(form.valid));

    this.phoneCountrySearchTerm.set(form.controls.phoneCountryCode.value ?? '');
    form.controls.phoneCountryCode.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string | null) =>
        this.phoneCountrySearchTerm.set((value ?? '').toString())
      );

    this.setLocationSearchFromValue(form.controls.locationCountryCode.value);
    form.controls.locationCountryCode.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string | ICountry | null) =>
        this.setLocationSearchFromValue(value)
      );

    form.controls.phoneCountryCode.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => form.controls.phone.updateValueAndValidity());

    return form;
  }

  private buildRegisterPayload(value: SignupFormValue): RegisterPayload {
    const roleName =
      value.userType.charAt(0).toUpperCase() + value.userType.slice(1).toLowerCase();
    const country = findCountryByCode(this.countries, value.phoneCountryCode);
    const phoneDigits = (country?.phonecode ?? '').replace(/\D/g, '');
    const numberDigits = (value.phone ?? '').replace(/\D/g, '').replace(/^0+/, '') || '';
    const phoneNumber = phoneDigits ? `+${phoneDigits}${numberDigits}` : numberDigits;

    const locationIsoCode = getLocationIsoCode(value.locationCountryCode);
    const locationCountry = findCountryByCode(this.countries, locationIsoCode);
    const location = locationCountry
      ? JSON.stringify({
          country: locationCountry.name,
          countryCode: locationIsoCode
        })
      : undefined;

    const payload: RegisterPayload = {
      email: value.email.trim(),
      password: value.password,
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      roleName,
      phoneNumber
    };
    if (location) payload.location = location;
    return payload;
  }
}
