import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ListingAgent } from '../../../core/models/listing-detail.vm';
import { InfoCardComponent } from '../info-card/info-card.component';

@Component({
  selector: 'app-contact-agent-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    InfoCardComponent
  ],
  templateUrl: './contact-agent-form.component.html',
  styleUrl: './contact-agent-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactAgentFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly agent = input.required<ListingAgent>();
  readonly submitLabel = input('Request a tour');
  readonly secondary1 = input('Book appointment');
  readonly secondary2 = input('Ask a question');
  readonly defaultMessage = input('');

  @Output() readonly submitted = new EventEmitter<{
    name: string;
    email: string;
    phone: string;
    message: string;
  }>();

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    this.form.patchValue({
      message: this.defaultMessage()
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }
}