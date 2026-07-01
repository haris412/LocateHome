import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroupDirective,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import {
  IssueType,
  ReportIssueService,
  ReportErrorResponse
} from '../../../../core/services/report-issue.service';

const ISSUE_TYPE_OPTIONS = [
  { value: 'listing'   as IssueType, label: 'Incorrect Listing' },
  { value: 'agent'     as IssueType, label: 'Agent Behaviour'   },
  { value: 'technical' as IssueType, label: 'Technical Problem' },
  { value: 'fraud'     as IssueType, label: 'Fraud or Scam'     },
  { value: 'other'     as IssueType, label: 'Other'             }
];

const FIELD_LABELS: Record<string, string> = {
  issueType:   'Issue type',
  description: 'Description'
};

function optionalEmailValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value?.trim()) return null;
  return Validators.email(control);
}

@Component({
  selector: 'app-report-issue-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './report-issue-page.component.html',
  styleUrl: './report-issue-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportIssuePageComponent {
  private readonly fb                 = inject(FormBuilder);
  private readonly reportIssueService = inject(ReportIssueService);

  @ViewChild(FormGroupDirective) private formDirective!: FormGroupDirective;

  readonly issueTypeOptions = ISSUE_TYPE_OPTIONS;

  readonly isSubmitting   = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly serverErrors   = signal<string[]>([]);

  readonly form = this.fb.nonNullable.group({
    issueType:     ['' as IssueType, [Validators.required]],
    description:   ['', [Validators.required, Validators.minLength(20), Validators.maxLength(3000)]],
    reporterName:  [''],
    reporterEmail: ['', [optionalEmailValidator]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set(null);
    this.serverErrors.set([]);

    const { issueType, description, reporterName, reporterEmail } = this.form.getRawValue();

    this.reportIssueService.submit({
      issueType,
      description,
      reporterName:  reporterName  || undefined,
      reporterEmail: reporterEmail || undefined
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);

        if (res.success) {
          this.successMessage.set(res.message);
          this.formDirective.resetForm();
        } else {
          const errorRes = res as ReportErrorResponse;
          const messages = errorRes.errors?.map(e => e.msg) ?? [errorRes.message];
          this.serverErrors.set(messages);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);

        const message = err.status === 429
          ? 'Too many reports submitted. Please try again later.'
          : 'Something went wrong. Please try again.';

        this.serverErrors.set([message]);
      }
    });
  }

  fieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) return null;

    if (control.errors['required'])  return `${FIELD_LABELS[field] ?? 'This field'} is required.`;
    if (control.errors['minlength']) return 'Description must be at least 20 characters.';
    if (control.errors['maxlength']) return 'Description cannot exceed 3000 characters.';
    if (control.errors['email'])     return 'Enter a valid email address.';

    return null;
  }
}
