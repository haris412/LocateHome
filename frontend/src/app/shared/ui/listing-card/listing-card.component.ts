import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ListingItem } from '../../../core/models/home.models';

@Component({
  selector: 'app-listing-card',
  imports: [MatIconModule],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingCardComponent {
  readonly item = input.required<ListingItem>();
  readonly variant = input<'default' | 'compact'>('default');
  readonly favoriteToggled = output<string>();
}