import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FooterLinkGroup } from '../../../../core/models/home.models';

@Component({
  selector: 'app-footer-section',
  templateUrl: './footer-section.component.html',
  styleUrl: './footer-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterSectionComponent {
  readonly groups = input.required<readonly FooterLinkGroup[]>();
}