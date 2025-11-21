/**
 * Server Actions for Collaboration Features (P1.9)
 *
 * Internal notes, ratings, tags, and assignments for candidates
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Create a note on an application
 */
export async function createNote(applicationId: string, content: string, isInternal: boolean = true) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return {
        success: false,
        error: 'School profile not found'
      };
    }

    // Verify the application belongs to this school
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          schoolId: schoolProfile.id
        }
      }
    });

    if (!application) {
      return {
        success: false,
        error: 'Application not found'
      };
    }

    const note = await prisma.candidateNote.create({
      data: {
        applicationId,
        authorId: session.user.id,
        content,
        isInternal
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    revalidatePath('/school/applications');
    revalidatePath(`/school/applications/${applicationId}`);

    return {
      success: true,
      note
    };

  } catch (error: any) {
    console.error('Failed to create note:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all notes for an application
 */
export async function getApplicationNotes(applicationId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return {
        success: false,
        error: 'Unauthorized',
        notes: []
      };
    }

    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return {
        success: false,
        error: 'School profile not found',
        notes: []
      };
    }

    // Verify the application belongs to this school
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          schoolId: schoolProfile.id
        }
      }
    });

    if (!application) {
      return {
        success: false,
        error: 'Application not found',
        notes: []
      };
    }

    const notes = await prisma.candidateNote.findMany({
      where: {
        applicationId
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      notes
    };

  } catch (error: any) {
    console.error('Failed to get notes:', error);
    return {
      success: false,
      error: error.message,
      notes: []
    };
  }
}

/**
 * Delete a note
 */
export async function deleteNote(noteId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // Verify note belongs to this user
    const note = await prisma.candidateNote.findUnique({
      where: { id: noteId },
      include: {
        application: {
          include: {
            job: {
              select: {
                schoolId: true
              }
            }
          }
        }
      }
    });

    if (!note) {
      return {
        success: false,
        error: 'Note not found'
      };
    }

    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!schoolProfile || note.application.job.schoolId !== schoolProfile.id) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    await prisma.candidateNote.delete({
      where: { id: noteId }
    });

    revalidatePath('/school/applications');
    revalidatePath(`/school/applications/${note.applicationId}`);

    return {
      success: true
    };

  } catch (error: any) {
    console.error('Failed to delete note:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create or update rating for an application
 */
export async function updateCandidateRating(
  applicationId: string,
  rating: number,
  tags: string[],
  assignedToId?: string
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return {
        success: false,
        error: 'School profile not found'
      };
    }

    // Verify the application belongs to this school
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          schoolId: schoolProfile.id
        }
      }
    });

    if (!application) {
      return {
        success: false,
        error: 'Application not found'
      };
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return {
        success: false,
        error: 'Rating must be between 1 and 5'
      };
    }

    const candidateRating = await prisma.candidateRating.upsert({
      where: {
        applicationId
      },
      create: {
        applicationId,
        rating,
        tags,
        assignedToId
      },
      update: {
        rating,
        tags,
        assignedToId
      }
    });

    revalidatePath('/school/dashboard');
    revalidatePath('/school/applications');
    revalidatePath(`/school/applications/${applicationId}`);

    return {
      success: true,
      rating: candidateRating
    };

  } catch (error: any) {
    console.error('Failed to update rating:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get rating for an application
 */
export async function getCandidateRating(applicationId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return {
        success: false,
        error: 'Unauthorized',
        rating: null
      };
    }

    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return {
        success: false,
        error: 'School profile not found',
        rating: null
      };
    }

    // Verify the application belongs to this school
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          schoolId: schoolProfile.id
        }
      }
    });

    if (!application) {
      return {
        success: false,
        error: 'Application not found',
        rating: null
      };
    }

    const rating = await prisma.candidateRating.findUnique({
      where: {
        applicationId
      },
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return {
      success: true,
      rating
    };

  } catch (error: any) {
    console.error('Failed to get rating:', error);
    return {
      success: false,
      error: error.message,
      rating: null
    };
  }
}
