'use client';

import { Card } from '@/components/ui/card';

interface FunnelStage {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface ConversionFunnelProps {
  stages: FunnelStage[];
  title?: string;
}

export function ConversionFunnel({ stages, title = 'Application Funnel' }: ConversionFunnelProps) {
  const maxCount = stages[0]?.count || 1;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const width = (stage.count / maxCount) * 100;
          const conversionRate = index > 0 ? stages[index - 1].count > 0
            ? ((stage.count / stages[index - 1].count) * 100).toFixed(1)
            : 0
            : 100;

          return (
            <div key={stage.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{stage.label}</span>
                  {index > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({conversionRate}% from previous)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{stage.count}</span>
                  <span className="text-xs text-muted-foreground">
                    ({stage.percentage}%)
                  </span>
                </div>
              </div>
              <div className="h-12 bg-secondary rounded-lg overflow-hidden relative">
                <div
                  className={`h-full ${stage.color} flex items-center px-4 transition-all duration-500`}
                  style={{ width: `${width}%` }}
                >
                  <span className="text-white font-medium text-sm">
                    {stage.count > 0 && `${stage.count} candidates`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion Rate Summary */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stages.slice(1).map((stage, index) => {
            const prevStage = stages[index];
            const rate = prevStage.count > 0
              ? ((stage.count / prevStage.count) * 100).toFixed(1)
              : 0;

            return (
              <div key={`rate-${stage.label}`} className="text-center">
                <p className="text-2xl font-bold text-primary">{rate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {prevStage.label} → {stage.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
