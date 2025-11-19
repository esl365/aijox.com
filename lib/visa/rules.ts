/**
 * AI Agent 3: Rule-based Visa Guard - Visa Rules Database
 *
 * Hard-coded visa requirements for different countries
 * Updated as of 2025 - verify with official sources before production use
 */

export type VisaRule = {
  country: string;
  visaType: string;
  description: string;
  requirements: VisaRequirement[];
  disqualifiers: VisaDisqualifier[];
  additionalNotes?: string;
  lastUpdated: string;
};

export type VisaRequirement = {
  field: string; // Field path in TeacherProfile
  operator: 'eq' | 'neq' | 'gte' | 'lte' | 'gt' | 'lt' | 'in' | 'notIn' | 'includes';
  value: any;
  errorMessage: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM'; // Used for error ordering
};

export type VisaDisqualifier = {
  field: string;
  operator: string;
  value: any;
  errorMessage: string;
};

/**
 * Complete visa rules database
 * Add new countries as needed
 */
export const VISA_RULES: VisaRule[] = [
  // ========================================
  // SOUTH KOREA - E-2 Visa (Teaching)
  // ========================================
  {
    country: 'South Korea',
    visaType: 'E-2',
    description: 'Teaching visa for native English speakers',
    requirements: [
      {
        field: 'citizenship',
        operator: 'in',
        value: ['US', 'UK', 'CA', 'AU', 'NZ', 'IE', 'ZA'],
        errorMessage: 'Must be a citizen of USA, UK, Canada, Australia, New Zealand, Ireland, or South Africa',
        priority: 'CRITICAL'
      },
      {
        field: 'degreeLevel',
        operator: 'in',
        value: ['BA', 'BS', 'MA', 'MS', 'MEd', 'PhD'],
        errorMessage: 'Bachelor degree or higher required from an accredited university',
        priority: 'CRITICAL'
      },
      {
        field: 'criminalRecord',
        operator: 'eq',
        value: 'clean',
        errorMessage: 'Clean national-level criminal background check required (FBI check for US citizens)',
        priority: 'CRITICAL'
      },
      {
        field: 'hasApostille',
        operator: 'eq',
        value: true,
        errorMessage: 'Degree and background check must be apostilled',
        priority: 'HIGH'
      }
    ],
    disqualifiers: [
      {
        field: 'age',
        operator: 'gte',
        value: 62,
        errorMessage: 'Age limit: Typically under 62 years old (some exceptions for experienced teachers)'
      },
      {
        field: 'hasE2VisaViolation',
        operator: 'eq',
        value: true,
        errorMessage: 'Previous E-2 visa violations will result in denial'
      }
    ],
    additionalNotes: 'Visa processing takes 4-6 weeks. Health check required upon arrival.',
    lastUpdated: '2025-01-15'
  },

  // ========================================
  // CHINA - Z Visa (Work Permit)
  // ========================================
  {
    country: 'China',
    visaType: 'Z',
    description: 'Work visa for foreign teachers',
    requirements: [
      {
        field: 'degreeLevel',
        operator: 'in',
        value: ['BA', 'BS', 'MA', 'MS', 'MEd', 'PhD'],
        errorMessage: 'Bachelor degree minimum required',
        priority: 'CRITICAL'
      },
      {
        field: 'yearsExperience',
        operator: 'gte',
        value: 2,
        errorMessage: 'Minimum 2 years of post-graduation work experience required',
        priority: 'CRITICAL'
      },
      {
        field: 'age',
        operator: 'lte',
        value: 60,
        errorMessage: 'Maximum age is 60 years old',
        priority: 'CRITICAL'
      },
      {
        field: 'hasTEFL',
        operator: 'eq',
        value: true,
        errorMessage: 'TEFL/TESOL/CELTA certification required (120 hours minimum)',
        priority: 'HIGH'
      },
      {
        field: 'criminalRecord',
        operator: 'eq',
        value: 'clean',
        errorMessage: 'Clean criminal background check required',
        priority: 'CRITICAL'
      }
    ],
    disqualifiers: [
      {
        field: 'hasChineseVisaViolation',
        operator: 'eq',
        value: true,
        errorMessage: 'Previous visa violations or overstays will result in denial'
      },
      {
        field: 'hasDrugHistory',
        operator: 'eq',
        value: true,
        errorMessage: 'Any drug-related offenses are permanently disqualifying'
      }
    ],
    additionalNotes: 'New regulations as of 2025. Some provinces may have additional requirements. Health check and HIV test required.',
    lastUpdated: '2025-01-15'
  },

  // ========================================
  // UAE (United Arab Emirates)
  // ========================================
  {
    country: 'UAE',
    visaType: 'Employment',
    description: 'Employment visa for teachers',
    requirements: [
      {
        field: 'degreeLevel',
        operator: 'in',
        value: ['BA', 'BS', 'MA', 'MS', 'MEd', 'PhD'],
        errorMessage: 'Bachelor degree required (must be attested by UAE embassy)',
        priority: 'CRITICAL'
      },
      {
        field: 'hasTeachingLicense',
        operator: 'eq',
        value: true,
        errorMessage: 'Valid teaching license from home country required',
        priority: 'CRITICAL'
      },
      {
        field: 'yearsExperience',
        operator: 'gte',
        value: 2,
        errorMessage: 'Minimum 2 years teaching experience required',
        priority: 'HIGH'
      },
      {
        field: 'criminalRecord',
        operator: 'eq',
        value: 'clean',
        errorMessage: 'Clean criminal record required',
        priority: 'CRITICAL'
      }
    ],
    disqualifiers: [],
    additionalNotes: 'Degree attestation process takes 6-8 weeks. Medical fitness test required. Different emirates may have slightly different requirements.',
    lastUpdated: '2025-01-15'
  },

  // ========================================
  // VIETNAM - Work Permit
  // ========================================
  {
    country: 'Vietnam',
    visaType: 'Work Permit',
    description: 'Work permit for foreign teachers',
    requirements: [
      {
        field: 'degreeLevel',
        operator: 'in',
        value: ['BA', 'BS', 'MA', 'MS', 'MEd', 'PhD'],
        errorMessage: 'Bachelor degree required',
        priority: 'CRITICAL'
      },
      {
        field: 'criminalRecord',
        operator: 'eq',
        value: 'clean',
        errorMessage: 'Clean criminal background check required',
        priority: 'CRITICAL'
      },
      {
        field: 'hasHealthCertificate',
        operator: 'eq',
        value: true,
        errorMessage: 'Health certificate from home country required',
        priority: 'MEDIUM'
      }
    ],
    disqualifiers: [
      {
        field: 'hasVisaViolationHistory',
        operator: 'eq',
        value: true,
        errorMessage: 'Previous visa violations may result in denial'
      }
    ],
    additionalNotes: 'Relatively straightforward process. Notarization of documents required.',
    lastUpdated: '2025-01-15'
  },

  // ========================================
  // THAILAND - Non-B Visa + Work Permit
  // ========================================
  {
    country: 'Thailand',
    visaType: 'Non-B',
    description: 'Business visa with work permit for teachers',
    requirements: [
      {
        field: 'degreeLevel',
        operator: 'in',
        value: ['BA', 'BS', 'MA', 'MS', 'MEd', 'PhD'],
        errorMessage: 'Bachelor degree required',
        priority: 'CRITICAL'
      },
      {
        field: 'criminalRecord',
        operator: 'eq',
        value: 'clean',
        errorMessage: 'Clean criminal record required',
        priority: 'CRITICAL'
      }
    ],
    disqualifiers: [],
    additionalNotes: 'Teachers Council Waiver (TCW) available for non-licensed teachers. Degree must be verified by Thai embassy.',
    lastUpdated: '2025-01-15'
  },

  // ========================================
  // JAPAN - Instructor Visa
  // ========================================
  {
    country: 'Japan',
    visaType: 'Instructor',
    description: 'Visa for language instructors and teachers',
    requirements: [
      {
        field: 'degreeLevel',
        operator: 'in',
        value: ['BA', 'BS', 'MA', 'MS', 'MEd', 'PhD'],
        errorMessage: 'Bachelor degree required (or 12+ years teaching experience)',
        priority: 'CRITICAL'
      },
      {
        field: 'criminalRecord',
        operator: 'eq',
        value: 'clean',
        errorMessage: 'Clean criminal record required',
        priority: 'CRITICAL'
      }
    ],
    disqualifiers: [
      {
        field: 'hasTattoos',
        operator: 'eq',
        value: 'visible',
        errorMessage: 'Visible tattoos may be an issue at some schools (cultural consideration)'
      }
    ],
    additionalNotes: 'Certificate of Eligibility (COE) must be sponsored by employer. Process takes 2-3 months.',
    lastUpdated: '2025-01-15'
  },

  // ========================================
  // SAUDI ARABIA
  // ========================================
  {
    country: 'Saudi Arabia',
    visaType: 'Work Visa',
    description: 'Work visa for teachers',
    requirements: [
      {
        field: 'degreeLevel',
        operator: 'in',
        value: ['BA', 'BS', 'MA', 'MS', 'MEd', 'PhD'],
        errorMessage: 'Bachelor degree required (must be attested)',
        priority: 'CRITICAL'
      },
      {
        field: 'yearsExperience',
        operator: 'gte',
        value: 2,
        errorMessage: 'Minimum 2 years teaching experience',
        priority: 'HIGH'
      },
      {
        field: 'hasTeachingLicense',
        operator: 'eq',
        value: true,
        errorMessage: 'Teaching license or certification required',
        priority: 'HIGH'
      },
      {
        field: 'criminalRecord',
        operator: 'eq',
        value: 'clean',
        errorMessage: 'Clean criminal record required',
        priority: 'CRITICAL'
      }
    ],
    disqualifiers: [],
    additionalNotes: 'Medical tests required (including HIV). Alcohol and pork prohibited. Conservative dress code.',
    lastUpdated: '2025-01-15'
  },

  // ========================================
  // TAIWAN - Teaching Visa
  // ========================================
  {
    country: 'Taiwan',
    visaType: 'Teaching',
    description: 'Visa for English teachers',
    requirements: [
      {
        field: 'citizenship',
        operator: 'in',
        value: ['US', 'UK', 'CA', 'AU', 'NZ', 'IE', 'ZA'],
        errorMessage: 'Must be from a native English-speaking country',
        priority: 'CRITICAL'
      },
      {
        field: 'degreeLevel',
        operator: 'in',
        value: ['BA', 'BS', 'MA', 'MS', 'MEd', 'PhD'],
        errorMessage: 'Bachelor degree required',
        priority: 'CRITICAL'
      },
      {
        field: 'criminalRecord',
        operator: 'eq',
        value: 'clean',
        errorMessage: 'Clean criminal record required',
        priority: 'CRITICAL'
      }
    ],
    disqualifiers: [],
    additionalNotes: 'Relatively easy process. Health check required. Can be processed in-country.',
    lastUpdated: '2025-01-15'
  },

  // ========================================
  // SINGAPORE - Employment Pass
  // ========================================
  {
    country: 'Singapore',
    visaType: 'Employment Pass',
    description: 'Employment pass for professionals',
    requirements: [
      {
        field: 'degreeLevel',
        operator: 'in',
        value: ['BA', 'BS', 'MA', 'MS', 'MEd', 'PhD'],
        errorMessage: 'Recognized degree from accredited institution required',
        priority: 'CRITICAL'
      },
      {
        field: 'yearsExperience',
        operator: 'gte',
        value: 3,
        errorMessage: 'Minimum 3 years teaching experience preferred',
        priority: 'HIGH'
      },
      {
        field: 'minSalaryUSD',
        operator: 'lte',
        value: 5000,
        errorMessage: 'Salary threshold: Minimum $5,000 SGD/month (varies by age/experience)',
        priority: 'HIGH'
      }
    ],
    disqualifiers: [],
    additionalNotes: 'Competitive market. International school experience highly valued. Points-based system.',
    lastUpdated: '2025-01-15'
  },

  // ========================================
  // QATAR
  // ========================================
  {
    country: 'Qatar',
    visaType: 'Work Visa',
    description: 'Work visa for teachers',
    requirements: [
      {
        field: 'degreeLevel',
        operator: 'in',
        value: ['BA', 'BS', 'MA', 'MS', 'MEd', 'PhD'],
        errorMessage: 'Bachelor degree required (must be attested)',
        priority: 'CRITICAL'
      },
      {
        field: 'yearsExperience',
        operator: 'gte',
        value: 2,
        errorMessage: 'Minimum 2 years teaching experience',
        priority: 'HIGH'
      },
      {
        field: 'hasTeachingLicense',
        operator: 'eq',
        value: true,
        errorMessage: 'Teaching license required',
        priority: 'CRITICAL'
      },
      {
        field: 'criminalRecord',
        operator: 'eq',
        value: 'clean',
        errorMessage: 'Clean criminal record required',
        priority: 'CRITICAL'
      }
    ],
    disqualifiers: [],
    additionalNotes: 'Medical tests required. Competitive salaries. Similar cultural norms to Saudi Arabia.',
    lastUpdated: '2025-01-15'
  }
];

/**
 * Get visa rules for a specific country
 */
export function getVisaRulesForCountry(country: string): VisaRule | undefined {
  return VISA_RULES.find(rule =>
    rule.country.toLowerCase() === country.toLowerCase()
  );
}

/**
 * Get all supported countries
 */
export function getAllSupportedCountries(): string[] {
  return VISA_RULES.map(rule => rule.country);
}

/**
 * Check if country has visa rules defined
 */
export function hasVisaRules(country: string): boolean {
  return VISA_RULES.some(rule =>
    rule.country.toLowerCase() === country.toLowerCase()
  );
}
