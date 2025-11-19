/**
 * AI Agent 1: Video Analyzer
 *
 * Analyzes teacher video resumes using GPT-4o's multimodal capabilities.
 * Transforms unstructured video data into structured, searchable metadata.
 */

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Zod schema for type-safe AI responses
export const VideoAnalysisSchema = z.object({
  accent_type: z.enum(['North American', 'British', 'Australian', 'Asian', 'European', 'Other']),
  accent_clarity_score: z.number().min(1).max(10),
  energy_level: z.enum(['High', 'Medium', 'Low']),
  energy_score: z.number().min(1).max(10),
  professionalism_score: z.number().min(1).max(10),
  technical_quality_score: z.number().min(1).max(10),
  overall_score: z.number().min(1).max(100),
  key_strengths: z.array(z.string()).min(1).max(5),
  improvement_areas: z.array(z.string()).min(0).max(5),
  summary: z.string().min(10).max(500),
  recommended_for_roles: z.array(z.string()).min(1).max(5),
  appearance_professional: z.boolean(),
  background_appropriate: z.boolean(),
  lighting_quality: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
  audio_clarity: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
  confidence_level: z.number().min(0).max(100).describe('AI confidence in this analysis')
});

export type VideoAnalysis = z.infer<typeof VideoAnalysisSchema>;

// System prompt optimized for teaching candidate evaluation
const SCREENER_SYSTEM_PROMPT = `You are an expert international school recruiter with 15+ years of experience evaluating teaching candidates for positions in Asia, Middle East, and Europe.

Your task is to analyze a video resume and provide objective, structured feedback that helps both the candidate improve and schools make informed hiring decisions.

EVALUATION CRITERIA:

1. ACCENT & PRONUNCIATION (1-10)
   - Clarity of speech and enunciation
   - Accent type identification (important for ESL positions)
   - Potential communication barriers with students
   - Natural flow and pace of speaking

2. ENERGY & ENTHUSIASM (1-10)
   - Body language and gestures
   - Vocal variety and tone modulation
   - Genuine passion for teaching
   - Engagement level (would students be captivated?)

3. PROFESSIONALISM (1-10)
   - Appropriate attire for teaching environment
   - Grooming and overall presentation
   - Eye contact with camera (represents student engagement)
   - Professional demeanor and confidence

4. TECHNICAL QUALITY (1-10)
   - Lighting (face clearly visible, no harsh shadows)
   - Audio quality (no background noise, clear recording)
   - Video stability (not shaky)
   - Background setting (clean, professional, not distracting)

SCORING GUIDELINES:
- 1-3: Significant issues, not competitive
- 4-6: Average, needs improvement
- 7-8: Good, competitive candidate
- 9-10: Exceptional, top-tier candidate

Overall score calculation:
- Overall = (accent_clarity * 0.3) + (energy * 0.25) + (professionalism * 0.25) + (technical_quality * 0.2)
- Multiply by 10 to get 1-100 range

IMPORTANT:
- Be constructive but honest
- Identify specific, actionable improvement areas
- Highlight genuine strengths, not generic praise
- Consider cultural sensitivity (appearance standards vary)
- Assess suitability for different age groups and subjects

OUTPUT ONLY VALID JSON matching the schema. No additional commentary.`;

/**
 * Analyzes a teacher video resume using GPT-4o
 *
 * @param videoUrl - Public URL to the video file (R2 CDN URL)
 * @returns Structured analysis results
 * @throws Error if video is inaccessible or AI service fails
 */
