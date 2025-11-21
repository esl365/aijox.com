/**
 * Server Actions for Email Automation (P2.14)
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function getEmailAutomations() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return { success: false, error: 'Unauthorized', automations: [] };
    }

    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return { success: false, error: 'School profile not found', automations: [] };
    }

    const automations = await prisma.emailAutomation.findMany({
      where: { schoolId: schoolProfile.id },
      include: {
        template: {
          select: {
            name: true,
            subject: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, automations };
  } catch (error: any) {
    console.error('Failed to get email automations:', error);
    return { success: false, error: error.message, automations: [] };
  }
}

export async function createEmailAutomation(
  name: string,
  description: string | null,
  trigger: string,
  triggerConditions: any,
  templateId: string,
  delayMinutes: number = 0
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

    const automation = await prisma.emailAutomation.create({
      data: {
        schoolId: schoolProfile.id,
        name,
        description,
        trigger,
        triggerConditions: triggerConditions as any,
        templateId,
        delayMinutes
      },
      include: {
        template: true
      }
    });

    revalidatePath('/school/email-automation');

    return { success: true, automation };
  } catch (error: any) {
    console.error('Failed to create email automation:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleEmailAutomation(automationId: string, isActive: boolean) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return { success: false, error: 'Unauthorized' };
    }

    const automation = await prisma.emailAutomation.findUnique({
      where: { id: automationId },
      include: { school: true }
    });

    if (!automation || automation.school.userId !== session.user.id) {
      return { success: false, error: 'Automation not found' };
    }

    const updated = await prisma.emailAutomation.update({
      where: { id: automationId },
      data: { isActive }
    });

    revalidatePath('/school/email-automation');

    return { success: true, automation: updated };
  } catch (error: any) {
    console.error('Failed to toggle email automation:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteEmailAutomation(automationId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return { success: false, error: 'Unauthorized' };
    }

    const automation = await prisma.emailAutomation.findUnique({
      where: { id: automationId },
      include: { school: true }
    });

    if (!automation || automation.school.userId !== session.user.id) {
      return { success: false, error: 'Automation not found' };
    }

    await prisma.emailAutomation.delete({
      where: { id: automationId }
    });

    revalidatePath('/school/email-automation');

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete email automation:', error);
    return { success: false, error: error.message };
  }
}

export async function logEmail(
  recipientEmail: string,
  recipientName: string | null,
  subject: string,
  body: string,
  templateId: string | null,
  automationId: string | null,
  applicationId: string | null
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

    const log = await prisma.emailLog.create({
      data: {
        schoolId: schoolProfile.id,
        recipientEmail,
        recipientName,
        subject,
        body,
        templateId,
        automationId,
        applicationId,
        status: 'QUEUED'
      }
    });

    return { success: true, log };
  } catch (error: any) {
    console.error('Failed to log email:', error);
    return { success: false, error: error.message };
  }
}

export async function getEmailLogs(applicationId?: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return { success: false, error: 'Unauthorized', logs: [] };
    }

    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return { success: false, error: 'School profile not found', logs: [] };
    }

    const where: any = { schoolId: schoolProfile.id };

    if (applicationId) {
      where.applicationId = applicationId;
    }

    const logs = await prisma.emailLog.findMany({
      where,
      include: {
        application: {
          select: {
            job: { select: { title: true } },
            teacher: {
              include: {
                user: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return { success: true, logs };
  } catch (error: any) {
    console.error('Failed to get email logs:', error);
    return { success: false, error: error.message, logs: [] };
  }
}
