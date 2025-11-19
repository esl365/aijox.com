/**
 * AI Agent 3: Rule-based Visa Guard - Eligibility Checker
 *
 * Evaluates teacher eligibility for different countries based on visa rules
 */

import { VISA_RULES, getVisaRulesForCountry, type VisaRule, type VisaRequirement } from './rules';
import type { TeacherProfile } from '@prisma/client';

export type VisaCheckResult = {
  eligible: boolean;
  country: string;
  visaType: string;
  failedRequirements: Array<{
    message: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  }>;
  disqualifications: string[];
  passedRequirements: string[];
  confidence: number; // 0-100
  lastUpdated: string;
  additionalNotes?: string;
};

/**
 * Check if a teacher is eligible for a visa in a specific country
 */
export function checkVisaEligibility(
  teacher: Partial<TeacherProfile> & Record<string, any>,
  country: string
): VisaCheckResult {
  const rule = getVisaRulesForCountry(country);

  if (!rule) {
    return {
      eligible: false,
      country,
      visaType: 'Unknown',
      failedRequirements: [{
        message: `No visa rules configured for ${country}. Please contact support for guidance.`,
        priority: 'CRITICAL'
      }],
      disqualifications: [],
      passedRequirements: [],
      confidence: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  const failedRequirements: Array<{ message: string; priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' }> = [];
  const disqualifications: string[] = [];
  const passedRequirements: string[] = [];

  // Check requirements
  for (const req of rule.requirements) {
    const teacherValue = getNestedValue(teacher, req.field);
    const passed = evaluateCondition(teacherValue, req.operator, req.value);

    if (!passed) {
      failedRequirements.push({
        message: req.errorMessage,
        priority: req.priority
      });
    } else {
      passedRequirements.push(req.errorMessage.split('required')[0].trim());
    }
  }

  // Check disqualifiers
  for (const disq of rule.disqualifiers) {
    const teacherValue = getNestedValue(teacher, disq.field);
    const disqualified = evaluateCondition(teacherValue, disq.operator, disq.value);

    if (disqualified) {
      disqualifications.push(disq.errorMessage);
    }
  }

  // Sort failed requirements by priority
  failedRequirements.sort((a, b) => {
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const eligible = failedRequirements.length === 0 && disqualifications.length === 0;

  // Calculate confidence level
  let confidence = 0;
  if (eligible) {
    confidence = 95; // High confidence for eligible
  } else if (disqualifications.length > 0) {
    confidence = 10; // Very low if disqualified
  } else {
    // Medium confidence if only missing requirements
    const criticalFailures = failedRequirements.filter(f => f.priority === 'CRITICAL').length;
    confidence = criticalFailures > 0 ? 30 : 60;
  }

  return {
    eligible,
    country,
    visaType: rule.visaType,
    failedRequirements,
    disqualifications,
    passedRequirements,
    confidence,
    lastUpdated: rule.lastUpdated,
    additionalNotes: rule.additionalNotes
  };
}

/**
 * Check eligibility for multiple countries at once
 */
export function checkMultipleCountries(
  teacher: Partial<TeacherProfile> & Record<string, any>,
  countries: string[]
): Record<string, VisaCheckResult> {
  const results: Record<string, VisaCheckResult> = {};

  for (const country of countries) {
    results[country] = checkVisaEligibility(teacher, country);
  }

  return results;
}

/**
 * Check eligibility for ALL countries with visa rules
 */
export function checkAllCountries(
  teacher: Partial<TeacherProfile> & Record<string, any>
): Record<string, VisaCheckResult> {
  const results: Record<string, VisaCheckResult> = {};

  for (const rule of VISA_RULES) {
    results[rule.country] = checkVisaEligibility(teacher, rule.country);
  }

  return results;
}

/**
 * Get list of countries where teacher IS eligible
 */
export function getEligibleCountries(
  teacher: Partial<TeacherProfile> & Record<string, any>
): string[] {
  const allResults = checkAllCountries(teacher);

  return Object.entries(allResults)
    .filter(([_, result]) => result.eligible)
    .map(([country, _]) => country);
}

/**
 * Get list of countries where teacher IS NOT eligible (with reasons)
 */
export function getIneligibleCountries(
  teacher: Partial<TeacherProfile> & Record<string, any>
): Array<{ country: string; reasons: string[] }> {
  const allResults = checkAllCountries(teacher);

  return Object.entries(allResults)
    .filter(([_, result]) => !result.eligible)
    .map(([country, result]) => ({
      country,
      reasons: [
        ...result.failedRequirements.map(f => f.message),
        ...result.disqualifications
      ]
    }));
}

/**
 * Evaluate a condition based on operator
 */
function evaluateCondition(
  actualValue: any,
  operator: string,
  expectedValue: any
): boolean {
  // Handle null/undefined cases
  if (actualValue === null || actualValue === undefined) {
    return false;
  }

  switch (operator) {
    case 'eq':
      return actualValue === expectedValue;

    case 'neq':
      return actualValue !== expectedValue;

    case 'gte':
      return Number(actualValue) >= Number(expectedValue);

    case 'lte':
      return Number(actualValue) <= Number(expectedValue);

    case 'gt':
      return Number(actualValue) > Number(expectedValue);

    case 'lt':
      return Number(actualValue) < Number(expectedValue);

    case 'in':
      return Array.isArray(expectedValue) && expectedValue.includes(actualValue);

    case 'notIn':
      return Array.isArray(expectedValue) && !expectedValue.includes(actualValue);

    case 'includes':
      // Check if array contains value
      return Array.isArray(actualValue) && actualValue.includes(expectedValue);

    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

/**
 * Get nested value from object using dot notation
 * Example: getNestedValue(obj, 'user.profile.age')
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Generate human-readable summary of visa status
 */
export function generateVisaSummary(result: VisaCheckResult): string {
  if (result.eligible) {
    return `✅ You are eligible for a ${result.visaType} visa in ${result.country}`;
  }

  if (result.disqualifications.length > 0) {
    return `❌ You are disqualified from ${result.country} due to: ${result.disqualifications[0]}`;
  }

  const criticalFailures = result.failedRequirements.filter(f => f.priority === 'CRITICAL');

  if (criticalFailures.length > 0) {
    return `⚠️ You cannot apply to ${result.country} because: ${criticalFailures[0].message}`;
  }

  return `ℹ️ You may be eligible for ${result.country} but need to meet: ${result.failedRequirements[0].message}`;
}

/**
 * Get recommendations for becoming eligible
 */
export function getEligibilityRecommendations(
  result: VisaCheckResult
): string[] {
  if (result.eligible) {
    return ['You meet all requirements! Apply now.'];
  }

  const recommendations: string[] = [];

  for (const failure of result.failedRequirements) {
    // Parse the error message to generate actionable recommendation
    const message = failure.message.toLowerCase();

    if (message.includes('degree') || message.includes('bachelor')) {
      recommendations.push('Complete a recognized bachelor degree program');
    } else if (message.includes('experience')) {
      const years = message.match(/\d+/)?.[0];
      recommendations.push(`Gain ${years || 'more'} years of teaching experience`);
    } else if (message.includes('tefl') || message.includes('tesol')) {
      recommendations.push('Obtain a TEFL/TESOL certification (120 hours minimum)');
    } else if (message.includes('teaching license')) {
      recommendations.push('Get a teaching license from your home country');
    } else if (message.includes('criminal')) {
      recommendations.push('Obtain a clean national-level background check');
    } else if (message.includes('citizenship') || message.includes('citizen')) {
      recommendations.push('This requirement cannot be changed (citizenship restriction)');
    } else if (message.includes('age')) {
      recommendations.push('Age requirement cannot be changed');
    } else {
      recommendations.push(failure.message);
    }
  }

  // Deduplicate
  return [...new Set(recommendations)];
}
