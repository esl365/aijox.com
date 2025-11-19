/**
 * UploadThing Configuration for Agent 1: AI Screener
 *
 * Handles video uploads to Cloudflare R2 and triggers analysis
 */

import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { analyzeTeacherVideo } from '@/app/actions/analyze-video';

const f = createUploadthing();

export const ourFileRouter = {
  /**
   * Teacher video resume uploader
   * - Max 64MB
   * - MP4, WebM, MOV formats
   * - One video per teacher
   */
  videoResume: f({
    video: {
      maxFileSize: '64MB',
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // Authenticate user
      const session = await auth();

      if (!session?.user?.id) {
        throw new Error('Unauthorized');
      }

      // Verify user is a teacher
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      });

      if (user?.role !== 'TEACHER') {
        throw new Error('Only teachers can upload video resumes');
      }

      // Get teacher profile
      const profile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (!profile) {
        throw new Error('Teacher profile not found. Please complete your profile first.');
      }

      return {
        userId: session.user.id,
        profileId: profile.id
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Video upload complete:', {
        profileId: metadata.profileId,
        fileKey: file.key,
        fileUrl: file.url
      });

      try {
        // 1. Update profile with video URL
        await prisma.teacherProfile.update({
          where: { id: metadata.profileId },
          data: {
            videoUrl: file.url,
            videoKey: file.key,
            videoUploadedAt: new Date(),
            videoAnalysisStatus: 'PENDING'
          }
        });

        // 2. Trigger AI analysis (fire and forget - runs in background)
        analyzeTeacherVideo(metadata.profileId).catch((error) => {
          console.error('Background video analysis failed:', error);
        });

        return {
          profileId: metadata.profileId,
          videoUrl: file.url,
          message: 'Video uploaded successfully. Analysis in progress...'
        };

      } catch (error) {
        console.error('Failed to update profile after upload:', error);
        throw error;
      }
    }),

  /**
   * Profile image uploader
   * - Max 4MB
   * - JPG, PNG formats
   */
  profileImage: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user?.id) {
        throw new Error('Unauthorized');
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Update user profile image
      await prisma.user.update({
        where: { id: metadata.userId },
        data: {
          image: file.url
        }
      });

      return { imageUrl: file.url };
    }),

  /**
   * Document uploader (certificates, degrees, etc.)
   * - Max 8MB
   * - PDF, JPG, PNG formats
   */
  documents: f({
    pdf: { maxFileSize: '8MB', maxFileCount: 5 },
    image: { maxFileSize: '8MB', maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user?.id) {
        throw new Error('Unauthorized');
      }

      const profile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (!profile) {
        throw new Error('Profile not found');
      }

      return {
        userId: session.user.id,
        profileId: profile.id
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Store document reference in database
      await prisma.document.create({
        data: {
          profileId: metadata.profileId,
          type: file.type.startsWith('image/') ? 'IMAGE' : 'PDF',
          url: file.url,
          key: file.key,
          name: file.name,
          size: file.size,
        }
      });

      return { documentUrl: file.url };
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
