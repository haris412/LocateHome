import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PropertyAmenityItem } from '../../../core/models/property-detail.vm';
import { InfoCardComponent } from '../info-card/info-card.component';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

@Component({
  selector: 'app-amenities-grid',
  standalone: true,
  imports: [MatIconModule, InfoCardComponent, SectionHeadingComponent],
  templateUrl: './amenities-grid.component.html',
  styleUrl: './amenities-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmenitiesGridComponent {
  readonly title = input('Highlights & amenities');
  readonly items = input<PropertyAmenityItem[]>([]);
}