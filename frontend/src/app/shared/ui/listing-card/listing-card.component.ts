import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ListingItem } from '../../../core/models/listing.models';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingCardComponent {
  readonly item = input.required<ListingItem>();
  readonly variant = input<'default' | 'compact' | 'standalone'>('default');

  @Output() readonly favoriteToggled = new EventEmitter<string>();
  @Output() readonly cardClicked = new EventEmitter<string>();

  onCardClick(): void {
    console.log('card clicked', this.item().id);
    this.cardClicked.emit(this.item().id);
  }

  onFavoriteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.favoriteToggled.emit(this.item().id);
  }
}