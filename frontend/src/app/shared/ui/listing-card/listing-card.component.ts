import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ListingItem } from '../../../core/models/listing.models';
import { resolvePropertyImageUrlForDisplay } from '../../../features/listings/utils/property-image-url.util';

interface BootstrapTooltip {
  dispose(): void;
}

declare const bootstrap: {
  Tooltip: new (
    element: HTMLElement,
    options: {
      container: string;
      customClass: string;
      placement: string;
      trigger: string;
    }
  ) => BootstrapTooltip;
};

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingCardComponent implements AfterViewInit, OnDestroy {
  readonly item = input.required<ListingItem>();
  readonly variant = input<'default' | 'compact' | 'standalone'>('default');

  @ViewChild('titleTooltip') private titleTooltip?: ElementRef<HTMLElement>;
  @ViewChild('addressTooltip') private addressTooltip?: ElementRef<HTMLElement>;

  private readonly tooltips: BootstrapTooltip[] = [];

  /** Uses Property/API `images[].url` (S3, presigned HTTPS, or local). */
  readonly displayImageUrl = computed(() =>
    resolvePropertyImageUrlForDisplay(this.item().imageUrl)
  );

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

  // sanitizeRent(): void {
  //   const monthlyRentPattern = /\s*\/\s*mo\b/i;

  //   if (this.item().rent && monthlyRentPattern.test(this.item().price)) {
  //     this.item().price = this.item().price.replace(monthlyRentPattern, '');
  //   }
  // }

  ngAfterViewInit(): void {
    this.initializeTooltip(this.titleTooltip?.nativeElement);
    this.initializeTooltip(this.addressTooltip?.nativeElement);
  }

  ngOnDestroy(): void {
    this.tooltips.forEach(tooltip => tooltip.dispose());
  }

  private initializeTooltip(element: HTMLElement | undefined): void {
    if (!element || element.scrollWidth <= element.clientWidth) {
      return;
    }

    this.tooltips.push(
      new bootstrap.Tooltip(element, {
        container: 'body',
        customClass: 'listing-card-tooltip',
        placement: 'top',
        trigger: 'hover'
      })
    );
  }
}
