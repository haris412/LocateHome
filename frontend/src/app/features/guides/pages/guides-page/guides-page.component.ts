import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface GuideCard {
  id:      string;
  icon:    string;
  title:   string;
  summary: string;
  tips:    string[];
}

const GUIDE_CARDS: GuideCard[] = [
  {
    id:      'buying',
    icon:    'home',
    title:   'Buying Property in Pakistan',
    summary: 'A step-by-step walkthrough of the property buying process, from shortlisting to transfer of ownership.',
    tips: [
      'Verify the property title and ownership documents before paying any token money.',
      'Always sign a written Sale Agreement (Bayana Nama) with clear terms.',
      'Confirm the property is free from dues, mortgages, or legal disputes.',
      'Check the FBR valuation to understand tax implications before purchase.',
      'Have a lawyer review all documents before the registry (Inteqal) is completed.',
      'Prefer paying through bank transfer rather than cash for a traceable record.'
    ]
  },
  {
    id:      'renting',
    icon:    'vpn_key',
    title:   'Renting the Right Way',
    summary: 'What to check before signing a lease and how to protect yourself as a tenant in Pakistan.',
    tips: [
      'Inspect the property in person and check for water, gas, and electricity connections.',
      'Always sign a formal Rent Agreement and have it attested by a notary.',
      'Clarify who is responsible for maintenance and utility bills in the agreement.',
      'Understand the advance and security deposit terms clearly before paying.',
      'Confirm the landlord\'s ownership of the property before handing over any money.',
      'Keep a copy of your rent agreement and receipts for all payments made.'
    ]
  },
  {
    id:      'selling',
    icon:    'sell',
    title:   'Selling Your Property',
    summary: 'How to price, list, and complete the sale of your property smoothly and legally.',
    tips: [
      'Get a professional valuation to price your property competitively.',
      'Ensure all property documents are up to date before listing.',
      'Use LocateHome\'s verified agent network to reach serious buyers faster.',
      'Disclose any known defects or disputes to avoid legal complications later.',
      'Collect all outstanding utility bills before finalising the sale.',
      'Work with a lawyer to draft the Sale Agreement and oversee the registry process.'
    ]
  },
  {
    id:      'agents',
    icon:    'groups',
    title:   'Working with Agents',
    summary: 'How to find a trustworthy real estate agent and get the most out of the relationship.',
    tips: [
      'Use LocateHome\'s verified agents — they are vetted and reviewed by real users.',
      'Always confirm the agent\'s credentials and agency before sharing personal details.',
      'Clarify the agent\'s commission structure upfront to avoid surprises.',
      'Ask the agent for recent transaction history in your target area.',
      'Never pay full commission before the deal is finalised and registered.',
      'If an agent pressures you into a quick decision, consider it a red flag.'
    ]
  },
  {
    id:      'documents',
    icon:    'description',
    title:   'Property Documents Explained',
    summary: 'A plain-language guide to the key property documents you will encounter in Pakistan.',
    tips: [
      'Fard-e-Malkiat: Ownership record issued by PLRA — the most important proof of ownership.',
      'Registry (Inteqal): The legal transfer of ownership, done at the Sub-Registrar office.',
      'NOC: No Objection Certificate from the housing authority or developer when required.',
      'Allotment Letter: Issued by housing societies as initial proof of plot/unit allocation.',
      'Mutation (Intiqal): Records the transfer in the local revenue department\'s records.',
      'FBR Tax Letter: Confirms any outstanding federal taxes on the property at time of sale.'
    ]
  },
  {
    id:      'safety',
    icon:    'security',
    title:   'Avoiding Property Fraud',
    summary: 'Common property scams in Pakistan and how to protect yourself when buying or renting.',
    tips: [
      'Never pay token money without first verifying ownership documents independently.',
      'Cross-check property details with the local revenue office or PLRA portal.',
      'Be cautious of deals that seem significantly below market price — they rarely are legitimate.',
      'Avoid agents who refuse to show original documents or delay verification.',
      'Only use LocateHome\'s secure platform for communication and payment initiation.',
      'Report suspicious listings or agents using the Report an Issue feature on our platform.'
    ]
  }
];

@Component({
  selector: 'app-guides-page',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './guides-page.component.html',
  styleUrl: './guides-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuidesPageComponent {
  readonly guides = GUIDE_CARDS;
}
