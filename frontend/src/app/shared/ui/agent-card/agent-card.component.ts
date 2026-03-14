import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AgentItem } from '../../../core/models/home.models';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-agent-card',
  templateUrl: './agent-card.component.html',
  styleUrl: './agent-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class AgentCardComponent {
  readonly item = input.required<AgentItem>();
}