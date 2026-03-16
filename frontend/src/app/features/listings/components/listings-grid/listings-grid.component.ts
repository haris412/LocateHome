import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ListingItem } from '../../../../core/models/listing.models';
import { ListingCardComponent } from '../../../../shared/ui/listing-card/listing-card.component';

@Component({
  selector: 'app-listings-grid',
  imports: [ListingCardComponent],
  templateUrl: './listings-grid.component.html',
  styleUrl: './listings-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingsGridComponent {
  readonly items = input.required<readonly ListingItem[]>();
  readonly viewMode = input<'grid' | 'list'>('grid');
}