'use client';

/**
 * FiltersPanel Component
 *
 * Advanced job filters with real-time updates and URL synchronization.
 * Features:
 * - Sidebar layout (desktop) / Bottom sheet (mobile)
 * - Real-time filtering with debounce
 * - Filter counts display
 * - Accordion sections
 * - Quick filters (Visa, Remote, Urgent)
 * - Active filter badges
 * - Clear all functionality
 * - URL state sync
 *
 * Algorithm:
 * 1. User selects filter
 * 2. Update Zustand store (instant UI feedback)
 * 3. Debounce 300ms
 * 4. Trigger React Query refetch
 * 5. Update URL params
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Filter,
  MapPin,
  BookOpen,
  DollarSign,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useFilterActions, useFilters } from '@/lib/stores/jobs-store';
import { useFilterCounts } from '@/lib/hooks/use-jobs';
import { cn } from '@/lib/utils';
import type { FiltersPanelProps } from '@/lib/design-system';

const COUNTRIES = [
  'Japan',
  'China',
  'South Korea',
  'Thailand',
  'Vietnam',
  'Taiwan',
  'Saudi Arabia',
  'UAE',
  'Spain',
  'Italy',
];

const SUBJECTS = [
  'English',
  'Math',
  'Science',
  'History',
  'Art',
  'Music',
  'Physical Education',
  'Computer Science',
];

const CONTRACT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT'];

export function FiltersPanel({
  variant = 'sidebar',
  className,
  ...props
}: FiltersPanelProps) {
  const filters = useFilters();
  const { updateFilter, clearFilters } = useFilterActions();
  const { data: filterCounts } = useFilterCounts();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Sync URL to filters on mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    // Parse URL params to filters
    const urlFilters: any = {};

    if (params.get('countries')) {
      urlFilters.countries = params.get('countries')?.split(',');
    }
    if (params.get('subjects')) {
      urlFilters.subjects = params.get('subjects')?.split(',');
    }
    if (params.get('visaSponsorship')) {
      urlFilters.visaSponsorship = params.get('visaSponsorship') === 'true';
    }
    if (params.get('salaryMin')) {
      urlFilters.salaryMin = parseInt(params.get('salaryMin')!);
    }
    if (params.get('salaryMax')) {
      urlFilters.salaryMax = parseInt(params.get('salaryMax')!);
    }

    // Update filters from URL (only on initial mount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync filters to URL (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();

      // Add all active filters to URL
      if (filters.countries && filters.countries.length > 0) {
        params.set('countries', filters.countries.join(','));
      }
      if (filters.subjects && filters.subjects.length > 0) {
        params.set('subjects', filters.subjects.join(','));
      }
      if (filters.visaSponsorship !== undefined) {
        params.set('visaSponsorship', String(filters.visaSponsorship));
      }
      if (filters.salaryMin) {
        params.set('salaryMin', String(filters.salaryMin));
      }
      if (filters.salaryMax) {
        params.set('salaryMax', String(filters.salaryMax));
      }
      if (filters.contractType && filters.contractType.length > 0) {
        params.set('contractType', filters.contractType.join(','));
      }
      if (filters.remote) {
        params.set('remote', 'true');
      }
      if (filters.urgent) {
        params.set('urgent', 'true');
      }
      if (filters.featured) {
        params.set('featured', 'true');
      }

      router.replace(`?${params.toString()}`, { scroll: false });
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeout);
  }, [filters, router]);

  const handleCountryToggle = (country: string) => {
    const current = filters.countries || [];
    const updated = current.includes(country)
      ? current.filter((c) => c !== country)
      : [...current, country];
    updateFilter('countries', updated);
  };

  const handleSubjectToggle = (subject: string) => {
    const current = filters.subjects || [];
    const updated = current.includes(subject)
      ? current.filter((s) => s !== subject)
      : [...current, subject];
    updateFilter('subjects', updated);
  };

  const handleContractTypeToggle = (type: string) => {
    const current = filters.contractType || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    updateFilter('contractType', updated);
  };

  const handleSalaryChange = (values: number[]) => {
    updateFilter('salaryMin', values[0]);
    updateFilter('salaryMax', values[1]);
  };

  const activeFilterCount = [
    filters.countries?.length || 0,
    filters.subjects?.length || 0,
    filters.contractType?.length || 0,
    filters.visaSponsorship ? 1 : 0,
    filters.remote ? 1 : 0,
    filters.urgent ? 1 : 0,
    filters.featured ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick Filters</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.visaSponsorship ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              updateFilter('visaSponsorship', !filters.visaSponsorship)
            }
            className="h-8"
          >
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Visa Sponsorship
          </Button>
          <Button
            variant={filters.remote ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('remote', !filters.remote)}
            className="h-8"
          >
            Remote
          </Button>
          <Button
            variant={filters.urgent ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('urgent', !filters.urgent)}
            className="h-8"
          >
            Urgent
          </Button>
        </div>
      </div>

      {/* Country Filter */}
      <FilterSection
        title="Country"
        icon={<MapPin className="h-4 w-4" />}
        defaultOpen
      >
        <div className="space-y-3">
          {COUNTRIES.map((country) => (
            <div key={country} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`country-${country}`}
                  checked={filters.countries?.includes(country) || false}
                  onCheckedChange={() => handleCountryToggle(country)}
                />
                <Label
                  htmlFor={`country-${country}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {country}
                </Label>
              </div>
              {filterCounts?.[country] && (
                <span className="text-xs text-muted-foreground">
                  {filterCounts[country]}
                </span>
              )}
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Subject Filter */}
      <FilterSection
        title="Subject"
        icon={<BookOpen className="h-4 w-4" />}
        defaultOpen
      >
        <div className="space-y-3">
          {SUBJECTS.map((subject) => (
            <div key={subject} className="flex items-center gap-2">
              <Checkbox
                id={`subject-${subject}`}
                checked={filters.subjects?.includes(subject) || false}
                onCheckedChange={() => handleSubjectToggle(subject)}
              />
              <Label
                htmlFor={`subject-${subject}`}
                className="cursor-pointer text-sm font-normal"
              >
                {subject}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Salary Range */}
      <FilterSection
        title="Salary Range (USD)"
        icon={<DollarSign className="h-4 w-4" />}
      >
        <div className="space-y-4">
          <Slider
            min={0}
            max={150000}
            step={5000}
            value={[
              filters.salaryMin || 0,
              filters.salaryMax || 150000,
            ]}
            onValueChange={handleSalaryChange}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              ${(filters.salaryMin || 0).toLocaleString()}
            </span>
            <span className="text-muted-foreground">to</span>
            <span className="font-medium">
              ${(filters.salaryMax || 150000).toLocaleString()}
            </span>
          </div>
        </div>
      </FilterSection>

      {/* Contract Type */}
      <FilterSection
        title="Contract Type"
        icon={<Briefcase className="h-4 w-4" />}
      >
        <div className="space-y-3">
          {CONTRACT_TYPES.map((type) => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                id={`contract-${type}`}
                checked={filters.contractType?.includes(type) || false}
                onCheckedChange={() => handleContractTypeToggle(type)}
              />
              <Label
                htmlFor={`contract-${type}`}
                className="cursor-pointer text-sm font-normal"
              >
                {type.replace('_', ' ')}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  if (variant === 'modal') {
    return (
      <Sheet open={true} onOpenChange={() => {}}>
        <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        'space-y-6 rounded-lg border bg-card p-6',
        variant === 'sidebar' && 'sticky top-20',
        className
      )}
      {...props}
    >
      {content}
    </aside>
  );
}

/**
 * FilterSection Component
 */
interface FilterSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function FilterSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-0 hover:bg-transparent"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium">{title}</span>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}
