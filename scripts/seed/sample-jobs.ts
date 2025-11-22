import { prisma, jobExists, logger, SeedSummary } from './utils';

/**
 * Job posting templates indexed by school number (0-7)
 */
export const JOB_TEMPLATES = [
  // Seoul International Academy (School 0)
  [
    {
      title: 'ESL Teacher',
      description: 'We are seeking an enthusiastic ESL teacher to join our elementary department. The ideal candidate will have experience teaching young learners and creating engaging, student-centered lessons. You will work with small class sizes in a supportive, collaborative environment.',
      subject: 'English',
      minYearsExperience: 2,
      requiredSubjects: ['English', 'ESL'],
      requirements: 'Bachelor degree in Education or related field, TEFL/TESOL certificate, 2+ years teaching experience',
      salaryUSD: 2800,
      benefits: 'Housing allowance, health insurance, flight reimbursement, pension contribution',
      housingProvided: true,
      flightProvided: true,
      contractLength: 12,
      startDate: new Date('2025-08-15'),
      employmentType: 'FULL_TIME',
      educationRequirements: 'Bachelor degree required, Master preferred',
      experienceRequirements: '2+ years of ESL teaching experience',
      status: 'ACTIVE',
    },
    {
      title: 'Mathematics Teacher - Middle School',
      description: 'Join our mathematics department to teach grades 6-8. We are looking for a creative and passionate teacher who can inspire students to love mathematics through innovative teaching methods and real-world applications.',
      subject: 'Mathematics',
      minYearsExperience: 3,
      requiredSubjects: ['Mathematics'],
      requirements: 'Bachelor or Master degree in Mathematics or Education, qualified teacher status',
      salaryUSD: 3500,
      benefits: 'Furnished housing, health insurance, annual flight home, professional development budget',
      housingProvided: true,
      flightProvided: true,
      contractLength: 24,
      startDate: new Date('2025-09-01'),
      employmentType: 'FULL_TIME',
      educationRequirements: 'Bachelor degree required, Master preferred',
      experienceRequirements: '3+ years teaching mathematics at middle school level',
      status: 'ACTIVE',
    },
  ],
  // Dubai English Speaking School (School 1)
  [
    {
      title: 'Primary School Teacher',
      description: 'Excellent opportunity for an experienced primary teacher to join our outstanding school. You will be responsible for teaching all subjects to a class of 20-25 students, following the British National Curriculum.',
      subject: 'General',
      minYearsExperience: 3,
      requiredSubjects: ['General', 'English', 'Mathematics', 'Science'],
      requirements: 'UK QTS or equivalent, experience with British curriculum, strong classroom management',
      salaryUSD: 4500,
      currency: 'USD',
      benefits: 'Tax-free salary, furnished accommodation, health insurance, annual flights, end-of-service gratuity',
      housingProvided: true,
      flightProvided: true,
      contractLength: 24,
      startDate: new Date('2025-08-20'),
      employmentType: 'FULL_TIME',
      educationRequirements: 'Bachelor in Education, QTS required',
      experienceRequirements: 'Minimum 3 years primary teaching experience',
      status: 'ACTIVE',
    },
    {
      title: 'Science Teacher - Secondary',
      description: 'We need a passionate science teacher for our secondary department. The role involves teaching Biology, Chemistry, and Physics to students aged 11-16 preparing for IGCSE examinations.',
      subject: 'Science',
      minYearsExperience: 4,
      requiredSubjects: ['Science', 'Biology', 'Chemistry', 'Physics'],
      requirements: 'Science degree, teaching qualification, IGCSE experience preferred',
      salaryUSD: 5000,
      benefits: 'Tax-free salary, housing, medical insurance, annual return flights, tuition discount for children',
      housingProvided: true,
      flightProvided: true,
      contractLength: 24,
      startDate: new Date('2025-09-05'),
      employmentType: 'FULL_TIME',
      educationRequirements: 'Bachelor in Science, teaching qualification',
      experienceRequirements: '4+ years secondary science teaching',
      status: 'ACTIVE',
    },
  ],
  // Shanghai American School (School 2)
  [
    {
      title: 'High School English Teacher',
      description: 'Teach English Language Arts to high school students in our well-established American curriculum program. Small class sizes and excellent resources available.',
      subject: 'English',
      minYearsExperience: 5,
      requiredSubjects: ['English', 'Literature'],
      requirements: 'State teaching license, Bachelor degree minimum, high school teaching experience',
      salaryUSD: 4200,
      benefits: 'Furnished housing, comprehensive health coverage, relocation allowance, professional development',
      housingProvided: true,
      flightProvided: true,
      contractLength: 24,
      startDate: new Date('2025-08-10'),
      employmentType: 'FULL_TIME',
      educationRequirements: 'Bachelor required, Master preferred',
      experienceRequirements: '5+ years high school English teaching',
      status: 'ACTIVE',
    },
    {
      title: 'Physical Education Teacher',
      description: 'Dynamic PE teacher needed to lead our athletics program. Responsibilities include teaching PE classes, coaching sports teams, and organizing school-wide sporting events.',
      subject: 'Physical Education',
      minYearsExperience: 2,
      requiredSubjects: ['Physical Education', 'Sports'],
      requirements: 'PE teaching qualification, coaching experience, first aid certified',
      salaryUSD: 3800,
      benefits: 'Housing, health insurance, flights, gym membership',
      housingProvided: true,
      flightProvided: true,
      contractLength: 12,
      startDate: new Date('2025-08-15'),
      employmentType: 'FULL_TIME',
      educationRequirements: 'Bachelor in Physical Education or related field',
      experienceRequirements: '2+ years PE teaching and coaching',
      status: 'ACTIVE',
    },
  ],
  // Bangkok British School (School 3)
  [
    {
      title: 'Early Years Teacher',
      description: 'We are looking for a caring and creative early years teacher for our Foundation Stage. Experience with the EYFS curriculum essential.',
      subject: 'Early Childhood',
      minYearsExperience: 2,
      requiredSubjects: ['Early Childhood Education'],
      requirements: 'Early Years qualification, EYFS experience, positive and nurturing approach',
      salaryUSD: 2600,
      benefits: 'Accommodation allowance, health insurance, annual flight, work permit and visa support',
      housingProvided: false,
      flightProvided: true,
      contractLength: 12,
      startDate: new Date('2025-08-01'),
      employmentType: 'FULL_TIME',
      educationRequirements: 'Early Childhood Education degree',
      experienceRequirements: '2+ years EYFS teaching',
      status: 'ACTIVE',
    },
  ],
  // Tokyo International School (School 4)
  [
    {
      title: 'IB Diploma Coordinator',
      description: 'Senior leadership role managing our IB Diploma Programme. Responsibilities include curriculum oversight, staff development, and ensuring programme standards.',
      subject: 'Administration',
      minYearsExperience: 7,
      requiredSubjects: ['IB', 'Administration'],
      requirements: 'IB training, extensive teaching experience, leadership skills, Master degree preferred',
      salaryUSD: 5500,
      benefits: 'Housing stipend, comprehensive insurance, retirement plan, professional development, relocation support',
      housingProvided: false,
      flightProvided: true,
      contractLength: 24,
      startDate: new Date('2025-07-01'),
      employmentType: 'FULL_TIME',
      educationRequirements: 'Master degree in Education or related field',
      experienceRequirements: '7+ years teaching, 3+ years IB experience, leadership experience required',
      status: 'ACTIVE',
    },
    {
      title: 'Music Teacher',
      description: 'Passionate music educator needed to teach general music classes and lead instrumental programs. Experience with various instruments and musical styles valued.',
      subject: 'Music',
      minYearsExperience: 3,
      requiredSubjects: ['Music'],
      requirements: 'Music degree, teaching qualification, proficiency in multiple instruments',
      salaryUSD: 3900,
      benefits: 'Housing allowance, health insurance, visa sponsorship, instrument access',
      housingProvided: false,
      flightProvided: true,
      contractLength: 12,
      startDate: new Date('2025-08-20'),
      employmentType: 'FULL_TIME',
      educationRequirements: 'Bachelor in Music or Music Education',
      experienceRequirements: '3+ years music teaching experience',
      status: 'ACTIVE',
    },
  ],
  // Singapore International Academy (School 5)
  [
    {
      title: 'IB Biology Teacher',
      description: 'Teach IB Biology at Standard and Higher Level. Join our science department and help students achieve excellence in their examinations.',
      subject: 'Biology',
      minYearsExperience: 4,
      requiredSubjects: ['Biology', 'Science'],
      requirements: 'Biology degree, IB training or experience, teaching qualification',
      salaryUSD: 4800,
      benefits: 'Competitive salary, housing allowance, CPF contributions, medical insurance, professional development',
      housingProvided: false,
      flightProvided: true,
      contractLength: 24,
      startDate: new Date('2025-08-01'),
      employmentType: 'FULL_TIME',
      educationRequirements: 'Bachelor in Biology, Master preferred',
      experienceRequirements: '4+ years Biology teaching, IB experience required',
      status: 'ACTIVE',
    },
    {
      title: 'Learning Support Teacher',
      description: 'Support students with diverse learning needs across all grade levels. Work collaboratively with classroom teachers to implement differentiated instruction.',
      subject: 'Special Education',
      minYearsExperience: 3,
      requiredSubjects: ['Special Education', 'Learning Support'],
      requirements: 'Special education qualification, experience with inclusive education, patience and empathy',
      salaryUSD: 4200,
      benefits: 'Competitive package, housing allowance, medical benefits, visa support, CPF',
      housingProvided: false,
      flightProvided: true,
      contractLength: 24,
      startDate: new Date('2025-08-15'),
      employmentType: 'FULL_TIME',
      educationRequirements: 'Bachelor in Special Education',
      experienceRequirements: '3+ years learning support experience',
      status: 'ACTIVE',
    },
  ],
  // Hanoi International School (School 6)
  [
    {
      title: 'Elementary Homeroom Teacher',
      description: 'Teach all subjects to elementary students in a diverse, multicultural environment. Small class sizes and collaborative team.',
      subject: 'General',
      minYearsExperience: 2,
      requiredSubjects: ['General', 'Elementary Education'],
      requirements: 'Teaching license, elementary teaching experience, adaptable and culturally sensitive',
      salaryUSD: 2400,
      benefits: 'Furnished housing, health insurance, annual flights, visa support, settling-in allowance',
      housingProvided: true,
      flightProvided: true,
      contractLength: 12,
      startDate: new Date('2025-08-10'),
      employmentType: 'FULL_TIME',
      educationRequirements: 'Bachelor in Elementary Education',
      experienceRequirements: '2+ years elementary teaching',
      status: 'ACTIVE',
    },
  ],
  // Kuala Lumpur International School (School 7)
  [
    {
      title: 'Computer Science Teacher',
      description: 'Teach computer science and coding to middle and high school students. Experience with Python, Java, and web development preferred.',
      subject: 'Computer Science',
      minYearsExperience: 3,
      requiredSubjects: ['Computer Science', 'Technology'],
      requirements: 'Computer Science degree, teaching qualification, programming expertise',
      salaryUSD: 3200,
      benefits: 'Housing allowance, medical insurance, annual flight, visa sponsorship, tech budget',
      housingProvided: false,
      flightProvided: true,
      contractLength: 12,
      startDate: new Date('2025-08-25'),
      employmentType: 'FULL_TIME',
      educationRequirements: 'Bachelor in Computer Science or related field',
      experienceRequirements: '3+ years teaching CS or related subjects',
      status: 'ACTIVE',
    },
    {
      title: 'Art Teacher',
      description: 'Creative and inspiring art teacher needed to develop our visual arts program across all grade levels.',
      subject: 'Art',
      minYearsExperience: 2,
      requiredSubjects: ['Art', 'Visual Arts'],
      requirements: 'Art or Art Education degree, diverse art skills, portfolio of work',
      salaryUSD: 2900,
      benefits: 'Accommodation support, health coverage, flights, art supplies budget',
      housingProvided: false,
      flightProvided: true,
      contractLength: 12,
      startDate: new Date('2025-08-15'),
      employmentType: 'FULL_TIME',
      educationRequirements: 'Bachelor in Art or Art Education',
      experienceRequirements: '2+ years art teaching',
      status: 'ACTIVE',
    },
  ],
];

