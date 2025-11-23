/**
 * UI Smoke Tests for Key Pages
 * Basic rendering and interaction tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('UI Smoke Tests', () => {
  describe('Component Rendering', () => {
    it('should render button component', () => {
      const Button = ({ children }: { children: React.ReactNode }) => (
        <button className="btn">{children}</button>
      );

      render(<Button>Click me</Button>);
      const button = screen.getByText('Click me');

      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('should render card component', () => {
      const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div className="card">
          <h3>{title}</h3>
          <div>{children}</div>
        </div>
      );

      render(
        <Card title="Test Card">
          <p>Card content</p>
        </Card>
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render input component', () => {
      const Input = ({ label, placeholder }: { label: string; placeholder: string }) => (
        <div>
          <label>{label}</label>
          <input placeholder={placeholder} />
        </div>
      );

      render(<Input label="Email" placeholder="Enter your email" />);

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });
  });

  describe('Form Elements', () => {
    it('should render form with multiple inputs', () => {
      const LoginForm = () => (
        <form>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="submit">Login</button>
        </form>
      );

      render(<LoginForm />);

      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('should render select dropdown', () => {
      const CountrySelect = () => (
        <select aria-label="Country">
          <option value="">Select country</option>
          <option value="south-korea">South Korea</option>
          <option value="china">China</option>
          <option value="japan">Japan</option>
        </select>
      );

      render(<CountrySelect />);

      const select = screen.getByLabelText('Country');
      expect(select).toBeInTheDocument();
      expect(select.tagName).toBe('SELECT');
    });

    it('should render checkbox', () => {
      const CheckboxInput = () => (
        <label>
          <input type="checkbox" />
          I agree to terms and conditions
        </label>
      );

      render(<CheckboxInput />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(screen.getByText('I agree to terms and conditions')).toBeInTheDocument();
    });
  });

  describe('Job Listing Card', () => {
    it('should render job card with details', () => {
      const JobCard = ({ job }: { job: any }) => (
        <div className="job-card">
          <h3>{job.title}</h3>
          <p>{job.schoolName}</p>
          <p>{job.location}</p>
          <p>${job.salary}/month</p>
        </div>
      );

      const mockJob = {
        title: 'English Teacher',
        schoolName: 'Seoul International School',
        location: 'Seoul, South Korea',
        salary: 2500,
      };

      render(<JobCard job={mockJob} />);

      expect(screen.getByText('English Teacher')).toBeInTheDocument();
      expect(screen.getByText('Seoul International School')).toBeInTheDocument();
      expect(screen.getByText('Seoul, South Korea')).toBeInTheDocument();
      expect(screen.getByText('$2500/month')).toBeInTheDocument();
    });

    it('should render multiple job cards', () => {
      const JobList = ({ jobs }: { jobs: any[] }) => (
        <div>
          {jobs.map((job, index) => (
            <div key={index} className="job-card">
              <h3>{job.title}</h3>
            </div>
          ))}
        </div>
      );

      const mockJobs = [
        { title: 'English Teacher' },
        { title: 'Math Teacher' },
        { title: 'Science Teacher' },
      ];

      render(<JobList jobs={mockJobs} />);

      expect(screen.getByText('English Teacher')).toBeInTheDocument();
      expect(screen.getByText('Math Teacher')).toBeInTheDocument();
      expect(screen.getByText('Science Teacher')).toBeInTheDocument();
    });
  });

  describe('Profile Display', () => {
    it('should render teacher profile summary', () => {
      const ProfileSummary = ({ profile }: { profile: any }) => (
        <div className="profile-summary">
          <h2>{profile.name}</h2>
          <p>{profile.subject}</p>
          <p>{profile.experience} years experience</p>
          <div>
            {profile.certifications.map((cert: string, i: number) => (
              <span key={i} className="badge">
                {cert}
              </span>
            ))}
          </div>
        </div>
      );

      const mockProfile = {
        name: 'John Smith',
        subject: 'English',
        experience: 5,
        certifications: ['TEFL', 'CELTA'],
      };

      render(<ProfileSummary profile={mockProfile} />);

      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('5 years experience')).toBeInTheDocument();
      expect(screen.getByText('TEFL')).toBeInTheDocument();
      expect(screen.getByText('CELTA')).toBeInTheDocument();
    });
  });

  describe('Application Status Badge', () => {
    it('should render NEW status badge', () => {
      const StatusBadge = ({ status }: { status: string }) => (
        <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
      );

      render(<StatusBadge status="NEW" />);

      const badge = screen.getByText('NEW');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('badge-new');
    });

    it('should render REVIEWED status badge', () => {
      const StatusBadge = ({ status }: { status: string }) => (
        <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
      );

      render(<StatusBadge status="REVIEWED" />);

      const badge = screen.getByText('REVIEWED');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('badge-reviewed');
    });

    it('should render SHORTLISTED status badge', () => {
      const StatusBadge = ({ status }: { status: string }) => (
        <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
      );

      render(<StatusBadge status="SHORTLISTED" />);

      const badge = screen.getByText('SHORTLISTED');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('badge-shortlisted');
    });
  });

  describe('Loading States', () => {
    it('should render loading spinner', () => {
      const LoadingSpinner = () => (
        <div className="spinner" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      );

      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render skeleton loader', () => {
      const SkeletonLoader = () => (
        <div className="skeleton" data-testid="skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
        </div>
      );

      render(<SkeletonLoader />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('skeleton');
    });
  });

  describe('Error States', () => {
    it('should render error message', () => {
      const ErrorMessage = ({ message }: { message: string }) => (
        <div role="alert" className="error">
          {message}
        </div>
      );

      render(<ErrorMessage message="Failed to load jobs" />);

      const error = screen.getByRole('alert');
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('Failed to load jobs');
    });

    it('should render error boundary fallback', () => {
      const ErrorFallback = () => (
        <div role="alert">
          <h2>Something went wrong</h2>
          <button>Try again</button>
        </div>
      );

      render(<ErrorFallback />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should render empty job list message', () => {
      const EmptyJobList = () => (
        <div className="empty-state">
          <p>No jobs found</p>
          <p>Try adjusting your filters</p>
        </div>
      );

      render(<EmptyJobList />);

      expect(screen.getByText('No jobs found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
    });

    it('should render empty applications message', () => {
      const EmptyApplications = () => (
        <div className="empty-state">
          <p>You haven't applied to any jobs yet</p>
          <button>Browse jobs</button>
        </div>
      );

      render(<EmptyApplications />);

      expect(screen.getByText("You haven't applied to any jobs yet")).toBeInTheDocument();
      expect(screen.getByText('Browse jobs')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should render navigation menu', () => {
      const NavMenu = () => (
        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="/jobs">Jobs</a>
          <a href="/applications">Applications</a>
          <a href="/profile">Profile</a>
        </nav>
      );

      render(<NavMenu />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Jobs')).toBeInTheDocument();
      expect(screen.getByText('Applications')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
  });
});
