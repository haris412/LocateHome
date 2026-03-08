import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-brand-logo',
  imports: [MatIconModule],
  templateUrl: './brand-logo.component.html',
  styleUrl: './brand-logo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandLogoComponent {}