import { UserRole } from '@prisma/client';
import { prisma, hashPassword, TEST_PASSWORDS, userExists, schoolExists, logger, SeedSummary } from './utils';

/**
 * School test data
 */
export const SCHOOLS = [
  {
    name: 'Seoul International Academy',
    email: 'contact@seoul-academy.edu',
    country: 'South Korea',
    city: 'Seoul',
    schoolType: 'International School',
    description: 'Seoul International Academy is a leading international school offering the IB curriculum to students from Pre-K through Grade 12. Our mission is to provide a world-class education that prepares students for success in an increasingly global society.',
    website: 'https://seoul-academy.edu',
    isVerified: true,
  },
  {
    name: 'Dubai English Speaking School',
    email: 'info@dubai-ess.ae',
    country: 'United Arab Emirates',
    city: 'Dubai',
    schoolType: 'Private School',
    description: 'Premier British curriculum school in the heart of Dubai, offering world-class education with state-of-the-art facilities and experienced international faculty.',
    website: 'https://dubai-ess.ae',
    isVerified: true,
  },
  {
    name: 'Shanghai American School',
    email: 'admissions@sas.edu.cn',
    country: 'China',
    city: 'Shanghai',
    schoolType: 'International School',
    description: 'One of the largest and most established international schools in China, providing American curriculum education to expatriate and Chinese national students.',
    website: 'https://sas.edu.cn',
    isVerified: true,
  },
  {
    name: 'Bangkok British School',
    email: 'hello@bangkok-british.ac.th',
    country: 'Thailand',
    city: 'Bangkok',
    schoolType: 'British Curriculum',
    description: 'Following the National Curriculum for England, we provide outstanding British education in the heart of Bangkok with a diverse international community.',
    website: 'https://bangkok-british.ac.th',
    isVerified: true,
  },
  {
    name: 'Tokyo International School',
    email: 'admissions@tis.ac.jp',
    country: 'Japan',
    city: 'Tokyo',
    schoolType: 'International School',
    description: 'A vibrant international learning community in Tokyo, offering IB programs and fostering global citizenship among students from over 50 countries.',
    website: 'https://tis.ac.jp',
    isVerified: true,
  },
  {
    name: 'Singapore International Academy',
    email: 'info@sia.edu.sg',
    country: 'Singapore',
    city: 'Singapore',
    schoolType: 'IB Curriculum',
    description: 'Providing exceptional IB education with a focus on holistic development, academic excellence, and preparing students for global universities.',
    website: 'https://sia.edu.sg',
    isVerified: true,
  },
  {
    name: 'Hanoi International School',
    email: 'admissions@his.edu.vn',
    country: 'Vietnam',
    city: 'Hanoi',
    schoolType: 'International School',
    description: 'Leading international school in Vietnam offering American curriculum with a multicultural environment and excellent facilities.',
    website: 'https://his.edu.vn',
    isVerified: true,
  },
  {
    name: 'Kuala Lumpur International School',
    email: 'info@klis.edu.my',
    country: 'Malaysia',
    city: 'Kuala Lumpur',
    schoolType: 'International School',
    description: 'Established international school providing high-quality education in the heart of KL with modern facilities and experienced teachers.',
    website: 'https://klis.edu.my',
    isVerified: true,
  },
];

/**
 * Recruiter test data
 */
export const RECRUITERS = [
  {
    name: 'Global Teaching Recruiters',
    email: 'contact@globalteachrecruit.com',
    companyName: 'Global Teaching Recruiters Ltd.',
    country: 'United Kingdom',
  },
  {
    name: 'Asia Education Partners',
    email: 'info@asiaedupartners.com',
    companyName: 'Asia Education Partners Inc.',
    country: 'Singapore',
  },
];

/**
 * Teacher test data
 */
