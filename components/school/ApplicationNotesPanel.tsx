'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Trash2, Clock } from 'lucide-react';
import { createNote, deleteNote } from '@/app/actions/collaboration';
import { useRouter } from 'next/navigation';

interface Note {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: Date;
  author: {
    name: string | null;
    email: string;
  };
}

interface ApplicationNotesPanelProps {
  applicationId: string;
  notes: Note[];
}

export function ApplicationNotesPanel({ applicationId, notes: initialNotes }: ApplicationNotesPanelProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    startTransition(async () => {
      try {
        const result = await createNote(applicationId, newNote, isInternal);
        if (result.success && result.note) {
          setNotes([result.note, ...notes]);
          setNewNote('');
          router.refresh();
        }
      } catch (error) {
        console.error('Failed to add note:', error);
      }
    });
  };

  const handleDeleteNote = async (noteId: string) => {
    startTransition(async () => {
      try {
        const result = await deleteNote(noteId);
        if (result.success) {
          setNotes(notes.filter(n => n.id !== noteId));
          router.refresh();
        }
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-xl">Internal Notes</CardTitle>
            <Badge variant="secondary" className="ml-2">
              {notes.length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add Note */}
          <div className="space-y-2">
            <Textarea
              placeholder="Add an internal note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[100px]"
              disabled={isPending}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isInternal"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded"
                  disabled={isPending}
                />
                <label htmlFor="isInternal" className="text-sm text-gray-600">
                  Internal only (not visible to candidate)
                </label>
              </div>
              <Button
                onClick={handleAddNote}
                disabled={isPending || !newNote.trim()}
                size="sm"
              >
                <Send className="h-4 w-4 mr-1" />
                Add Note
              </Button>
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {notes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notes yet</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {note.author.name || note.author.email}
                        </span>
                        {note.isInternal && (
                          <Badge variant="secondary" className="text-xs">
                            Internal
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(note.createdAt).toLocaleDateString()}{' '}
                        {new Date(note.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                      onClick={() => handleDeleteNote(note.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
