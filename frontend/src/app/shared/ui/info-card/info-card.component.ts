import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './info-card.component.html',
  styleUrl: './info-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoCardComponent {
  readonly compact = input(false);
  readonly surface = input<'default' | 'soft'>('default');
}