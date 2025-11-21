/**
 * Server Actions for Email Templates (P2.14)
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function getEmailTemplates() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return { success: false, error: 'Unauthorized', templates: [] };
    }

    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!schoolProfile) {
      return { success: false, error: 'School profile not found', templates: [] };
    }

    const templates = await prisma.emailTemplate.findMany({
      where: { schoolId: schoolProfile.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });

    return { success: true, templates };
  } catch (error: any) {
    console.error('Failed to get email templates:', error);
    return { success: false, error: error.message, templates: [] };
  }
}

export async function createEmailTemplate(
  name: string,
  subject: string,
  body: string,
  templateType: string,
  isDefault: boolean = false
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

    if (isDefault) {
      await prisma.emailTemplate.updateMany({
        where: {
          schoolId: schoolProfile.id,
          templateType,
          isDefault: true
        },
        data: { isDefault: false }
      });
    }

    const template = await prisma.emailTemplate.create({
      data: {
        schoolId: schoolProfile.id,
        name,
        subject,
        body,
        templateType,
        isDefault
      }
    });

    revalidatePath('/school/email-templates');

    return { success: true, template };
  } catch (error: any) {
    console.error('Failed to create email template:', error);
    return { success: false, error: error.message };
  }
}

export async function updateEmailTemplate(
  templateId: string,
  name: string,
  subject: string,
  body: string,
  isActive: boolean,
  isDefault: boolean = false
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return { success: false, error: 'Unauthorized' };
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
      include: { school: true }
    });

    if (!template || template.school.userId !== session.user.id) {
      return { success: false, error: 'Template not found' };
    }

    if (isDefault) {
      await prisma.emailTemplate.updateMany({
        where: {
          schoolId: template.schoolId,
          templateType: template.templateType,
          isDefault: true,
          id: { not: templateId }
        },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.emailTemplate.update({
      where: { id: templateId },
      data: { name, subject, body, isActive, isDefault }
    });

    revalidatePath('/school/email-templates');

    return { success: true, template: updated };
  } catch (error: any) {
    console.error('Failed to update email template:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteEmailTemplate(templateId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SCHOOL') {
      return { success: false, error: 'Unauthorized' };
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
      include: { school: true, automations: true }
    });

    if (!template || template.school.userId !== session.user.id) {
      return { success: false, error: 'Template not found' };
    }

    if (template.automations.length > 0) {
      return { success: false, error: 'Template is in use by automations' };
    }

    await prisma.emailTemplate.delete({
      where: { id: templateId }
    });

    revalidatePath('/school/email-templates');

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete email template:', error);
    return { success: false, error: error.message };
  }
}
