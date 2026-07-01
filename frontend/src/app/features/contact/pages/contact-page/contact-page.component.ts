import { ChangeDetectionStrategy, Component, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { ContactService, ContactErrorResponse } from '../../../../core/services/contact.service';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactPageComponent {
  private readonly fb             = inject(FormBuilder);
  private readonly contactService = inject(ContactService);

  @ViewChild(FormGroupDirective) private formDirective!: FormGroupDirective;

  readonly isSubmitting   = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly serverErrors   = signal<string[]>([]);

  readonly form = this.fb.nonNullable.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    phone:   ['', [Validators.required]],
    email:   ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set(null);
    this.serverErrors.set([]);

    this.contactService.send(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.successMessage.set(res.message);
          this.formDirective.resetForm(); // resets values + clears submitted state
        } else {
          this.serverErrors.set((res as ContactErrorResponse).errors);
        }
      },
      error: () => {
        this.isSubmitting.set(false);
        this.serverErrors.set(['Something went wrong. Please try again.']);
      }
    });
  }

  fieldError(field: 'name' | 'phone' | 'email' | 'message'): string | null {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) return null;

    if (control.errors['required'])  return `${this.fieldLabel(field)} is required.`;
    if (control.errors['email'])     return 'Enter a valid email address.';
    if (control.errors['minlength']) return `${this.fieldLabel(field)} is too short.`;

    return null;
  }

  private fieldLabel(field: string): string {
    const labels: Record<string, string> = {
      name: 'Name', phone: 'Phone', email: 'Email', message: 'Message'
    };
    return labels[field] ?? field;
  }
}
