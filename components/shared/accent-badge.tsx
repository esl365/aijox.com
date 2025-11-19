import { Badge } from '@/components/ui/badge';
import { Mic } from 'lucide-react';

type AccentType = 'North American' | 'British' | 'Australian' | 'Asian' | 'European' | 'Other';

interface AccentBadgeProps {
  accentType: AccentType;
  clarityScore?: number;
  showScore?: boolean;
}

const ACCENT_COLORS: Record<AccentType, string> = {
  'North American': 'bg-blue-100 text-blue-800 border-blue-300',
  'British': 'bg-purple-100 text-purple-800 border-purple-300',
  'Australian': 'bg-green-100 text-green-800 border-green-300',
  'Asian': 'bg-orange-100 text-orange-800 border-orange-300',
  'European': 'bg-pink-100 text-pink-800 border-pink-300',
  'Other': 'bg-gray-100 text-gray-800 border-gray-300',
};

export function AccentBadge({ accentType, clarityScore, showScore = true }: AccentBadgeProps) {
  const colorClass = ACCENT_COLORS[accentType] || ACCENT_COLORS['Other'];

  return (
    <Badge variant="outline" className={`${colorClass} gap-1`}>
      <Mic className="h-3 w-3" />
      {accentType}
      {showScore && clarityScore !== undefined && (
        <span className="ml-1 font-semibold">({clarityScore}/10)</span>
      )}
    </Badge>
  );
}

// Compact version for lists
export function AccentBadgeCompact({ accentType }: { accentType: AccentType }) {
  const colorClass = ACCENT_COLORS[accentType] || ACCENT_COLORS['Other'];

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      <Mic className="h-3 w-3" />
      {accentType.split(' ')[0]} {/* Show first word only */}
    </div>
  );
}
