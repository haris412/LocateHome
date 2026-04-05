import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CategoryItem } from '../../../core/models/home.models';

@Component({
  selector: 'app-category-card',
  imports: [MatIconModule],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryCardComponent {
  readonly item = input.required<CategoryItem>();
  readonly ctaClicked = output<CategoryItem>();

  onCtaClick(event: Event): void {
    event.preventDefault();
    this.ctaClicked.emit(this.item());
  }
}