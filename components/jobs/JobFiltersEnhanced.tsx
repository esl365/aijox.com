'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, Filter, X, Search, MapPin, Briefcase, DollarSign, Clock, Gift } from 'lucide-react';
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
      label: 'Housing'
    });
  }

  if (filters.flightProvided) {
    activeFilters.push({
      key: 'flightProvided',
      value: '',
      label: 'Flight'
    });
  }

  return (
    <div className="space-y-4">
      {/* Horizontal Filter Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
        {/* Row 1: Search + Sort */}
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="h-10 px-6 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Search
            </Button>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-500 whitespace-nowrap">Sort:</Label>
            <Select
              value={filters.sortBy || 'newest'}
              onValueChange={(value) => handleFilterUpdate('sortBy', value as any)}
            >
              <SelectTrigger className="w-[160px] h-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
        </div>

        {/* Row 2: Filter Dropdowns */}
        <div className="flex flex-wrap gap-2">
          {/* Location Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-9 gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  filters.countries && filters.countries.length > 0
                    ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-transparent'
                    : ''
                }`}
              >
                <MapPin className="h-4 w-4" />
                Location
                {filters.countries && filters.countries.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-white/20 text-inherit">
                    {filters.countries.length}
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-3">
                <div className="font-semibold text-sm">Select Countries</div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filterOptions.countries.map((country) => (
                    <div key={country} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country}`}
                        checked={filters.countries?.includes(country) || false}
                        onCheckedChange={() => handleArrayFilterToggle('countries', country)}
                      />
                      <label
                        htmlFor={`country-${country}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {country}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Subject Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-9 gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  filters.subjects && filters.subjects.length > 0
                    ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-transparent'
                    : ''
                }`}
              >
                <Briefcase className="h-4 w-4" />
                Subject
                {filters.subjects && filters.subjects.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-white/20 text-inherit">
                    {filters.subjects.length}
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-3">
                <div className="font-semibold text-sm">Select Subjects</div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filterOptions.subjects.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={`subject-${subject}`}
                        checked={filters.subjects?.includes(subject) || false}
                        onCheckedChange={() => handleArrayFilterToggle('subjects', subject)}
                      />
                      <label
                        htmlFor={`subject-${subject}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {subject}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Job Type Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-9 gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  filters.employmentTypes && filters.employmentTypes.length > 0
                    ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-transparent'
                    : ''
                }`}
              >
                <Clock className="h-4 w-4" />
                Job Type
                {filters.employmentTypes && filters.employmentTypes.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-white/20 text-inherit">
                    {filters.employmentTypes.length}
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start">
              <div className="space-y-3">
                <div className="font-semibold text-sm">Select Job Types</div>
                <div className="space-y-2">
                  {filterOptions.employmentTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`employment-${type}`}
                        checked={filters.employmentTypes?.includes(type) || false}
                        onCheckedChange={() => handleArrayFilterToggle('employmentTypes', type)}
                      />
                      <label
                        htmlFor={`employment-${type}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {EMPLOYMENT_TYPE_LABELS[type] || type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Salary Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-9 gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  filters.minSalary !== undefined || filters.maxSalary !== undefined
                    ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-transparent'
                    : ''
                }`}
              >
                <DollarSign className="h-4 w-4" />
                Salary
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="start">
              <div className="space-y-4">
                <div className="font-semibold text-sm">Salary Range (USD/month)</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Min</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minSalary || ''}
                      onChange={(e) =>
                        handleFilterUpdate(
                          'minSalary',
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Max</Label>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={filters.maxSalary || ''}
                      onChange={(e) =>
                        handleFilterUpdate(
                          'maxSalary',
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      className="h-9"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Range: ${filterOptions.salaryRange.min.toLocaleString()} - ${filterOptions.salaryRange.max.toLocaleString()}
                </p>
              </div>
            </PopoverContent>
          </Popover>

          {/* Experience Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-9 gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  filters.minYearsExperience !== undefined
                    ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-transparent'
                    : ''
                }`}
              >
                Experience
                {filters.minYearsExperience !== undefined && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-white/20 text-inherit">
                    {filters.minYearsExperience}+
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="start">
              <div className="space-y-4">
                <div className="font-semibold text-sm">
                  Minimum Years: {filters.minYearsExperience || 0}
                </div>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[filters.minYearsExperience || 0]}
                  onValueChange={(value) =>
                    handleFilterUpdate('minYearsExperience', value[0] || undefined)
                  }
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Shows jobs requiring {filters.minYearsExperience || 0} or fewer years
                </p>
              </div>
            </PopoverContent>
          </Popover>

          {/* Benefits Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-9 gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  filters.housingProvided || filters.flightProvided
                    ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-transparent'
                    : ''
                }`}
              >
                <Gift className="h-4 w-4" />
                Benefits
                {(filters.housingProvided || filters.flightProvided) && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-white/20 text-inherit">
                    {(filters.housingProvided ? 1 : 0) + (filters.flightProvided ? 1 : 0)}
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start">
              <div className="space-y-3">
                <div className="font-semibold text-sm">Select Benefits</div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="housing"
                      checked={filters.housingProvided || false}
                      onCheckedChange={(checked) =>
                        handleFilterUpdate('housingProvided', checked || undefined)
                      }
                    />
                    <label htmlFor="housing" className="text-sm cursor-pointer flex-1">
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
                    <label htmlFor="flight" className="text-sm cursor-pointer flex-1">
                      Flight Provided
                    </label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Clear All Button (only show if filters active) */}
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-9 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={`${filter.key}-${filter.value}-${index}`}
              variant="secondary"
              className="h-8 gap-1.5 px-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => removeFilter(filter.key, filter.value || undefined)}
            >
              {filter.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
