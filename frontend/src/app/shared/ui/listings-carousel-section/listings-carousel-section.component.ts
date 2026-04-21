import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  computed,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ListingItem } from '../../../core/models/listing.models';
import { ListingCardComponent } from '../listing-card/listing-card.component';
import { Router, RouterLink } from '@angular/router';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

@Component({
  selector: 'app-listings-carousel-section',
  imports: [MatIconModule, ListingCardComponent, RouterLink],
  templateUrl: './listings-carousel-section.component.html',
  styleUrl: './listings-carousel-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingsCarouselSectionComponent {
  readonly title = input.required<string>();
  readonly titleSmall = input<boolean>(false);
  readonly subtitle = input<string>('');
  readonly linkLabel = input<string>('');
  readonly items = input.required<readonly ListingItem[] | undefined>();
  readonly variant = input<'default' | 'compact' | 'standalone'>('standalone');
  readonly showEyebrow = input<boolean>(false);
  readonly smallContent = input<boolean>(false);
  readonly isFeatured = input<boolean>(false);
  readonly scrollSnap = input<boolean>(true);

  @Output() readonly cardClicked = new EventEmitter<string>();
  @Output() readonly favoriteToggled = new EventEmitter<string>();

  readonly trackRef = viewChild<ElementRef<HTMLDivElement>>('track');
  private readonly router = inject(Router);

  readonly scrollLeft = signal(0);
  readonly clientWidth = signal(0);
  readonly scrollWidth = signal(0);

  readonly hasItems = computed(() => !!this.items() && this.items()!.length > 0);
  readonly isOverflowing = computed(() => this.scrollWidth() > this.clientWidth() + 1);
  readonly canScrollPrev = computed(() => this.scrollLeft() > 0);
  readonly canScrollNext = computed(() => {
    const maxScroll = this.scrollWidth() - this.clientWidth();
    return this.scrollLeft() < maxScroll - 1;
  });

  ngAfterViewInit(): void {
    queueMicrotask(() => this.updateTrackMetrics());
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateTrackMetrics();
  }

  scrollPrev(): void {
    const element = this.trackRef()?.nativeElement;
    if (!element) return;

    element.scrollBy({
      left: -Math.max(280, element.clientWidth * 0.9),
      behavior: 'smooth'
    });
  }

  scrollNext(): void {
    const element = this.trackRef()?.nativeElement;
    if (!element) return;

    element.scrollBy({
      left: Math.max(280, element.clientWidth * 0.9),
      behavior: 'smooth'
    });
  }

  onTrackScroll(): void {
    this.updateTrackMetrics();
  }

  onFavoriteToggled(id: string): void {
    this.favoriteToggled.emit(id);
  }

  private updateTrackMetrics(): void {
    const element = this.trackRef()?.nativeElement;
    if (!element) return;

    this.scrollLeft.set(element.scrollLeft);
    this.clientWidth.set(element.clientWidth);
    this.scrollWidth.set(element.scrollWidth);
  }

  onCardClicked(id: string): void {
    this.router.navigate(['/listings', id]);
    this.cardClicked.emit(id);
  }
}
