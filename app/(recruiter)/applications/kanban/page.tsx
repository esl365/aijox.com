import { Metadata } from 'next';
import { KanbanBoard, KanbanApplication } from '@/components/kanban/board';

export const metadata: Metadata = {
  title: 'Application Pipeline - Kanban',
  description: 'Manage applications with Kanban board',
};

/**
 * Kanban Pipeline Page - Phase 2 Task 2.1-2.2
 */
export default async function KanbanPage() {
  // TODO: Fetch from database
  const mockApplications: KanbanApplication[] = [
    {
      id: '1',
      candidateName: 'John Doe',
      jobTitle: 'ESL Teacher - Seoul',
      appliedAt: '2 hours ago',
      status: 'new',
    },
    {
      id: '2',
      candidateName: 'Jane Smith',
      jobTitle: 'Math Teacher - Beijing',
      appliedAt: '5 hours ago',
      status: 'screening',
    },
    {
      id: '3',
      candidateName: 'Bob Johnson',
      jobTitle: 'Science Teacher - Dubai',
      appliedAt: '1 day ago',
      status: 'interview',
    },
    {
      id: '4',
      candidateName: 'Alice Williams',
      jobTitle: 'Elementary Teacher - Tokyo',
      appliedAt: '2 days ago',
      status: 'offer',
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Application Pipeline</h1>
        <p className="text-muted-foreground">Drag cards to update application status</p>
      </div>

      <KanbanBoard applications={mockApplications} />
    </div>
  );
}
