import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-agents-hero',
  templateUrl: './agents-hero.component.html',
  styleUrl: './agents-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentsHeroComponent {}
