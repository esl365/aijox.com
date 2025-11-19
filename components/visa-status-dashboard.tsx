/**
 * Visa Status Dashboard Component for Agent 3: Rule-based Visa Guard
 *
 * Shows teacher's visa eligibility across different countries
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckCircle2, XCircle, AlertTriangle, Globe, TrendingUp } from 'lucide-react';
import type { VisaCheckResult } from '@/lib/visa/checker';

interface VisaStatusDashboardProps {
  eligible: string[];
  ineligible: Array<{ country: string; reasons: string[] }>;
  totalCountries: number;
  eligibilityPercentage: number;
}

export function VisaStatusDashboard({
  eligible,
  ineligible,
  totalCountries,
  eligibilityPercentage
}: VisaStatusDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Visa Eligibility Overview
          </CardTitle>
          <CardDescription>
            Your eligibility across {totalCountries} countries with active teaching positions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">
                {eligible.length}
                <span className="text-lg text-muted-foreground">/{totalCountries}</span>
              </p>
              <p className="text-sm text-muted-foreground">Countries eligible</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{eligibilityPercentage}%</p>
              <p className="text-sm text-muted-foreground">Eligibility rate</p>
            </div>
          </div>
          <Progress value={eligibilityPercentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Eligible Countries */}
      {eligible.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Eligible Countries ({eligible.length})
            </CardTitle>
            <CardDescription>
              You meet all visa requirements for these countries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {eligible.map((country) => (
                <Badge
                  key={country}
                  variant="outline"
                  className="border-green-600 text-green-700 bg-green-50"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {country}
                </Badge>
              ))}
            </div>
            <Alert className="mt-4 bg-green-50 border-green-200">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Ready to apply!</strong> Browse jobs in these countries and start applying today.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Ineligible Countries */}
      {ineligible.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Not Yet Eligible ({ineligible.length})
            </CardTitle>
            <CardDescription>
              Countries where you don't currently meet visa requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {ineligible.map((item, index) => (
                <AccordionItem key={item.country} value={`item-${index}`}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>{item.country}</span>
                      <Badge variant="destructive" className="ml-2">
                        {item.reasons.length} requirement{item.reasons.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-6">
                      <p className="text-sm font-medium">Missing requirements:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {item.reasons.map((reason, i) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Tip:</strong> Update your profile as you obtain certifications or gain
                experience. We'll automatically update your eligibility.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <p className="text-xs text-center text-muted-foreground">
        Visa requirements updated as of January 2025. Always verify with official sources.
      </p>
    </div>
  );
}

/**
 * Country-specific visa status component
 */
export function CountryVisaStatus({
  country,
  result
}: {
  country: string;
  result: VisaCheckResult;
}) {
  if (result.eligible) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>✅ Eligible for {result.visaType} visa</strong>
          <br />
          You meet all requirements for {country}.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Not eligible for {country}</strong>
          <br />
          You don't meet the requirements for a {result.visaType} visa.
        </AlertDescription>
      </Alert>

      {result.failedRequirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Missing Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.failedRequirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`
                    inline-block w-2 h-2 rounded-full mt-2
                    ${req.priority === 'CRITICAL' ? 'bg-red-500' :
                      req.priority === 'HIGH' ? 'bg-orange-500' :
                      'bg-yellow-500'}
                  `} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{req.message}</p>
                    <p className="text-xs text-muted-foreground">
                      Priority: {req.priority}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {result.disqualifications.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-600">Disqualifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {result.disqualifications.map((disq, i) => (
                <li key={i} className="text-sm text-red-600">
                  • {disq}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {result.additionalNotes && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Additional Notes:</strong>
            <br />
            {result.additionalNotes}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
