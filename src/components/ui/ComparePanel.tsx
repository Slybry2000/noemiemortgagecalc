import type { MortgageOutput } from '@/lib/mortgage';
import { formatCurrency } from '@/lib/utils';
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';

interface ComparePanelProps {
  scenarioA: MortgageOutput;
  scenarioB: MortgageOutput;
}

export function ComparePanel({ scenarioA, scenarioB }: ComparePanelProps) {
  const diffMonthly = scenarioB.totalMonthlyPayment - scenarioA.totalMonthlyPayment;
  const diffInterest = scenarioB.totalInterestPaid - scenarioA.totalInterestPaid;
  const diffCost = scenarioB.totalCost - scenarioA.totalCost;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-6 text-xl font-serif font-semibold tracking-tight">Comparison Summary</h3>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <CompareMetric
          label="Monthly Payment"
          valA={scenarioA.totalMonthlyPayment}
          valB={scenarioB.totalMonthlyPayment}
          diff={diffMonthly}
          inverseGood
        />
        <CompareMetric
          label="Total Interest"
          valA={scenarioA.totalInterestPaid}
          valB={scenarioB.totalInterestPaid}
          diff={diffInterest}
          inverseGood
        />
        <CompareMetric
          label="Total Cost"
          valA={scenarioA.totalCost}
          valB={scenarioB.totalCost}
          diff={diffCost}
          inverseGood
        />
      </div>
    </div>
  );
}

function CompareMetric({ label, valA, valB, diff, inverseGood = false }: { label: string; valA: number; valB: number; diff: number; inverseGood?: boolean }) {
  const isPositive = diff > 0;
  const isNeutral = Math.abs(diff) < 1;
  
  let isGood = false;
  if (!isNeutral) {
    isGood = inverseGood ? !isPositive : isPositive;
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-muted/50 p-4">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">{formatCurrency(valA)}</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
        <span className="text-lg font-semibold">{formatCurrency(valB)}</span>
      </div>
      
      {!isNeutral && (
        <div className="mt-2 flex items-center gap-1.5 text-sm font-medium">
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${
              isGood ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? '+' : ''}{formatCurrency(diff)}
          </span>
          <span className="text-muted-foreground text-xs">difference</span>
        </div>
      )}
    </div>
  );
}
