import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import type { ICountry } from 'country-state-city';

/** Min/max digit length by country isoCode (e.g. PK, US, AU) */
const PHONE_LENGTH_BY_ISO: Record<string, { min: number; max: number }> = {
  US: { min: 10, max: 10 },
  CA: { min: 10, max: 10 },
  PK: { min: 10, max: 10 },
  IN: { min: 10, max: 10 },
  AU: { min: 9, max: 9 },
  GB: { min: 10, max: 11 },
  DE: { min: 10, max: 11 },
  FR: { min: 9, max: 9 },
  IT: { min: 9, max: 11 },
  ES: { min: 9, max: 9 },
  NL: { min: 9, max: 9 },
  BE: { min: 9, max: 9 },
  AT: { min: 10, max: 13 },
  CH: { min: 9, max: 9 },
  CN: { min: 11, max: 11 },
  JP: { min: 10, max: 10 },
  KR: { min: 9, max: 10 },
  SG: { min: 8, max: 8 },
  MY: { min: 9, max: 10 },
  AE: { min: 9, max: 9 },
  SA: { min: 9, max: 9 },
  TR: { min: 10, max: 10 },
  RU: { min: 10, max: 10 },
  BR: { min: 10, max: 11 },
  MX: { min: 10, max: 10 },
  AR: { min: 10, max: 11 },
  ZA: { min: 9, max: 9 },
  EG: { min: 9, max: 9 },
  NG: { min: 10, max: 11 },
  KE: { min: 9, max: 9 },
};

/** Default when country not in map */
const DEFAULT_LENGTH = { min: 7, max: 15 };

export function phoneNumberValidator(
  getCountryCode: () => string,
  countries: ICountry[]
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = (control.value ?? '').toString().trim();
    if (!raw) return null;

    const digits = raw.replace(/\D/g, '');
    if (!digits) return null;

    if (raw.startsWith('0')) {
      return {
        phoneLeadingZero: true,
        message: 'Enter number without leading 0 (e.g. 1234567890)'
      };
    }

    const isoCode = getCountryCode();
    const lenConfig = PHONE_LENGTH_BY_ISO[isoCode] ?? DEFAULT_LENGTH;

    if (digits.length < lenConfig.min) {
      return {
        phoneTooShort: true,
        message: `Number should be at least ${lenConfig.min} digits`
      };
    }
    if (digits.length > lenConfig.max) {
      return {
        phoneTooLong: true,
        message: `Number should be at most ${lenConfig.max} digits`
      };
    }
    return null;
  };
}
