import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { ListingItem } from '../../../../core/models/listing.models';
import { ListingCardComponent } from '../../../../shared/ui/listing-card/listing-card.component';

@Component({
  selector: 'app-listings-grid',
  standalone: true,
  imports: [ListingCardComponent],
  templateUrl: './listings-grid.component.html',
  styleUrl: './listings-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingsGridComponent {
  readonly items = input.required<readonly ListingItem[]>();
  readonly viewMode = input<'grid' | 'list'>('grid');

  @Output() readonly cardClicked = new EventEmitter<string>();
  @Output() readonly favoriteToggled = new EventEmitter<string>();

  onCardClicked(id: string): void {
    console.log('grid forwarding', id);
    this.cardClicked.emit(id);
  }

  onFavoriteToggled(id: string): void {
    this.favoriteToggled.emit(id);
  }
}