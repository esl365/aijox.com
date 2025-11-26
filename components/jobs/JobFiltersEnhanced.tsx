'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, ChevronUp, Filter, X, Search } from 'lucide-react';
import type { JobFilters as JobFiltersType } from '@/app/actions/jobs';

type JobFiltersEnhancedProps = {
  onFilterChange: (filters: JobFiltersType) => void;
  filterOptions: {
    countries: string[];
    subjects: string[];
    employmentTypes: string[];
    salaryRange: { min: number; max: number };
  };
  variant?: 'sidebar' | 'inline';
};

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  TEMPORARY: 'Temporary',
  INTERN: 'Internship',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'salary_high', label: 'Highest Salary' },
  { value: 'salary_low', label: 'Lowest Salary' },
  { value: 'experience', label: 'Experience Required' },
];

export function JobFiltersEnhanced({ onFilterChange, filterOptions, variant = 'sidebar' }: JobFiltersEnhancedProps) {
  const [filters, setFilters] = useState<JobFiltersType>({
    sortBy: 'newest',
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Collapsible sections state
  const [locationOpen, setLocationOpen] = useState(true);
  const [subjectOpen, setSubjectOpen] = useState(true);
  const [employmentOpen, setEmploymentOpen] = useState(false);
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [benefitsOpen, setBenefitsOpen] = useState(false);

  const handleFilterUpdate = (key: keyof JobFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleArrayFilterToggle = (
    key: 'countries' | 'subjects' | 'employmentTypes',
    value: string
  ) => {
    const currentArray = (filters[key] || []) as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];

    handleFilterUpdate(key, newArray.length > 0 ? newArray : undefined);
  };

  const handleClearFilters = () => {
    setFilters({ sortBy: 'newest' });
    setSearchQuery('');
    onFilterChange({ sortBy: 'newest' });
  };

  const handleSearch = () => {
    handleFilterUpdate('searchQuery', searchQuery || undefined);
  };

  const removeFilter = (key: keyof JobFiltersType, value?: string) => {
    if (value && (key === 'countries' || key === 'subjects' || key === 'employmentTypes')) {
      const currentArray = (filters[key] || []) as string[];
      const newArray = currentArray.filter(item => item !== value);
      handleFilterUpdate(key, newArray.length > 0 ? newArray : undefined);
    } else {
      handleFilterUpdate(key, undefined);
    }
  };

  // Count active filters (excluding sortBy and searchQuery)
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) =>
      key !== 'sortBy' &&
      key !== 'searchQuery' &&
      value !== undefined &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0)
  ).length;

  // Generate active filter chips
  const activeFilters: Array<{ key: keyof JobFiltersType; value: string; label: string }> = [];

  if (filters.countries) {
    filters.countries.forEach(country => {
      activeFilters.push({ key: 'countries', value: country, label: country });
    });
  }

  if (filters.subjects) {
    filters.subjects.forEach(subject => {
      activeFilters.push({ key: 'subjects', value: subject, label: subject });
    });
  }

  if (filters.employmentTypes) {
    filters.employmentTypes.forEach(type => {
      activeFilters.push({
        key: 'employmentTypes',
        value: type,
        label: EMPLOYMENT_TYPE_LABELS[type] || type
      });
    });
  }

  if (filters.minSalary !== undefined) {
    activeFilters.push({
      key: 'minSalary',
      value: '',
      label: `Min: $${filters.minSalary.toLocaleString()}`
    });
  }

  if (filters.maxSalary !== undefined) {
    activeFilters.push({
      key: 'maxSalary',
      value: '',
      label: `Max: $${filters.maxSalary.toLocaleString()}`
    });
  }

  if (filters.minYearsExperience !== undefined) {
    activeFilters.push({
      key: 'minYearsExperience',
      value: '',
      label: `${filters.minYearsExperience}+ years exp.`
    });
  }

  if (filters.housingProvided) {
    activeFilters.push({
      key: 'housingProvided',
      value: '',
      label: 'Housing Provided'
    });
  }

  if (filters.flightProvided) {
    activeFilters.push({
      key: 'flightProvided',
      value: '',
      label: 'Flight Provided'
    });
  }

  return (
    <div className="space-y-4">
      {/* Search & Sort Bar */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Jobs
            </Label>
            <div className="flex gap-2">
              <Input
                id="search"
                placeholder="Job title, school, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <Label htmlFor="sort">Sort By</Label>
            <Select
              value={filters.sortBy || 'newest'}
              onValueChange={(value) => handleFilterUpdate('sortBy', value as any)}
            >
              <SelectTrigger id="sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Active Filters ({activeFilters.length})
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="h-auto py-1 px-3 border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <Badge
                  key={`${filter.key}-${filter.value}-${index}`}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {filter.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0.5 hover:bg-transparent"
                    onClick={() => removeFilter(filter.key, filter.value || undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Location Filter */}
          <Collapsible open={locationOpen} onOpenChange={setLocationOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>Location {filters.countries && filters.countries.length > 0 && `(${filters.countries.length})`}</span>
                {locationOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <div className="max-h-60 overflow-y-auto space-y-2 px-2">
                {filterOptions.countries.map((country) => (
                  <div key={country} className="flex items-center space-x-2">
                    <Checkbox
                      id={`country-${country}`}
                      checked={filters.countries?.includes(country) || false}
                      onCheckedChange={() => handleArrayFilterToggle('countries', country)}
                    />
                    <label
                      htmlFor={`country-${country}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {country}
                    </label>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Subject Filter */}
          <Collapsible open={subjectOpen} onOpenChange={setSubjectOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>Subject {filters.subjects && filters.subjects.length > 0 && `(${filters.subjects.length})`}</span>
                {subjectOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <div className="max-h-60 overflow-y-auto space-y-2 px-2">
                {filterOptions.subjects.map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subject-${subject}`}
                      checked={filters.subjects?.includes(subject) || false}
                      onCheckedChange={() => handleArrayFilterToggle('subjects', subject)}
                    />
                    <label
                      htmlFor={`subject-${subject}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {subject}
                    </label>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Employment Type Filter */}
          <Collapsible open={employmentOpen} onOpenChange={setEmploymentOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>Job Type {filters.employmentTypes && filters.employmentTypes.length > 0 && `(${filters.employmentTypes.length})`}</span>
                {employmentOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <div className="space-y-2 px-2">
                {filterOptions.employmentTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`employment-${type}`}
                      checked={filters.employmentTypes?.includes(type) || false}
                      onCheckedChange={() => handleArrayFilterToggle('employmentTypes', type)}
                    />
                    <label
                      htmlFor={`employment-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {EMPLOYMENT_TYPE_LABELS[type] || type}
                    </label>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Salary Range Filter */}
          <Collapsible open={salaryOpen} onOpenChange={setSalaryOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>Salary Range</span>
                {salaryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2 px-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="minSalary" className="text-xs">Min (USD/month)</Label>
                  <Input
                    id="minSalary"
                    type="number"
                    placeholder="Min"
                    value={filters.minSalary || ''}
                    onChange={(e) =>
                      handleFilterUpdate(
                        'minSalary',
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    min={filterOptions.salaryRange.min}
                    max={filterOptions.salaryRange.max}
                  />
                </div>
                <div>
                  <Label htmlFor="maxSalary" className="text-xs">Max (USD/month)</Label>
                  <Input
                    id="maxSalary"
                    type="number"
                    placeholder="Max"
                    value={filters.maxSalary || ''}
                    onChange={(e) =>
                      handleFilterUpdate(
                        'maxSalary',
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    min={filterOptions.salaryRange.min}
                    max={filterOptions.salaryRange.max}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Range: ${filterOptions.salaryRange.min.toLocaleString()} - $
                {filterOptions.salaryRange.max.toLocaleString()}
              </p>
            </CollapsibleContent>
          </Collapsible>

          {/* Experience Level Filter */}
          <Collapsible open={experienceOpen} onOpenChange={setExperienceOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>Experience Level</span>
                {experienceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2 px-2">
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm">
                  Minimum Years: {filters.minYearsExperience || 0}
                </Label>
                <Slider
                  id="experience"
                  min={0}
                  max={10}
                  step={1}
                  value={[filters.minYearsExperience || 0]}
                  onValueChange={(value) =>
                    handleFilterUpdate('minYearsExperience', value[0] || undefined)
                  }
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Shows jobs requiring {filters.minYearsExperience || 0} or fewer years
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Benefits Filter */}
          <Collapsible open={benefitsOpen} onOpenChange={setBenefitsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>Benefits</span>
                {benefitsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2 px-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="housing"
                  checked={filters.housingProvided || false}
                  onCheckedChange={(checked) =>
                    handleFilterUpdate('housingProvided', checked || undefined)
                  }
                />
                <label
                  htmlFor="housing"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Housing Provided
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flight"
                  checked={filters.flightProvided || false}
                  onCheckedChange={(checked) =>
                    handleFilterUpdate('flightProvided', checked || undefined)
                  }
                />
                <label
                  htmlFor="flight"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Flight Provided
                </label>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}
