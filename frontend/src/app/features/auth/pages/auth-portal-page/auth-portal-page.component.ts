import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AuthHeroPanelComponent } from '../../components/auth-hero-panel/auth-hero-panel.component';
import { SignupCardComponent } from '../../components/signup-card/signup-card.component';
import { LoginCardComponent } from '../../components/login-card/login-card.component';
import { SegmentedTabsComponent } from '../../../../shared/ui/segmented-tabs/segmented-tabs.component';


@Component({
  selector: 'app-auth-portal-page',
  standalone: true,
  imports: [
    AuthHeroPanelComponent,
    SignupCardComponent,
    LoginCardComponent,
    SegmentedTabsComponent
  ],
  templateUrl: './auth-portal-page.component.html',
  styleUrl: './auth-portal-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthPortalPageComponent {
  readonly activeSegment = signal<'signup' | 'login'>('signup');
}