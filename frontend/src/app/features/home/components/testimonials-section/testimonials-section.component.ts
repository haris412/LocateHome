import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TestimonialItem } from '../../../../core/models/home.models';
import { SectionHeadingComponent } from '../../../../shared/ui/section-heading/section-heading.component';
import { TestimonialCardComponent } from '../../../../shared/ui/testimonial-card/testimonial-card.component';

@Component({
  selector: 'app-testimonials-section',
  imports: [SectionHeadingComponent, TestimonialCardComponent],
  templateUrl: './testimonials-section.component.html',
  styleUrl: './testimonials-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestimonialsSectionComponent {
  readonly items = input.required<readonly TestimonialItem[]>();
}