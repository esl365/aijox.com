/**
 * Video Analysis Results Component for Agent 1: AI Screener
 *
 * Displays AI-generated feedback and scores
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Mic,
  Zap,
  Briefcase,
  MonitorPlay,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import type { VideoAnalysis } from '@/lib/ai/video-analyzer';

interface VideoAnalysisResultsProps {
  analysis: VideoAnalysis;
  onRequestReanalysis?: () => Promise<void>;
  canReanalyze?: boolean;
}

export function VideoAnalysisResults({
  analysis,
  onRequestReanalysis,
  canReanalyze = false
}: VideoAnalysisResultsProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Score</CardTitle>
          <CardDescription>
            AI-powered evaluation of your video resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold">
                {analysis.overall_score}
                <span className="text-xl text-muted-foreground">/100</span>
              </span>
              <ScoreBadge score={analysis.overall_score} />
            </div>
            <Progress value={analysis.overall_score} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {analysis.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <div className="grid gap-4 md:grid-cols-2">
        <ScoreCard
          icon={Mic}
          title="Accent & Clarity"
          score={analysis.accent_clarity_score}
          max={10}
          description={`${analysis.accent_type} accent detected`}
        />
        <ScoreCard
          icon={Zap}
          title="Energy & Enthusiasm"
          score={analysis.energy_score}
          max={10}
          description={`${analysis.energy_level} energy level`}
        />
        <ScoreCard
          icon={Briefcase}
          title="Professionalism"
          score={analysis.professionalism_score}
          max={10}
          description={
            analysis.appearance_professional
              ? 'Professional appearance'
              : 'Consider professional attire'
          }
        />
        <ScoreCard
          icon={MonitorPlay}
          title="Technical Quality"
          score={analysis.technical_quality_score}
          max={10}
          description={`${analysis.lighting_quality} lighting, ${analysis.audio_clarity} audio`}
        />
      </div>

      {/* Strengths */}
      {analysis.key_strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.key_strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Improvement Areas */}
      {analysis.improvement_areas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.improvement_areas.map((area, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommended Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended For</CardTitle>
          <CardDescription>
            Based on your presentation, you're a good fit for:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.recommended_for_roles.map((role, i) => (
              <Badge key={i} variant="secondary">
                {role}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Re-record Recommendation */}
      {analysis.overall_score < 70 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Consider re-recording your video.</strong>
            <br />
            Videos scoring below 70 receive significantly fewer views from schools.
            Address the improvement areas above and try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Re-analysis Button */}
      {canReanalyze && onRequestReanalysis && (
        <Button
          variant="outline"
          onClick={onRequestReanalysis}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Request Re-analysis
        </Button>
      )}

      {/* AI Confidence */}
      <p className="text-xs text-muted-foreground text-center">
        AI Confidence: {analysis.confidence_level}%
      </p>
    </div>
  );
}

/**
 * Individual score card component
 */
function ScoreCard({
  icon: Icon,
  title,
  score,
  max,
  description
}: {
  icon: any;
  title: string;
  score: number;
  max: number;
  description: string;
}) {
  const percentage = (score / max) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{score}</span>
          <span className="text-sm text-muted-foreground">/ {max}</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Score badge with color coding
 */
function ScoreBadge({ score }: { score: number }) {
  if (score >= 85) {
    return <Badge className="bg-green-600">Excellent</Badge>;
  }
  if (score >= 75) {
    return <Badge className="bg-blue-600">Great</Badge>;
  }
  if (score >= 60) {
    return <Badge className="bg-amber-600">Good</Badge>;
  }
  return <Badge variant="destructive">Needs Improvement</Badge>;
}
