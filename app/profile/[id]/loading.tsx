import { TeacherProfileSkeleton } from '@/components/skeletons/profile-skeleton';

export default function ProfileLoading() {
  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <TeacherProfileSkeleton />
    </div>
  );
}