/**
 * Seed job postings for schools
 */
export async function seedJobs(
  schools: Array<{ profile: { id: string; schoolName: string; country: string; city: string } }>
): Promise<void> {
  logger.subsection('\n💼 Creating job postings...');
  const summary = new SeedSummary();

  for (let i = 0; i < schools.length; i++) {
    const school = schools[i];
    const jobsForSchool = JOB_TEMPLATES[i];

    if (!jobsForSchool) {
      logger.warning(`  No job templates for school index ${i}`);
      continue;
    }

    for (const jobTemplate of jobsForSchool) {
      try {
        // Check if job already exists
        if (await jobExists(jobTemplate.title, school.profile.id)) {
          logger.warning(`  Skipped ${jobTemplate.title} at ${school.profile.schoolName} - already exists`);
          summary.increment('skipped');
          continue;
        }

        await prisma.jobPosting.create({
          data: {
            ...jobTemplate,
            schoolId: school.profile.id,
            schoolName: school.profile.schoolName,
            country: school.profile.country,
            city: school.profile.city,
          },
        });

        logger.success(`  Created ${jobTemplate.title} at ${school.profile.schoolName}`);
        summary.increment('created');
      } catch (error) {
        logger.error(
          `  Failed to create ${jobTemplate.title} at ${school.profile.schoolName}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        summary.increment('errors');
      }
    }
  }

  summary.display('Job Postings');
}
