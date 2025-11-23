'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

/**
 * Calendar Picker - Phase 2 Task 3.3
 * Interview scheduling with availability slots
 */

interface TimeSlot {
  id: string;
  datetime: string;
  available: boolean;
}

interface CalendarPickerProps {
  onSelectSlot?: (slot: TimeSlot) => void;
}

export function CalendarPicker({ onSelectSlot }: CalendarPickerProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Mock availability slots
  const mockSlots: TimeSlot[] = [
    { id: '1', datetime: 'Mon, Dec 4, 2024 - 10:00 AM', available: true },
    { id: '2', datetime: 'Mon, Dec 4, 2024 - 2:00 PM', available: true },
    { id: '3', datetime: 'Tue, Dec 5, 2024 - 10:00 AM', available: false },
    { id: '4', datetime: 'Tue, Dec 5, 2024 - 2:00 PM', available: true },
    { id: '5', datetime: 'Wed, Dec 6, 2024 - 10:00 AM', available: true },
    { id: '6', datetime: 'Wed, Dec 6, 2024 - 2:00 PM', available: true },
  ];

  const handleSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
  };

  const handleConfirm = () => {
    if (selectedSlot) {
      onSelectSlot?.(selectedSlot);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Interview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select an available time slot for your interview
        </p>

        <div className="space-y-2">
          {mockSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleSelect(slot)}
              disabled={!slot.available}
              className={`
                w-full p-3 rounded-lg border-2 text-left transition-colors
                ${
                  selectedSlot?.id === slot.id
                    ? 'border-primary bg-primary/10'
                    : slot.available
                    ? 'border-gray-300 hover:border-primary'
                    : 'border-gray-200 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <p className="text-sm font-medium">{slot.datetime}</p>
              {!slot.available && (
                <p className="text-xs text-muted-foreground">Not available</p>
              )}
            </button>
          ))}
        </div>

        <Button
          onClick={handleConfirm}
          disabled={!selectedSlot}
          className="w-full"
        >
          Confirm Interview Time
        </Button>
      </CardContent>
    </Card>
  );
}
