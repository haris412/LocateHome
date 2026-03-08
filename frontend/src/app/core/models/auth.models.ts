
export interface StatItem {
  value: string;
  label: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface UserTypeOption {
  value: 'buyer' | 'seller' | 'renter' | 'agent';
  label: string;
}