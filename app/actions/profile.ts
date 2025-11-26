/**
 * Server Actions for Teacher Profile Management
 *
 * Handles profile fetching, updates, and completeness calculation
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export type TeacherProfileSummary = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  name: string;
  phone?: string | null;
  bio?: string | null;
  currentCountry?: string | null;
  preferredCountries: string[];
  yearsExperience: number;
  subjects: string[];
  degreeLevel?: string | null;
  degreeMajor?: string | null;
  certifications: string[];
  hasTeachingLicense: boolean;
  hasTEFL: boolean;
  citizenship?: string | null;
  videoUrl?: string | null;
  videoAnalysisStatus?: string | null;
  profileCompleteness: number;
  minSalaryUSD?: number | null;
  maxSalaryUSD?: number | null;
  availableFrom?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfileCompletenessResult = {
  completeness: number;
  missingFields: string[];
  suggestions: string[];
};

/**
 * Get current user's teacher profile
 */
export async function getCurrentProfile(): Promise<TeacherProfileSummary | null> {
  try {
    const session = await auth();

    if (!session?.user?.teacherProfileId) {
      return null;
    }

    const profile = await prisma.teacherProfile.findUnique({
      where: { id: session.user.teacherProfileId },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        phone: true,
        bio: true,
        currentCountry: true,
        preferredCountries: true,
        yearsExperience: true,
        subjects: true,
        degreeLevel: true,
        degreeMajor: true,
        certifications: true,
        hasTeachingLicense: true,
        hasTEFL: true,
        citizenship: true,
        videoUrl: true,
        videoAnalysisStatus: true,
        profileCompleteness: true,
        minSalaryUSD: true,
        maxSalaryUSD: true,
        availableFrom: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!profile) {
      return null;
    }

    return {
      ...profile,
      name: `${profile.firstName} ${profile.lastName}`,
    };

  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return null;
  }
}

/**
 * Calculate profile completeness
 * Returns percentage (0-100) and list of missing fields
 */
export async function calculateProfileCompleteness(): Promise<ProfileCompletenessResult> {
  try {
    const session = await auth();

    if (!session?.user?.teacherProfileId) {
      return {
        completeness: 0,
        missingFields: [],
        suggestions: []
      };
    }

    const profile = await prisma.teacherProfile.findUnique({
      where: { id: session.user.teacherProfileId }
    });

    if (!profile) {
      return {
        completeness: 0,
        missingFields: [],
        suggestions: []
      };
    }

    // Define required fields with weights
    const fields = [
      { key: 'firstName', weight: 5, required: true },
      { key: 'lastName', weight: 5, required: true },
      { key: 'phone', weight: 5, required: false },
      { key: 'bio', weight: 10, required: true },
      { key: 'currentCountry', weight: 5, required: true },
      { key: 'preferredCountries', weight: 10, required: true, isArray: true },
      { key: 'yearsExperience', weight: 5, required: true },
      { key: 'subjects', weight: 10, required: true, isArray: true },
      { key: 'degreeLevel', weight: 5, required: true },
      { key: 'degreeMajor', weight: 5, required: false },
      { key: 'certifications', weight: 5, required: false, isArray: true },
      { key: 'hasTeachingLicense', weight: 5, required: false },
      { key: 'hasTEFL', weight: 5, required: false },
      { key: 'citizenship', weight: 10, required: true },
      { key: 'videoUrl', weight: 15, required: true },
    ];

    let totalWeight = 0;
    let completedWeight = 0;
    const missingFields: string[] = [];
    const suggestions: string[] = [];

    for (const field of fields) {
      totalWeight += field.weight;

      const value = profile[field.key as keyof typeof profile];

      // Check if field is filled
      let isFilled = false;

      if (field.isArray) {
        isFilled = Array.isArray(value) && value.length > 0;
      } else if (typeof value === 'boolean') {
        isFilled = true; // Booleans are always filled
      } else if (typeof value === 'number') {
        isFilled = value > 0;
      } else {
        isFilled = !!value;
      }

      if (isFilled) {
        completedWeight += field.weight;
      } else {
        if (field.required) {
          missingFields.push(field.key);
          suggestions.push(`Add your ${field.key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        }
      }
    }

    const completeness = Math.round((completedWeight / totalWeight) * 100);

    // Update profile completeness in database
    await prisma.teacherProfile.update({
      where: { id: session.user.teacherProfileId },
      data: { profileCompleteness: completeness }
    });

    return {
      completeness,
      missingFields,
      suggestions
    };

  } catch (error) {
    console.error('Failed to calculate profile completeness:', error);
    return {
      completeness: 0,
      missingFields: [],
      suggestions: []
    };
  }
}

/**
 * Update teacher profile
 */
export async function updateProfile(data: Partial<TeacherProfileSummary>) {
  try {
    const session = await auth();

    if (!session?.user?.teacherProfileId) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // Remove computed fields
    const { id, userId, name, createdAt, updatedAt, ...updateData } = data;

    await prisma.teacherProfile.update({
      where: { id: session.user.teacherProfileId },
      data: updateData
    });

    // Recalculate profile completeness
    await calculateProfileCompleteness();

    revalidatePath('/profile');
    revalidatePath('/profile/edit');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Profile updated successfully'
    };

  } catch (error: any) {
    console.error('Failed to update profile:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if profile is ready for job applications
 * Returns true if profile is at least 80% complete
 */
export async function isProfileReady(): Promise<boolean> {
  try {
    const result = await calculateProfileCompleteness();
    return result.completeness >= 80;
  } catch (error) {
    console.error('Failed to check profile readiness:', error);
    return false;
  }
}

/**
 * Get profile with completeness info
 */
export async function getProfileWithCompleteness() {
  try {
    const [profile, completeness] = await Promise.all([
      getCurrentProfile(),
      calculateProfileCompleteness()
    ]);

    return {
      profile,
      completeness
    };
  } catch (error) {
    console.error('Failed to fetch profile with completeness:', error);
    return {
      profile: null,
      completeness: {
        completeness: 0,
        missingFields: [],
        suggestions: []
      }
    };
  }
}
