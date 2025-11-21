/**
 * Server Actions for Reports (P2.12)
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export type ReportConfig = {
  dateRange?: { from: string; to: string };
  metrics?: string[];
  groupBy?: string[];
  filters?: any;
};

export async function getReports() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return { success: false, error: 'Unauthorized', reports: [] };
    }

    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return { success: false, error: 'School profile not found', reports: [] };
    }

    const reports = await prisma.report.findMany({
      where: { schoolId: schoolProfile.id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, reports };
  } catch (error: any) {
    console.error('Failed to get reports:', error);
    return { success: false, error: error.message, reports: [] };
  }
}

export async function createReport(
  name: string,
  description: string | null,
  reportType: string,
  config: ReportConfig,
  isScheduled: boolean = false,
  scheduleFrequency?: string,
  scheduleDay?: number,
  scheduleTime?: string
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return { success: false, error: 'Unauthorized' };
    }

    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return { success: false, error: 'School profile not found' };
    }

    const report = await prisma.report.create({
      data: {
        schoolId: schoolProfile.id,
        createdById: session.user.id,
        name,
        description,
        reportType,
        config: config as any,
        isScheduled,
        scheduleFrequency,
        scheduleDay,
        scheduleTime
      }
    });

    revalidatePath('/school/reports');

    return { success: true, report };
  } catch (error: any) {
    console.error('Failed to create report:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteReport(reportId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return { success: false, error: 'Unauthorized' };
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { school: true }
    });

    if (!report || report.school.userId !== session.user.id) {
      return { success: false, error: 'Report not found' };
    }

    await prisma.report.delete({
      where: { id: reportId }
    });

    revalidatePath('/school/reports');

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete report:', error);
    return { success: false, error: error.message };
  }
}
