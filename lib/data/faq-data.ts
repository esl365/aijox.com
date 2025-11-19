export type FAQItem = {
  question: string;
  answer: string;
};

export type FAQCategory = {
  title: string;
  description: string;
  icon: string;
  items: FAQItem[];
};

export const faqData: FAQCategory[] = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of using Global Educator Nexus',
    icon: '🚀',
    items: [
      {
        question: 'How do I create an account?',
        answer:
          'Click the "Sign Up" button in the top right corner. You can sign up with your email or use Google authentication. After signing up, you\'ll be prompted to select your role (Teacher, Recruiter, or School) and complete your profile.',
      },
      {
        question: 'Is the platform free to use?',
        answer:
          'Yes! Creating an account and browsing jobs is completely free for teachers. Schools and recruiters can post their first job for free. We offer premium features for advanced matching and analytics.',
      },
      {
        question: 'How does the AI matching work?',
        answer:
          'Our AI analyzes your profile, qualifications, experience, and preferences to match you with relevant job opportunities. The system uses vector similarity to find the best matches based on your teaching subjects, preferred locations, salary expectations, and more.',
      },
      {
        question: 'What makes Global Educator Nexus different?',
        answer:
          'We combine AI-powered matching, automated visa eligibility checking, and video resume analysis to help teachers find international teaching positions. Our platform is specifically designed for educators seeking opportunities abroad.',
      },
    ],
  },
  {
    title: 'Teacher Profiles',
    description: 'Creating and optimizing your teaching profile',
    icon: '👨‍🏫',
    items: [
      {
        question: 'What should I include in my profile?',
        answer:
          'Complete all sections including: personal information, teaching experience, education, certifications (TEFL, teaching license), subjects you teach, preferred countries, and salary expectations. Upload a video resume to stand out - profiles with videos get 3x more views!',
      },
      {
        question: 'How do I upload a video resume?',
        answer:
          'Go to your profile and click "Upload Video Resume." Record or upload a 2-5 minute video introducing yourself, your teaching experience, and what you\'re looking for. Our AI will analyze your video and provide feedback to help you improve.',
      },
      {
        question: 'Can I update my profile after creating it?',
        answer:
          'Yes! You can update your profile anytime. Go to your dashboard and click "Edit Profile." We recommend keeping your profile up-to-date, especially your availability and preferred locations.',
      },
      {
        question: 'How is profile completeness calculated?',
        answer:
          'Profile completeness is based on filled sections: basic info, experience, education, certifications, video resume, visa documents, and preferences. A complete profile (100%) significantly increases your chances of being matched with jobs.',
      },
    ],
  },
  {
    title: 'Job Search & Applications',
    description: 'Finding and applying for teaching positions',
    icon: '🔍',
    items: [
      {
        question: 'How do I search for jobs?',
        answer:
          'Use the search bar on the Jobs page to filter by country, subject, salary range, and benefits. You can save your searches and set up email alerts to be notified when new matching jobs are posted.',
      },
      {
        question: 'What is a match score?',
        answer:
          'The match score (0-100%) shows how well a job matches your profile based on subjects, location preferences, experience level, and salary expectations. Jobs with 80%+ match are highly recommended.',
      },
      {
        question: 'How do I apply for a job?',
        answer:
          'Click "Apply" on any job listing. Our system will check your visa eligibility and profile completeness. You\'ll be prompted to write a cover letter (optional but recommended). After applying, you can track your application status in your dashboard.',
      },
      {
        question: 'Can I withdraw my application?',
        answer:
          'Yes, you can withdraw applications that haven\'t been reviewed yet. Go to your Applications page, find the application, and click "Withdraw." This cannot be undone.',
      },
      {
        question: 'How long does it take to hear back from schools?',
        answer:
          'Most schools review applications within 5-10 business days. You\'ll receive email notifications when your application status changes. Check your Applications dashboard for real-time updates.',
      },
    ],
  },
  {
    title: 'Visa & Requirements',
    description: 'Understanding visa eligibility and requirements',
    icon: '🛂',
    items: [
      {
        question: 'How does the visa eligibility checker work?',
        answer:
          'Our AI-powered Visa Guard analyzes your profile against country-specific visa requirements (age, education, criminal record, certifications, etc.) and provides instant eligibility results for 10+ countries including South Korea, China, UAE, Japan, and Thailand.',
      },
      {
        question: 'What visa documents do I need?',
        answer:
          'Common requirements include: passport copy, degree certificates (apostilled for many countries), teaching certifications (TEFL/TESOL), criminal background check, health certificate, and sometimes visa photos. Requirements vary by country.',
      },
      {
        question: 'Can I teach abroad without a teaching license?',
        answer:
          'It depends on the country and school type. Many ESL positions in Asia (Korea, China, Vietnam) accept TEFL/TESOL certification instead of a teaching license. International schools typically require a teaching license.',
      },
      {
        question: 'What is apostille and do I need it?',
        answer:
          'An apostille is an international certification that authenticates your documents (degrees, background checks) for use in foreign countries. Most Asian countries require apostilled documents. Check the visa guide for your target country.',
      },
      {
        question: 'How old do I need to be to teach abroad?',
        answer:
          'Age requirements vary by country. Most countries accept teachers aged 22-60. South Korea: 22-60, China: 22-60, UAE: 22-60, Japan: 22-65, Thailand: 22-60. Some countries have exceptions for experienced teachers.',
      },
    ],
  },
  {
    title: 'For Schools & Recruiters',
    description: 'Posting jobs and finding qualified teachers',
    icon: '🏫',
    items: [
      {
        question: 'How do I post a job?',
        answer:
          'Sign up as a School or Recruiter, complete your organization profile, then click "Post a Job" from your dashboard. Fill in job details, requirements, salary, benefits, and contract length. Your job will be reviewed and published within 24 hours.',
      },
      {
        question: 'How much does it cost to post a job?',
        answer:
          'Your first job posting is free! Additional postings are available through our subscription plans. Contact us for enterprise pricing if you\'re hiring multiple teachers.',
      },
      {
        question: 'How does AI matching work for employers?',
        answer:
          'Our system automatically matches qualified teachers to your job based on subject expertise, location, experience, and salary expectations. Matched teachers receive personalized email notifications about your position.',
      },
      {
        question: 'Can I see teacher profiles before they apply?',
        answer:
          'You can browse teacher profiles in our database and see basic information. Full profiles (including video resumes and contact information) become available when teachers apply to your jobs.',
      },
      {
        question: 'How do I manage applications?',
        answer:
          'All applications appear in your recruiter dashboard. You can screen, interview, make offers, and track the hiring process. Update application statuses to keep teachers informed.',
      },
    ],
  },
  {
    title: 'Reviews & Trust',
    description: 'Community reviews and verification',
    icon: '⭐',
    items: [
      {
        question: 'Can I review schools and jobs?',
        answer:
          'Yes! Teachers who have applied to or worked at a school can leave reviews. Share your honest experience to help other teachers make informed decisions. All reviews are moderated before being published.',
      },
      {
        question: 'How does review verification work?',
        answer:
          'Reviews from teachers who have actually worked at a school receive a "Verified" badge. We check employment history through application records. Verified reviews carry more weight in our ratings.',
      },
      {
        question: 'Can schools respond to reviews?',
        answer:
          'Schools can report inappropriate reviews for moderation. We\'re working on allowing schools to respond to reviews publicly to address concerns and provide context.',
      },
      {
        question: 'What if I see a fake or inappropriate review?',
        answer:
          'Use the "Report" button on any review that violates our guidelines (spam, profanity, personal attacks, false information). Our moderation team reviews all reports within 24 hours.',
      },
    ],
  },
  {
    title: 'Technical Support',
    description: 'Account issues and technical help',
    icon: '🛠️',
    items: [
      {
        question: 'I forgot my password. How do I reset it?',
        answer:
          'Click "Forgot Password" on the login page and enter your email. We\'ll send you a reset link. If you signed up with Google, use "Sign in with Google" instead.',
      },
      {
        question: 'Why isn\'t my video uploading?',
        answer:
          'Video files must be under 100MB and in MP4, MOV, or AVI format. If your video is too large, try compressing it using a free tool like HandBrake. If problems persist, contact support.',
      },
      {
        question: 'How do I delete my account?',
        answer:
          'Go to Settings > Account > Delete Account. This action is permanent and cannot be undone. All your applications, saved searches, and profile data will be deleted.',
      },
      {
        question: 'I\'m not receiving email notifications',
        answer:
          'Check your spam/junk folder and add noreply@globaleducatornexus.com to your contacts. Verify your email notification settings in Settings > Notifications. Contact support if issues continue.',
      },
      {
        question: 'How do I contact support?',
        answer:
          'Email us at support@globaleducatornexus.com or use the "Contact Support" button in your dashboard. We typically respond within 24 hours on business days.',
      },
    ],
  },
];
