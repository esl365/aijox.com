/**
 * Server Actions for Dashboard Layout Management (P1.6)
 *
 * Customizable dashboard layout configuration
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export type DashboardLayoutConfig = {
  widgets: {
    id: string;
    type: string;
    position: { x: number; y: number; w: number; h: number };
    visible: boolean;
  }[];
  theme?: string;
  density?: 'compact' | 'normal' | 'comfortable';
};

/**
 * Get dashboard layout for current user
 */
export async function getDashboardLayout() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
        layout: null
      };
    }

    const layout = await prisma.dashboardLayout.findUnique({
      where: {
        userId: session.user.id
      }
    });

    return {
      success: true,
      layout
    };

  } catch (error: any) {
    console.error('Failed to get dashboard layout:', error);
    return {
      success: false,
      error: error.message,
      layout: null
    };
  }
}

/**
 * Save or update dashboard layout
 */
export async function saveDashboardLayout(layoutName: string, config: DashboardLayoutConfig) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const layout = await prisma.dashboardLayout.upsert({
      where: {
        userId: session.user.id
      },
      create: {
        userId: session.user.id,
        layoutName,
        config: config as any
      },
      update: {
        layoutName,
        config: config as any
      }
    });

    revalidatePath('/school/dashboard');

    return {
      success: true,
      layout
    };

  } catch (error: any) {
    console.error('Failed to save dashboard layout:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Reset dashboard layout to default
 */
export async function resetDashboardLayout() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    await prisma.dashboardLayout.delete({
      where: {
        userId: session.user.id
      }
    });

    revalidatePath('/school/dashboard');

    return {
      success: true,
      message: 'Dashboard layout reset to default'
    };

  } catch (error: any) {
    console.error('Failed to reset dashboard layout:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
