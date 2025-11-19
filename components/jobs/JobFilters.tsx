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
import type { JobFilters as JobFiltersType } from '@/app/actions/jobs';

type JobFiltersProps = {
  onFilterChange: (filters: JobFiltersType) => void;
  filterOptions: {
    countries: string[];
    subjects: string[];
    salaryRange: { min: number; max: number };
  };
};

export function JobFilters({ onFilterChange, filterOptions }: JobFiltersProps) {
  const [filters, setFilters] = useState<JobFiltersType>({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterUpdate = (key: keyof JobFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    onFilterChange({});
  };

  const handleSearch = () => {
    handleFilterUpdate('searchQuery', searchQuery);
  };

  const activeFilterCount = Object.keys(filters).filter(
    key => filters[key as keyof JobFiltersType] !== undefined && filters[key as keyof JobFiltersType] !== ''
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
            >
              Clear ({activeFilterCount})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="Job title, school, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select
            value={filters.country || ''}
            onValueChange={(value) =>
              handleFilterUpdate('country', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger id="country">
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {filterOptions.countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Select
            value={filters.subject || ''}
            onValueChange={(value) =>
              handleFilterUpdate('subject', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {filterOptions.subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Salary Range */}
        <div className="space-y-2">
          <Label>Salary Range (USD/month)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
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
              <Input
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
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          <Label>Benefits</Label>
          <div className="space-y-2">
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
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Housing provided
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
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Flight provided
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
