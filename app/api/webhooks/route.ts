import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Webhook Management API - Phase 2 Task 4.3
 * POST /api/webhooks - Create webhook subscription
 * GET /api/webhooks - List subscriptions
 */

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, events } = body;

    if (!url || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid request. Required: url, events[]' },
        { status: 400 }
      );
    }

    // TODO: Save webhook subscription to database
    const subscription = {
      id: Math.random().toString(36).substring(7),
      url,
      events,
      secret: Math.random().toString(36).substring(2),
      active: true,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Webhook subscription created',
    });
  } catch (error: any) {
    console.error('Webhook API error:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Fetch from database
    const subscriptions = [
      {
        id: '1',
        url: 'https://example.com/webhook',
        events: ['application.created', 'application.status.changed'],
        active: true,
        createdAt: '2024-11-23T00:00:00Z',
      },
    ];

    return NextResponse.json({ subscriptions });
  } catch (error: any) {
    console.error('Webhook API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks', message: error.message },
      { status: 500 }
    );
  }
}
