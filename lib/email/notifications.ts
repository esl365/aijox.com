/**
 * Email notification utilities
 * Sends transactional emails for various platform events
 */

import { Resend } from 'resend';

// Lazy initialize Resend client only when needed
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

/**
 * Notify teacher when their video has been analyzed
 */
export async function notifyTeacherVideoAnalyzed(params: {
  teacherEmail: string;
  teacherName: string;
  videoUrl: string;
  feedback: {
    overallScore: number;
    strengths: string[];
    improvements: string[];
  };
}) {
  const client = getResendClient();
  if (!client) {
    console.warn('RESEND_API_KEY not configured. Email not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { teacherEmail, teacherName, feedback } = params;

    await client.emails.send({
      from: 'Global Educator Nexus <noreply@aijox.com>',
      to: teacherEmail,
      subject: 'Your Video Profile Has Been Analyzed',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .score { font-size: 48px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
              .section { background: white; padding: 20px; margin: 15px 0; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              .section h3 { color: #667eea; margin-top: 0; }
              ul { padding-left: 20px; }
              li { margin: 8px 0; }
              .cta { text-align: center; margin: 30px 0; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎥 Video Analysis Complete!</h1>
                <p>Hi ${teacherName}, your video profile has been analyzed by our AI</p>
              </div>

              <div class="content">
                <div class="score">${feedback.overallScore}/100</div>

                ${
                  feedback.strengths.length > 0
                    ? `
                <div class="section">
                  <h3>✅ Strengths</h3>
                  <ul>
                    ${feedback.strengths.map((s) => `<li>${s}</li>`).join('')}
                  </ul>
                </div>
                `
                    : ''
                }

                ${
                  feedback.improvements.length > 0
                    ? `
                <div class="section">
                  <h3>💡 Areas for Improvement</h3>
                  <ul>
                    ${feedback.improvements.map((i) => `<li>${i}</li>`).join('')}
                  </ul>
                </div>
                `
                    : ''
                }

                <div class="cta">
                  <a href="https://aijox.com/profile/setup" class="button">View Full Profile</a>
                </div>

                <p style="text-align: center; color: #6b7280; margin-top: 20px;">
                  Complete profiles receive 3x more job opportunities!
                </p>
              </div>

              <div class="footer">
                <p>&copy; 2025 Global Educator Nexus. All rights reserved.</p>
                <p>You received this email because you uploaded a video to your profile.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send video analysis email:', error);
    return { success: false, error };
  }
}

/**
 * Notify school when a teacher applies to their job
 */
export async function notifySchoolNewApplication(params: {
  schoolEmail: string;
  schoolName: string;
  teacherName: string;
  jobTitle: string;
  applicationId: string;
}) {
  const client = getResendClient();
  if (!client) {
    console.warn('RESEND_API_KEY not configured. Email not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { schoolEmail, schoolName, teacherName, jobTitle, applicationId } = params;

    await client.emails.send({
      from: 'Global Educator Nexus <noreply@aijox.com>',
      to: schoolEmail,
      subject: `New Application for ${jobTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>New Job Application Received</h2>
              <p>Hi ${schoolName},</p>
              <p>${teacherName} has applied for your position: <strong>${jobTitle}</strong></p>
              <p style="margin: 30px 0;">
                <a href="https://aijox.com/applications/${applicationId}"
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">
                  Review Application
                </a>
              </p>
              <p style="color: #6b7280; font-size: 12px;">
                &copy; 2025 Global Educator Nexus
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send application notification email:', error);
    return { success: false, error };
  }
}
