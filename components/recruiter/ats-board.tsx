'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GripVertical, MoreVertical, Mail, Eye, X, CheckCircle } from 'lucide-react';

type ApplicationStatus = 'NEW' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';

interface Application {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  jobTitle: string;
  matchScore?: number;
  appliedAt: Date;
  status: ApplicationStatus;
  email: string;
  subjects: string[];
  yearsExperience?: number;
  videoAnalyzed: boolean;
  visaEligible: boolean;
}

interface Column {
  id: ApplicationStatus;
  title: string;
  color: string;
  applications: Application[];
}

interface ATSBoardProps {
  initialApplications: Application[];
  onStatusChange?: (applicationId: string, newStatus: ApplicationStatus) => Promise<void>;
  onViewProfile?: (teacherId: string) => void;
  onSendEmail?: (applicationId: string) => void;
}

// Sortable application card
function ApplicationCard({ application, onViewProfile, onSendEmail }: {
  application: Application;
  onViewProfile?: (teacherId: string) => void;
  onSendEmail?: (applicationId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const initials = application.teacherName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="mb-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
        <CardContent className="p-4">
          {/* Drag Handle & Menu */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              <button
                className="cursor-grab active:cursor-grabbing touch-none"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={application.teacherAvatar} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{application.teacherName}</h4>
                <p className="text-xs text-muted-foreground truncate">{application.jobTitle}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewProfile?.(application.teacherId)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSendEmail?.(application.id)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Match Score & Badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            {application.matchScore && (
              <Badge variant="default" className="bg-primary">
                {application.matchScore}% Match
              </Badge>
            )}
            {application.videoAnalyzed && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Video ✓
              </Badge>
            )}
            {application.visaEligible ? (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Visa OK
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700">
                Visa Issue
              </Badge>
            )}
          </div>

          {/* Subjects */}
          <div className="flex flex-wrap gap-1 mb-2">
            {application.subjects.slice(0, 2).map((subject) => (
              <Badge key={subject} variant="secondary" className="text-xs">
                {subject}
              </Badge>
            ))}
            {application.subjects.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{application.subjects.length - 2}
              </Badge>
            )}
          </div>

          {/* Experience & Date */}
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            {application.yearsExperience && (
              <span>{application.yearsExperience} yrs exp</span>
            )}
            <span>{new Date(application.appliedAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Droppable column
function ATSColumn({ column, onViewProfile, onSendEmail }: {
  column: Column;
  onViewProfile?: (teacherId: string) => void;
  onSendEmail?: (applicationId: string) => void;
}) {
  return (
    <div className="flex-1 min-w-[300px]">
      <Card className={`border-t-4 ${column.color}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="text-base font-semibold">{column.title}</span>
            <Badge variant="secondary" className="ml-2">
              {column.applications.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-250px)] overflow-y-auto">
          <SortableContext
            items={column.applications.map((app) => app.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.applications.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No applications
              </div>
            ) : (
              column.applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onViewProfile={onViewProfile}
                  onSendEmail={onSendEmail}
                />
              ))
            )}
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}

export function ATSBoard({
  initialApplications,
  onStatusChange,
  onViewProfile,
  onSendEmail,
}: ATSBoardProps) {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'NEW',
      title: 'New Applications',
      color: 'border-t-blue-500',
      applications: initialApplications.filter((app) => app.status === 'NEW'),
    },
    {
      id: 'SCREENING',
      title: 'Screening',
      color: 'border-t-yellow-500',
      applications: initialApplications.filter((app) => app.status === 'SCREENING'),
    },
    {
      id: 'INTERVIEW',
      title: 'Interview',
      color: 'border-t-purple-500',
      applications: initialApplications.filter((app) => app.status === 'INTERVIEW'),
    },
    {
      id: 'OFFER',
      title: 'Offer',
      color: 'border-t-orange-500',
      applications: initialApplications.filter((app) => app.status === 'OFFER'),
    },
    {
      id: 'HIRED',
      title: 'Hired',
      color: 'border-t-green-500',
      applications: initialApplications.filter((app) => app.status === 'HIRED'),
    },
    {
      id: 'REJECTED',
      title: 'Rejected',
      color: 'border-t-red-500',
      applications: initialApplications.filter((app) => app.status === 'REJECTED'),
    },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = (id: string) => {
    return columns.find((col) => col.applications.some((app) => app.id === id));
  };

  const findApplication = (id: string) => {
    for (const column of columns) {
      const application = column.applications.find((app) => app.id === id);
      if (application) return application;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId) || columns.find((col) => col.id === overId);

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return;

    setColumns((prevColumns) => {
      const activeItems = activeColumn.applications;
      const overItems = overColumn.applications;
      const activeIndex = activeItems.findIndex((app) => app.id === activeId);
      const activeItem = activeItems[activeIndex];

      return prevColumns.map((col) => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            applications: activeItems.filter((app) => app.id !== activeId),
          };
        }
        if (col.id === overColumn.id) {
          return {
            ...col,
            applications: [...overItems, { ...activeItem, status: overColumn.id }],
          };
        }
        return col;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId) || columns.find((col) => col.id === overId);

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id === overColumn.id) {
      // Reorder within same column
      const activeIndex = activeColumn.applications.findIndex((app) => app.id === activeId);
      const overIndex = activeColumn.applications.findIndex((app) => app.id === overId);

      if (activeIndex !== overIndex) {
        setColumns((prevColumns) =>
          prevColumns.map((col) =>
            col.id === activeColumn.id
              ? {
                  ...col,
                  applications: arrayMove(col.applications, activeIndex, overIndex),
                }
              : col
          )
        );
      }
    } else {
      // Call the status change callback
      await onStatusChange?.(activeId, overColumn.id);
    }
  };

  const activeApplication = activeId ? findApplication(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <ATSColumn
            key={column.id}
            column={column}
            onViewProfile={onViewProfile}
            onSendEmail={onSendEmail}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApplication ? (
          <Card className="w-[300px] shadow-lg rotate-3">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activeApplication.teacherAvatar} />
                  <AvatarFallback>
                    {activeApplication.teacherName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-sm">{activeApplication.teacherName}</h4>
                  <p className="text-xs text-muted-foreground">{activeApplication.jobTitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Summary stats component
export function ATSStats({ applications }: { applications: Application[] }) {
  const stats = {
    total: applications.length,
    new: applications.filter((app) => app.status === 'NEW').length,
    screening: applications.filter((app) => app.status === 'SCREENING').length,
    interview: applications.filter((app) => app.status === 'INTERVIEW').length,
    offer: applications.filter((app) => app.status === 'OFFER').length,
    hired: applications.filter((app) => app.status === 'HIRED').length,
    rejected: applications.filter((app) => app.status === 'REJECTED').length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          <div className="text-xs text-muted-foreground">New</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.screening}</div>
          <div className="text-xs text-muted-foreground">Screening</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.interview}</div>
          <div className="text-xs text-muted-foreground">Interview</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.offer}</div>
          <div className="text-xs text-muted-foreground">Offer</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.hired}</div>
          <div className="text-xs text-muted-foreground">Hired</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-xs text-muted-foreground">Rejected</div>
        </CardContent>
      </Card>
    </div>
  );
}
