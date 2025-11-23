/**
 * Reusable loading screen component for onboarding flows
 */

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-blue-600 rounded-full opacity-20 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}
