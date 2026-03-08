import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FeatureCardComponent } from '../../../../shared/ui/feature-card/feature-card.component';
import { SocialButtonComponent } from '../../../../shared/ui/social-button/social-button.component';
import { FeatureItem } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-login-card',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    FeatureCardComponent,
    SocialButtonComponent
  ],
  templateUrl: './login-card.component.html',
  styleUrl: './login-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginCardComponent {
  private readonly fb = inject(FormBuilder);

  readonly hidePassword = signal(true);

  readonly features = signal<FeatureItem[]>([
    {
      icon: 'favorite_border',
      title: 'Saved properties',
      description: 'Return to your shortlisted homes and rental picks instantly.'
    },
    {
      icon: 'videocam',
      title: 'Video tours',
      description: 'Resume property walkthroughs and media uploads from the dashboard.'
    },
    {
      icon: 'apartment',
      title: 'Manage listings',
      description: 'Track buyer inquiries, schedule visits and update listing details.'
    }
  ]);

  readonly form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false]
  });

  readonly canSubmit = computed(() => this.form.valid);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log(this.form.getRawValue());
  }
}