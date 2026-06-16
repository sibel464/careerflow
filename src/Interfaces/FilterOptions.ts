import { ApplicationStatus } from './Application';

export interface FilterOptions {
  searchQuery: string;
  status: ApplicationStatus | 'Tümü';
  city: string | 'Tümü';
  sortBy: 'dateDesc' | 'dateAsc' | 'companyAsc' | 'companyDesc';
}
