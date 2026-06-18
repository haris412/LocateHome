import { ChangeDetectionStrategy, Component } from '@angular/core';

interface PolicySection {
  title:      string;
  paragraphs: string[];
}

const LAST_UPDATED = 'June 18, 2026';

const POLICY_SECTIONS: PolicySection[] = [
  {
    title: 'Information We Collect',
    paragraphs: [
      'We collect information you provide directly to us when you create an account, submit a property inquiry, book an appointment, or contact us through our platform.',
      'This includes your name, email address, phone number, and any messages you send. We may also collect usage data such as pages visited, search terms entered, and properties viewed.'
    ]
  },
  {
    title: 'How We Use Your Information',
    paragraphs: [
      'We use the information we collect to operate and improve our platform, respond to your inquiries, connect you with property agents, and send you relevant updates about listings you have shown interest in.',
      'We do not sell your personal information to third parties. Your data is used solely to provide and enhance the services you request.'
    ]
  },
  {
    title: 'Cookies and Tracking',
    paragraphs: [
      'We use cookies and similar tracking technologies to remember your preferences, keep you logged in, and analyse how our platform is used. You can control cookie settings through your browser at any time.',
      'Some third-party services we use, such as Google Maps, may set their own cookies subject to their own privacy policies.'
    ]
  },
  {
    title: 'Data Sharing',
    paragraphs: [
      'We share your information only with property agents and agencies when you initiate contact or book an appointment. We may also share data with service providers who help us operate our platform, under strict confidentiality agreements.',
      'We may disclose your information if required by law or to protect the rights and safety of our users and platform.'
    ]
  },
  {
    title: 'Data Retention',
    paragraphs: [
      'We retain your personal information for as long as your account is active or as needed to provide you with our services. You may request deletion of your account and associated data at any time by contacting us.'
    ]
  },
  {
    title: 'Your Rights',
    paragraphs: [
      'You have the right to access, correct, or delete the personal information we hold about you. You may also object to or restrict certain processing of your data.',
      'To exercise any of these rights, please contact us at the address provided in the Contact Us section of our platform.'
    ]
  },
  {
    title: 'Security',
    paragraphs: [
      'We take reasonable technical and organisational measures to protect your personal information against unauthorised access, loss, or misuse. However, no method of transmission over the internet is completely secure.'
    ]
  },
  {
    title: 'Changes to This Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. We encourage you to review this page periodically to stay informed about how we protect your information.'
    ]
  }
];

@Component({
  selector: 'app-privacy-policy-page',
  standalone: true,
  templateUrl: './privacy-policy-page.component.html',
  styleUrl: './privacy-policy-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyPageComponent {
  readonly lastUpdated  = LAST_UPDATED;
  readonly sections     = POLICY_SECTIONS;
}
