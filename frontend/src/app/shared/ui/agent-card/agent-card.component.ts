import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AgentItem } from '../../../core/models/agent.model';
import { MatIcon } from "@angular/material/icon";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-agent-card',
  templateUrl: './agent-card.component.html',
  styleUrl: './agent-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, RouterLink]
})
export class AgentCardComponent {
  readonly item = input.required<AgentItem>();
}
