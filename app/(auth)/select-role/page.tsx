import { Metadata } from 'next';
import SelectRolePageClient from './SelectRolePageClient';

export const metadata: Metadata = {
  title: 'Select Your Role | Global Educator Nexus',
  description: 'Choose your role to get started',
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function SelectRolePage() {
  return <SelectRolePageClient />;
}
