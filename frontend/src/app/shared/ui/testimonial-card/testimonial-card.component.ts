import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TestimonialItem } from '../../../core/models/home.models';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-testimonial-card',
  imports: [MatIconModule],
  templateUrl: './testimonial-card.component.html',
  styleUrl: './testimonial-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestimonialCardComponent {
  readonly item = input.required<TestimonialItem>();
}