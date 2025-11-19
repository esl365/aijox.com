import TeacherSetupClient from './TeacherSetupClient';

// Force dynamic rendering to avoid build-time session issues
export const dynamic = 'force-dynamic';

export default function TeacherSetupPage() {
  return <TeacherSetupClient />;
}
