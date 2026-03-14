import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  input,
  signal,
  viewChild
} from '@angular/core';
import { TrendItem } from '../../../../core/models/home.models';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-trending-panel',
  imports: [MatIconModule],
  templateUrl: './trending-panel.component.html',
  styleUrl: './trending-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrendingPanelComponent {
  readonly items = input.required<readonly TrendItem[]>();

  readonly trackRef = viewChild<ElementRef<HTMLDivElement>>('track');

  readonly scrollLeft = signal(0);
  readonly clientWidth = signal(0);
  readonly scrollWidth = signal(0);

  readonly pagedItems = computed(() => {
    const source = this.items();
    const pages: TrendItem[][] = [];

    for (let index = 0; index < source.length; index += 4) {
      pages.push([...source.slice(index, index + 4)]);
    }

    return pages;
  });

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
    if (!element) {
      return;
    }

    element.scrollBy({
      left: -element.clientWidth,
      behavior: 'smooth'
    });
  }

  scrollNext(): void {
    const element = this.trackRef()?.nativeElement;
    if (!element) {
      return;
    }

    element.scrollBy({
      left: element.clientWidth,
      behavior: 'smooth'
    });
  }

  onTrackScroll(): void {
    this.updateTrackMetrics();
  }

  private updateTrackMetrics(): void {
    const element = this.trackRef()?.nativeElement;
    if (!element) {
      return;
    }

    this.scrollLeft.set(element.scrollLeft);
    this.clientWidth.set(element.clientWidth);
    this.scrollWidth.set(element.scrollWidth);
  }
}