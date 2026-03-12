import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TestimonialItem } from '../../../core/models/home.models';

@Component({
  selector: 'app-testimonial-card',
  templateUrl: './testimonial-card.component.html',
  styleUrl: './testimonial-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestimonialCardComponent {
  readonly item = input.required<TestimonialItem>();
}