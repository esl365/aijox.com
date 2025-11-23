/**
 * Webhook System - Phase 2 Task 4.3
 * Public API & Webhooks for external integrations
 */

export type WebhookEvent =
  | 'application.created'
  | 'application.status.changed'
  | 'interview.scheduled'
  | 'offer.sent'
  | 'candidate.hired';

export interface WebhookPayload {
  event: WebhookEvent;
  data: any;
  timestamp: string;
  webhookId: string;
}

export interface WebhookSubscription {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
}

/**
 * Trigger webhook
 */
export async function triggerWebhook(
  event: WebhookEvent,
  data: any,
  subscriptions: WebhookSubscription[]
): Promise<void> {
  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
    webhookId: Math.random().toString(36).substring(7),
  };

  const relevantSubscriptions = subscriptions.filter(
    (sub) => sub.active && sub.events.includes(event)
  );

  await Promise.all(
    relevantSubscriptions.map((sub) => sendWebhook(sub, payload))
  );
}

/**
 * Send webhook to endpoint
 */
async function sendWebhook(
  subscription: WebhookSubscription,
  payload: WebhookPayload
): Promise<void> {
  try {
    const response = await fetch(subscription.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': generateSignature(payload, subscription.secret),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Webhook delivery failed: ${subscription.url}`, response.status);
    }
  } catch (error) {
    console.error(`Webhook error: ${subscription.url}`, error);
  }
}

/**
 * Generate HMAC signature for webhook security
 */
function generateSignature(payload: WebhookPayload, secret: string): string {
  // TODO: Implement actual HMAC-SHA256 signature
  return 'mock-signature';
}
