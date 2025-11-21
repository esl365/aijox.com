import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Clock, Target, BarChart3, ArrowLeft } from 'lucide-react';
import { getAnalyticsPredictions, getAnalyticsSummary } from '@/app/actions/analytics';

export const metadata: Metadata = {
  title: 'Predictive Analytics',
  description: 'AI-powered hiring predictions and insights',
};

export default async function PredictiveAnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/school/analytics');
  }

  if (session.user.role !== 'SCHOOL' && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [predictionsResult, summaryResult] = await Promise.all([
    getAnalyticsPredictions(),
    getAnalyticsSummary(),
  ]);

  const predictions = predictionsResult.success ? predictionsResult.predictions : [];
  const summary = summaryResult.success ? summaryResult.summary : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/school/dashboard">
              <Button variant="ghost" size="sm" className="mb-2 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-2">Predictive Analytics</h1>
            <p className="text-muted-foreground">AI-powered insights to optimize your hiring process</p>
          </div>
        </div>

        {summary && summary.totalPredictions > 0 && (
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Time to Hire</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.timeToHire ? Math.round(summary.timeToHire.predictionValue) : '—'} days
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.timeToHire
                    ? `${Math.round(summary.timeToHire.confidence * 100)}% confidence`
                    : 'No data yet'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.acceptanceProbability
                    ? Math.round(summary.acceptanceProbability.predictionValue)
                    : '—'}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.acceptanceProbability
                    ? 'Expected offer acceptance'
                    : 'No data yet'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.engagementScore
                    ? Math.round(summary.engagementScore.predictionValue)
                    : '—'}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.engagementScore
                    ? 'Candidate engagement level'
                    : 'No data yet'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalPredictions}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active predictions
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Active Predictions</CardTitle>
            <CardDescription>
              AI-generated predictions for your hiring metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {predictions.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No predictions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Predictions will appear as you collect more hiring data
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {predictions.map((prediction) => (
                  <div
                    key={prediction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {prediction.predictionType.replace(/_/g, ' ')}
                        </h3>
                        {prediction.job && (
                          <span className="text-sm text-muted-foreground">
                            • {prediction.job.title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Value:</span>
                          <span className="font-semibold">
                            {prediction.predictionType === 'TIME_TO_HIRE'
                              ? `${prediction.predictionValue} days`
                              : `${prediction.predictionValue}%`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="font-semibold">
                            {(prediction.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Valid until:</span>
                          <span className="text-xs">
                            {new Date(prediction.validUntil).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {prediction.confidence >= 0.7 ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">How Predictive Analytics Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>
              Our AI analyzes your historical hiring data to generate predictions:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>Time to Hire:</strong> Predicts how long it takes to fill a position based on past hires
              </li>
              <li>
                <strong>Acceptance Probability:</strong> Estimates likelihood of candidates accepting your offers
              </li>
              <li>
                <strong>Engagement Score:</strong> Measures candidate interest and interaction levels
              </li>
            </ul>
            <p className="pt-2">
              Prediction confidence increases as you collect more data. Higher confidence means more accurate predictions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