export const TEACHERS = [
  {
    email: 'john.smith@email.com',
    name: 'John Smith',
    firstName: 'John',
    lastName: 'Smith',
    bio: 'Experienced ESL teacher with a passion for helping students develop language skills through interactive and engaging lessons.',
    currentCountry: 'United States',
    preferredCountries: ['South Korea', 'Japan', 'China'],
    yearsExperience: 5,
    subjects: ['English', 'ESL'],
    degreeLevel: 'Bachelor',
    degreeMajor: 'English Literature',
    certifications: ['TEFL', 'TESOL'],
    hasTeachingLicense: true,
    hasTEFL: true,
    citizenship: 'United States',
    age: 32,
    minSalaryUSD: 2500,
    maxSalaryUSD: 3500,
  },
  {
    email: 'sarah.johnson@email.com',
    name: 'Sarah Johnson',
    firstName: 'Sarah',
    lastName: 'Johnson',
    bio: 'Mathematics specialist with 8 years of experience teaching middle and high school students. Committed to making math accessible and enjoyable.',
    currentCountry: 'Canada',
    preferredCountries: ['United Arab Emirates', 'Singapore', 'Qatar'],
    yearsExperience: 8,
    subjects: ['Mathematics', 'Algebra', 'Calculus'],
    degreeLevel: 'Master',
    degreeMajor: 'Mathematics Education',
    certifications: ['Ontario Teaching Certificate'],
    hasTeachingLicense: true,
    hasTEFL: false,
    citizenship: 'Canada',
    age: 35,
    minSalaryUSD: 4000,
    maxSalaryUSD: 5500,
  },
  {
    email: 'david.wong@email.com',
    name: 'David Wong',
    firstName: 'David',
    lastName: 'Wong',
    bio: 'Science educator passionate about hands-on learning and scientific inquiry. Experience with IB and IGCSE curricula.',
    currentCountry: 'Australia',
    preferredCountries: ['Singapore', 'Thailand', 'Vietnam'],
    yearsExperience: 6,
    subjects: ['Science', 'Biology', 'Chemistry'],
    degreeLevel: 'Master',
    degreeMajor: 'Biology',
    certifications: ['Queensland Teacher Registration'],
    hasTeachingLicense: true,
    hasTEFL: false,
    citizenship: 'Australia',
    age: 38,
    minSalaryUSD: 3500,
    maxSalaryUSD: 4800,
  },
  {
    email: 'emma.brown@email.com',
    name: 'Emma Brown',
    firstName: 'Emma',
    lastName: 'Brown',
    bio: 'Early years specialist with expertise in play-based learning and child development. Warm, nurturing teaching style.',
    currentCountry: 'United Kingdom',
    preferredCountries: ['United Arab Emirates', 'China', 'South Korea'],
    yearsExperience: 4,
    subjects: ['Early Childhood Education'],
    degreeLevel: 'Bachelor',
    degreeMajor: 'Early Childhood Education',
    certifications: ['EYFS Specialist', 'QTS'],
    hasTeachingLicense: true,
    hasTEFL: false,
    citizenship: 'United Kingdom',
    age: 29,
    minSalaryUSD: 2800,
    maxSalaryUSD: 4000,
  },
  {
    email: 'michael.chen@email.com',
    name: 'Michael Chen',
    firstName: 'Michael',
    lastName: 'Chen',
    bio: 'Technology enthusiast teaching computer science and coding. Building the next generation of programmers and problem solvers.',
    currentCountry: 'Singapore',
    preferredCountries: ['Japan', 'South Korea', 'Malaysia'],
    yearsExperience: 7,
    subjects: ['Computer Science', 'Technology', 'Coding'],
    degreeLevel: 'Master',
    degreeMajor: 'Computer Science',
    certifications: ['Google Certified Educator'],
    hasTeachingLicense: true,
    hasTEFL: false,
    citizenship: 'Singapore',
    age: 34,
    minSalaryUSD: 3800,
    maxSalaryUSD: 5000,
  },
  {
    email: 'lisa.garcia@email.com',
    name: 'Lisa Garcia',
    firstName: 'Lisa',
    lastName: 'Garcia',
    bio: 'Primary school generalist with a love for creating inclusive, student-centered classrooms where every child can thrive.',
    currentCountry: 'Spain',
    preferredCountries: ['United Arab Emirates', 'Qatar', 'Saudi Arabia'],
    yearsExperience: 10,
    subjects: ['General', 'English', 'Social Studies'],
    degreeLevel: 'Bachelor',
    degreeMajor: 'Elementary Education',
    certifications: ['Spanish Teaching License', 'Cambridge CELTA'],
    hasTeachingLicense: true,
    hasTEFL: true,
    citizenship: 'Spain',
    age: 36,
    minSalaryUSD: 3200,
    maxSalaryUSD: 4500,
  },
  {
    email: 'robert.anderson@email.com',
    name: 'Robert Anderson',
    firstName: 'Robert',
    lastName: 'Anderson',
    bio: 'Physical Education teacher and sports coach. Promoting healthy lifestyles and teamwork through athletics and movement education.',
    currentCountry: 'Ireland',
    preferredCountries: ['China', 'Thailand', 'Vietnam'],
    yearsExperience: 5,
    subjects: ['Physical Education', 'Health', 'Sports'],
    degreeLevel: 'Bachelor',
    degreeMajor: 'Physical Education',
    certifications: ['First Aid', 'Coaching Certification'],
    hasTeachingLicense: true,
    hasTEFL: false,
    citizenship: 'Ireland',
    age: 31,
    minSalaryUSD: 2600,
    maxSalaryUSD: 3800,
  },
  {
    email: 'maria.rodriguez@email.com',
    name: 'Maria Rodriguez',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    bio: 'Bilingual educator teaching Spanish and English. Cultural ambassador fostering global awareness and language acquisition.',
    currentCountry: 'Mexico',
    preferredCountries: ['United Arab Emirates', 'Singapore', 'South Korea'],
    yearsExperience: 6,
    subjects: ['Spanish', 'English', 'ESL'],
    degreeLevel: 'Master',
    degreeMajor: 'Modern Languages',
    certifications: ['DELE', 'TESOL'],
    hasTeachingLicense: true,
    hasTEFL: true,
    citizenship: 'Mexico',
    age: 33,
    minSalaryUSD: 3000,
    maxSalaryUSD: 4200,
  },
];

