'use client';

/**
 * Hybrid Job Creation Form
 *
 * Phase 1 & 2: AI-assisted job posting with paste & extract
 * - Left side: Paste job posting text
 * - Right side: AI-extracted form with live preview
 * - Confidence warnings displayed
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Save,
  Eye,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  FileText,
  DollarSign,
  MapPin,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { extractJobFromText } from '@/app/actions/job-extraction';
import type { ExtractedJobData } from '@/lib/ai/job-parser';

type FormData = Partial<ExtractedJobData> & {
  rawJobPosting?: string;
};

export default function JobCreationForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isExtracting, setIsExtracting] = useState(false);
  const [rawText, setRawText] = useState('');
  const [formData, setFormData] = useState<FormData>({});
  const [confidence, setConfidence] = useState<number | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [extractionMode, setExtractionMode] = useState<'manual' | 'ai'>('manual');

  const handleExtractWithAI = async () => {
    if (!rawText.trim()) {
      alert('Please paste a job posting first');
      return;
    }

    setIsExtracting(true);
    try {
      const result = await extractJobFromText(rawText);

      setFormData({
        ...result.fields,
        rawJobPosting: rawText,
      });
      setConfidence(result.confidence);
      setWarnings(result.warnings);
      setExtractionMode('ai');
    } catch (error) {
      console.error('Extraction error:', error);
      alert('Failed to extract job fields. Please try again or fill the form manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title || !formData.country || !formData.city || !formData.salaryUSD) {
      alert('Please fill in all required fields');
      return;
    }

    startTransition(async () => {
      try {
        // TODO: Create job posting server action
        console.log('Creating job posting:', formData);
        router.push('/recruiter/dashboard');
      } catch (error) {
        console.error('Error creating job:', error);
        alert('Failed to create job posting');
      }
    });
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/recruiter/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-2">Create Job Posting</h1>
            <p className="text-muted-foreground">
              Paste your existing job posting or fill the form manually
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT SIDE: Paste & Extract */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Powered Job Extraction
                </CardTitle>
                <CardDescription>
                  Paste your existing job posting and let AI extract the structured data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rawJobText">Job Posting Text</Label>
                  <Textarea
                    id="rawJobText"
                    placeholder="Paste your job posting here...

Example: Full-time ESL Teacher needed at Seoul International School. Salary: 2.8M KRW/month. Housing and flights provided. Bachelor's degree + 2 years experience required..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={handleExtractWithAI}
                  disabled={isExtracting || !rawText.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Extract Details with AI
                    </>
                  )}
                </Button>

                {/* Extraction Confidence */}
                {confidence !== null && (
                  <Alert variant={confidence >= 0.8 ? 'default' : 'destructive'}>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>
                      Extraction Confidence: {Math.round(confidence * 100)}%
                    </AlertTitle>
                    <AlertDescription>
                      {confidence >= 0.8
                        ? 'High confidence extraction. Please review the fields below.'
                        : 'Low confidence extraction. Please carefully review and correct the fields.'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Warnings */}
                {warnings.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Extraction Warnings</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm">{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    <strong>Tip:</strong> You can also fill the form manually without using AI extraction.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE: Form & Live Preview */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title || ''}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="e.g., ESL Teacher"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name *</Label>
                    <Input
                      id="schoolName"
                      value={formData.schoolName || ''}
                      onChange={(e) => updateField('schoolName', e.target.value)}
                      placeholder="e.g., Seoul International Academy"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject || ''}
                      onChange={(e) => updateField('subject', e.target.value)}
                      placeholder="e.g., English, Math, Science"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment Type *</Label>
                    <Select
                      value={formData.employmentType || 'FULL_TIME'}
                      onValueChange={(value) => updateField('employmentType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_TIME">Full-time</SelectItem>
                        <SelectItem value="PART_TIME">Part-time</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                        <SelectItem value="TEMPORARY">Temporary</SelectItem>
                        <SelectItem value="INTERN">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={formData.country || ''}
                        onChange={(e) => updateField('country', e.target.value)}
                        placeholder="e.g., South Korea"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city || ''}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="e.g., Seoul"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compensation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Compensation & Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salaryUSD">Monthly Salary (USD) *</Label>
                      <Input
                        id="salaryUSD"
                        type="number"
                        value={formData.salaryUSD || ''}
                        onChange={(e) => updateField('salaryUSD', parseInt(e.target.value))}
                        placeholder="e.g., 2800"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Original Currency</Label>
                      <Input
                        id="currency"
                        value={formData.currency || 'USD'}
                        onChange={(e) => updateField('currency', e.target.value)}
                        placeholder="e.g., KRW, USD"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="housingProvided"
                        checked={formData.housingProvided || false}
                        onCheckedChange={(checked) => updateField('housingProvided', checked)}
                      />
                      <Label htmlFor="housingProvided">Housing Provided</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="flightProvided"
                        checked={formData.flightProvided || false}
                        onCheckedChange={(checked) => updateField('flightProvided', checked)}
                      />
                      <Label htmlFor="flightProvided">Flight Provided</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits</Label>
                    <Textarea
                      id="benefits"
                      value={formData.benefits || ''}
                      onChange={(e) => updateField('benefits', e.target.value)}
                      placeholder="Health insurance, pension, vacation days..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contract & Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Contract Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contractLength">Contract Length (months)</Label>
                      <Input
                        id="contractLength"
                        type="number"
                        value={formData.contractLength || ''}
                        onChange={(e) => updateField('contractLength', parseInt(e.target.value) || null)}
                        placeholder="e.g., 12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate?.split('T')[0] || ''}
                        onChange={(e) => updateField('startDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Application Deadline</Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={formData.expiresAt?.split('T')[0] || ''}
                      onChange={(e) => updateField('expiresAt', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="minYearsExperience">Minimum Years of Experience</Label>
                    <Input
                      id="minYearsExperience"
                      type="number"
                      value={formData.minYearsExperience || ''}
                      onChange={(e) => updateField('minYearsExperience', parseInt(e.target.value) || null)}
                      placeholder="e.g., 2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="educationRequirements">Education Requirements</Label>
                    <Textarea
                      id="educationRequirements"
                      value={formData.educationRequirements || ''}
                      onChange={(e) => updateField('educationRequirements', e.target.value)}
                      placeholder="e.g., Bachelor's degree or higher"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">General Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements || ''}
                      onChange={(e) => updateField('requirements', e.target.value)}
                      placeholder="List all requirements..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Application */}
              <Card>
                <CardHeader>
                  <CardTitle>Application Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="externalApplicationUrl">External Application URL</Label>
                    <Input
                      id="externalApplicationUrl"
                      type="url"
                      value={formData.externalApplicationUrl || ''}
                      onChange={(e) => updateField('externalApplicationUrl', e.target.value)}
                      placeholder="https://forms.gle/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank to use our platform's application system
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="applicationInstructions">Application Instructions</Label>
                    <Textarea
                      id="applicationInstructions"
                      value={formData.applicationInstructions || ''}
                      onChange={(e) => updateField('applicationInstructions', e.target.value)}
                      placeholder="How to apply, required documents, etc..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex justify-between gap-4">
                <Link href="/recruiter/dashboard">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isPending} size="lg">
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Publish Job
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