export async function analyzeVideo(videoUrl: string): Promise<VideoAnalysis> {
  if (!videoUrl || !isValidUrl(videoUrl)) {
    throw new Error('Invalid video URL provided');
  }

  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: VideoAnalysisSchema,
      messages: [
        {
          role: 'system',
          content: SCREENER_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this teaching candidate video resume. Provide objective, constructive feedback.'
            },
            {
              type: 'video',
              videoUrl: videoUrl
            }
          ] as any // Type assertion for video content type
        }
      ],
      temperature: 0.3, // Low temperature for consistency across analyses
      maxTokens: 1500,
    });

    return result.object;
  } catch (error: any) {
    console.error('Video analysis failed:', error);

    // Handle specific error types
    if (error.message?.includes('rate_limit')) {
      throw new Error('AI service rate limit exceeded. Please try again in a few minutes.');
    }

    if (error.message?.includes('invalid_video')) {
      throw new Error('Video format not supported or file corrupted.');
    }

    if (error.message?.includes('timeout')) {
      throw new Error('Video analysis timed out. Video may be too long (max 5 minutes).');
    }

    throw new Error(`Video analysis failed: ${error.message}`);
  }
}

/**
 * Generates actionable feedback for the teacher based on analysis
 */
export function generateUserFeedback(analysis: VideoAnalysis): {
  message: string;
  tips: string[];
  shouldRerecord: boolean;
} {
  const tips: string[] = [];
  let shouldRerecord = false;

  // Technical quality feedback
  if (analysis.lighting_quality === 'Poor' || analysis.lighting_quality === 'Fair') {
    tips.push('💡 Improve lighting: Record near a window (natural light) or use a desk lamp facing you.');
  }

  if (analysis.audio_clarity === 'Poor' || analysis.audio_clarity === 'Fair') {
    tips.push('🎤 Improve audio: Find a quiet room and speak directly toward your device microphone.');
  }

  if (!analysis.background_appropriate) {
    tips.push('🖼️ Background: Choose a clean, uncluttered background. A plain wall works best.');
  }

  if (!analysis.appearance_professional) {
    tips.push('👔 Appearance: Dress as you would for an in-person interview (business casual minimum).');
  }

  // Performance feedback
  if (analysis.accent_clarity_score < 7) {
    tips.push('🗣️ Clarity: Speak slowly and enunciate clearly. Practice reading aloud before recording.');
  }

  if (analysis.energy_level === 'Low') {
    tips.push('⚡ Energy: Show enthusiasm! Smile, use hand gestures, and vary your vocal tone.');
  }

  // Overall recommendation
  if (analysis.overall_score < 60) {
    shouldRerecord = true;
    return {
      message: `Your video scored ${analysis.overall_score}/100. We recommend re-recording to improve your chances with schools.`,
      tips,
      shouldRerecord
    };
  }

  if (analysis.overall_score < 75) {
    return {
      message: `Good start! Your video scored ${analysis.overall_score}/100. Consider these improvements:`,
      tips,
      shouldRerecord: false
    };
  }

  return {
    message: `Excellent video! Your score: ${analysis.overall_score}/100. ${analysis.key_strengths[0]}`,
    tips: tips.length > 0 ? tips : ['Your video looks professional. Schools will be impressed!'],
    shouldRerecord: false
  };
}

/**
 * Calculates profile completeness score based on video analysis
 * Used for ranking in search results
 */
export function calculateProfileCompleteness(
  hasVideo: boolean,
  videoAnalysis: VideoAnalysis | null,
  hasBasicInfo: boolean,
  hasExperience: boolean,
  hasCertifications: boolean
): number {
  let score = 0;

  // Basic info (30%)
  if (hasBasicInfo) score += 30;

  // Experience (20%)
  if (hasExperience) score += 20;

  // Certifications (10%)
  if (hasCertifications) score += 10;

  // Video presence (20%)
  if (hasVideo) score += 20;

  // Video quality (20%)
  if (videoAnalysis) {
    const qualityScore = videoAnalysis.overall_score / 100;
    score += Math.round(qualityScore * 20);
  }

  return Math.min(score, 100);
}

/**
 * Helper function to validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Retry logic for transient failures
 */
export async function analyzeVideoWithRetry(
  videoUrl: string,
  maxRetries = 3
): Promise<VideoAnalysis> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await analyzeVideo(videoUrl);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Analysis attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Video analysis failed after ${maxRetries} attempts: ${lastError!.message}`);
}