/**
 * Seed school users and profiles
 */
export async function seedSchools(): Promise<Array<{ user: any; profile: any; data: typeof SCHOOLS[0] }>> {
  logger.subsection('📚 Creating schools...');
  const summary = new SeedSummary();
  const createdSchools = [];

  for (const school of SCHOOLS) {
    try {
      // Check if school already exists
      if (await userExists(school.email)) {
        logger.warning(`  Skipped ${school.name} - user already exists`);
        summary.increment('skipped');
        continue;
      }

      if (await schoolExists(school.name)) {
        logger.warning(`  Skipped ${school.name} - school profile already exists`);
        summary.increment('skipped');
        continue;
      }

      const hashedPassword = await hashPassword(TEST_PASSWORDS.school);

      const user = await prisma.user.create({
        data: {
          email: school.email,
          password: hashedPassword,
          name: school.name,
          role: UserRole.SCHOOL,
          emailVerified: new Date(),
          status: 'ACTIVE',
        },
      });

      const schoolProfile = await prisma.schoolProfile.create({
        data: {
          userId: user.id,
          schoolName: school.name,
          country: school.country,
          city: school.city,
          schoolType: school.schoolType,
          description: school.description,
          website: school.website,
          isVerified: school.isVerified,
          verifiedAt: new Date(),
        },
      });

      createdSchools.push({ user, profile: schoolProfile, data: school });
      logger.success(`  Created ${school.name}`);
      summary.increment('created');
    } catch (error) {
      logger.error(`  Failed to create ${school.name}: ${error instanceof Error ? error.message : String(error)}`);
      summary.increment('errors');
    }
  }

  summary.display('Schools');
  return createdSchools;
}

/**
 * Seed recruiter users and profiles
 */
export async function seedRecruiters(): Promise<Array<{ user: any; profile: any }>> {
  logger.subsection('\n🔍 Creating recruiters...');
  const summary = new SeedSummary();
  const createdRecruiters = [];

  for (const recruiter of RECRUITERS) {
    try {
      // Check if recruiter already exists
      if (await userExists(recruiter.email)) {
        logger.warning(`  Skipped ${recruiter.name} - user already exists`);
        summary.increment('skipped');
        continue;
      }

      const hashedPassword = await hashPassword(TEST_PASSWORDS.recruiter);

      const user = await prisma.user.create({
        data: {
          email: recruiter.email,
          password: hashedPassword,
          name: recruiter.name,
          role: UserRole.RECRUITER,
          emailVerified: new Date(),
          status: 'ACTIVE',
        },
      });

      const recruiterProfile = await prisma.recruiterProfile.create({
        data: {
          userId: user.id,
          companyName: recruiter.companyName,
          country: recruiter.country,
          isVerified: true,
          verifiedAt: new Date(),
        },
      });

      createdRecruiters.push({ user, profile: recruiterProfile });
      logger.success(`  Created ${recruiter.name}`);
      summary.increment('created');
    } catch (error) {
      logger.error(`  Failed to create ${recruiter.name}: ${error instanceof Error ? error.message : String(error)}`);
      summary.increment('errors');
    }
  }

  summary.display('Recruiters');
  return createdRecruiters;
}

/**
 * Seed teacher users and profiles
 */
export async function seedTeachers(): Promise<void> {
  logger.subsection('\n👨‍🏫 Creating teacher profiles...');
  const summary = new SeedSummary();

  for (const teacher of TEACHERS) {
    try {
      // Check if teacher already exists
      if (await userExists(teacher.email)) {
        logger.warning(`  Skipped ${teacher.name} - user already exists`);
        summary.increment('skipped');
        continue;
      }

      const hashedPassword = await hashPassword(TEST_PASSWORDS.teacher);

      const user = await prisma.user.create({
        data: {
          email: teacher.email,
          password: hashedPassword,
          name: teacher.name,
          role: UserRole.TEACHER,
          emailVerified: new Date(),
          status: 'ACTIVE',
          profileCompleteness: 85,
        },
      });

      await prisma.teacherProfile.create({
        data: {
          userId: user.id,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          bio: teacher.bio,
          currentCountry: teacher.currentCountry,
          preferredCountries: teacher.preferredCountries,
          yearsExperience: teacher.yearsExperience,
          subjects: teacher.subjects,
          degreeLevel: teacher.degreeLevel,
          degreeMajor: teacher.degreeMajor,
          certifications: teacher.certifications,
          hasTeachingLicense: teacher.hasTeachingLicense,
          hasTEFL: teacher.hasTEFL,
          citizenship: teacher.citizenship,
          age: teacher.age,
          minSalaryUSD: teacher.minSalaryUSD,
          maxSalaryUSD: teacher.maxSalaryUSD,
          profileCompleteness: 85,
          status: 'ACTIVE',
        },
      });

      logger.success(`  Created ${teacher.name}`);
      summary.increment('created');
    } catch (error) {
      logger.error(`  Failed to create ${teacher.name}: ${error instanceof Error ? error.message : String(error)}`);
      summary.increment('errors');
    }
  }

  summary.display('Teachers');
}
