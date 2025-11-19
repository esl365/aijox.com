/**
 * Email Domain Validation Utility
 *
 * Validates email domains for educational institutions and organizations
 */

// Common educational email domains by country
const EDUCATIONAL_DOMAINS = [
  // Generic educational domains
  '.edu',
  '.edu.au',
  '.edu.cn',
  '.edu.hk',
  '.edu.sg',
  '.edu.tw',
  '.edu.my',
  '.edu.ph',
  '.edu.vn',
  '.edu.th',
  '.edu.in',
  '.edu.pk',
  '.edu.bd',
  '.edu.np',
  '.edu.lk',
  '.edu.id',
  '.edu.kh',
  '.edu.mm',
  '.edu.la',

  // Country-specific variations
  '.ac.uk',  // UK
  '.ac.jp',  // Japan
  '.ac.kr',  // South Korea
  '.ac.nz',  // New Zealand
  '.ac.za',  // South Africa
  '.ac.il',  // Israel
  '.ac.ae',  // UAE
  '.edu.sa', // Saudi Arabia
  '.edu.eg', // Egypt
  '.edu.jo', // Jordan
  '.edu.qa', // Qatar
  '.edu.kw', // Kuwait
  '.edu.om', // Oman
  '.edu.bh', // Bahrain

  // Europe
  '.edu.pl', // Poland
  '.edu.cz', // Czech Republic
  '.edu.gr', // Greece
  '.edu.es', // Spain
  '.edu.it', // Italy
  '.edu.de', // Germany
  '.edu.fr', // France
];

// Known educational institutions (whitelisted domains)
const KNOWN_EDUCATIONAL_INSTITUTIONS = [
  // International Schools
  'iss.edu.hk',
  'harrowschool.ac.th',
  'wellington.ac.th',
  'stamford.edu.sg',
  'dulwich.org',
  'sisschools.org',

  // Major Universities
  'harvard.edu',
  'stanford.edu',
  'mit.edu',
  'oxford.ac.uk',
  'cambridge.ac.uk',
  'nus.edu.sg',
  'hku.hk',
  'tsinghua.edu.cn',
  'peking.edu.cn',
  'tokyo.ac.jp',
  'kyoto-u.ac.jp',
  'seoul.ac.kr',
  'kaist.ac.kr',
  'yonsei.ac.kr',
];

// Common free email providers (blacklist)
const FREE_EMAIL_PROVIDERS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'aol.com',
  'zoho.com',
  'qq.com',
  '163.com',
  '126.com',
  'naver.com',
  'daum.net',
  'kakao.com',
];

export type DomainValidationResult = {
  isValid: boolean;
  isEducational: boolean;
  isFreeProvider: boolean;
  isKnownInstitution: boolean;
  domain: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
};

/**
 * Validate an email domain for institutional use
 */
export function validateEmailDomain(email: string): DomainValidationResult {
  if (!email || !email.includes('@')) {
    return {
      isValid: false,
      isEducational: false,
      isFreeProvider: false,
      isKnownInstitution: false,
      domain: '',
      confidence: 'low',
      reason: 'Invalid email format',
    };
  }

  const domain = email.toLowerCase().split('@')[1];

  // Check if it's a free email provider
  const isFreeProvider = FREE_EMAIL_PROVIDERS.includes(domain);
  if (isFreeProvider) {
    return {
      isValid: false,
      isEducational: false,
      isFreeProvider: true,
      isKnownInstitution: false,
      domain,
      confidence: 'high',
      reason: 'Free email provider - institutional email required',
    };
  }

  // Check if it's a known educational institution
  const isKnownInstitution = KNOWN_EDUCATIONAL_INSTITUTIONS.some((inst) =>
    domain.endsWith(inst)
  );
  if (isKnownInstitution) {
    return {
      isValid: true,
      isEducational: true,
      isFreeProvider: false,
      isKnownInstitution: true,
      domain,
      confidence: 'high',
      reason: 'Recognized educational institution',
    };
  }

  // Check if it has an educational domain suffix
  const isEducational = EDUCATIONAL_DOMAINS.some((eduDomain) =>
    domain.endsWith(eduDomain)
  );
  if (isEducational) {
    return {
      isValid: true,
      isEducational: true,
      isFreeProvider: false,
      isKnownInstitution: false,
      domain,
      confidence: 'high',
      reason: 'Educational domain verified',
    };
  }

  // Check if domain contains education-related keywords
  const educationKeywords = ['school', 'edu', 'academy', 'college', 'university'];
  const hasEducationKeyword = educationKeywords.some((keyword) =>
    domain.includes(keyword)
  );

  if (hasEducationKeyword) {
    return {
      isValid: true,
      isEducational: true,
      isFreeProvider: false,
      isKnownInstitution: false,
      domain,
      confidence: 'medium',
      reason: 'Domain contains educational keywords - manual verification recommended',
    };
  }

  // Corporate/organization email (needs manual verification)
  return {
    isValid: true,
    isEducational: false,
    isFreeProvider: false,
    isKnownInstitution: false,
    domain,
    confidence: 'low',
    reason: 'Custom domain - manual verification required',
  };
}

/**
 * Check if email domain requires manual verification
 */
export function requiresManualVerification(email: string): boolean {
  const result = validateEmailDomain(email);
  return result.confidence === 'medium' || result.confidence === 'low';
}

/**
 * Get domain from email
 */
export function extractDomain(email: string): string {
  if (!email || !email.includes('@')) {
    return '';
  }
  return email.toLowerCase().split('@')[1];
}
