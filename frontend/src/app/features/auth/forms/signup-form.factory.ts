import type { DestroyRef } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import type { ICountry } from 'country-state-city';
import {
  validCountryCodeValidator
} from '../../../shared/utils/country-filter.util';
import { phoneNumberValidator } from '../../../shared/validators/phone-number.validator';

const DEFAULT_PHONE_COUNTRY_CODE = 'US';

export type UserType = 'buyer' | 'seller' | 'renter' | 'agent';

export interface SignupFormControls {
  fullName: FormControl<string>;
  email: FormControl<string>;
  phoneCountryCode: FormControl<string>;
  phone: FormControl<string>;
  locationCountryCode: FormControl<string>;
  userType: FormControl<UserType>;
  password: FormControl<string>;
  agree: FormControl<boolean>;
}

export interface SignupFormSetup {
  form: FormGroup<SignupFormControls>;
  onFormValidChange: (callback: (valid: boolean) => void) => void;
  syncSearchTerm: (
    control: FormControl<string>,
    setSignal: (value: string) => void
  ) => void;
}

export function createSignupForm(
  fb: FormBuilder,
  countries: ICountry[],
  destroyRef: DestroyRef
): SignupFormSetup {
  const form = new FormGroup<SignupFormControls>({
    fullName: fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(2)
    ]),
    email: fb.nonNullable.control('', [
      Validators.required,
      Validators.email
    ]),
    phoneCountryCode: fb.nonNullable.control(DEFAULT_PHONE_COUNTRY_CODE, [
      Validators.required,
      validCountryCodeValidator(countries)
    ]),
    phone: fb.nonNullable.control('', [Validators.required]),
    locationCountryCode: fb.nonNullable.control('', [
      Validators.required,
      validCountryCodeValidator(countries)
    ]),
    userType: fb.nonNullable.control<UserType>('buyer', [Validators.required]),
    password: fb.nonNullable.control('', [Validators.required]),
    agree: fb.nonNullable.control(false, [Validators.requiredTrue])
  });

  form.controls.phone.addValidators(
    phoneNumberValidator(
      () => form.controls.phoneCountryCode.value ?? '',
      countries
    )
  );

  form.controls.phoneCountryCode.valueChanges
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe(() => form.controls.phone.updateValueAndValidity());

  return {
    form,
    onFormValidChange(callback) {
      form.statusChanges
        .pipe(
          startWith(form.status),
          takeUntilDestroyed(destroyRef)
        )
        .subscribe(() => callback(form.valid));
    },
    syncSearchTerm(control, setSignal) {
      setSignal(control.value ?? '');
      control.valueChanges
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe((value: string | null) => setSignal((value ?? '').toString()));
    }
  };
}
