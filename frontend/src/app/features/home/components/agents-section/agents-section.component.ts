import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AgentItem } from '../../../../core/models/home.models';
import { SectionHeadingComponent } from '../../../../shared/ui/section-heading/section-heading.component';
import { AgentCardComponent } from '../../../../shared/ui/agent-card/agent-card.component';

@Component({
  selector: 'app-agents-section',
  imports: [SectionHeadingComponent, AgentCardComponent],
  templateUrl: './agents-section.component.html',
  styleUrl: './agents-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentsSectionComponent {
  readonly items = input.required<readonly AgentItem[]>();
}