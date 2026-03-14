import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CategoryItem } from '../../../../core/models/home.models';
import { SectionHeadingComponent } from '../../../../shared/ui/section-heading/section-heading.component';
import { CategoryCardComponent } from '../../../../shared/ui/category-card/category-card.component';

@Component({
  selector: 'app-categories-section',
  imports: [SectionHeadingComponent, CategoryCardComponent],
  templateUrl: './categories-section.component.html',
  styleUrl: './categories-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesSectionComponent {
  readonly items = input.required<readonly CategoryItem[]>();
}