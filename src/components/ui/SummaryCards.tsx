import { cn, formatCurrency } from '@/lib/utils';
import type { MortgageOutput } from '@/lib/mortgage';

interface SummaryCardsProps {
  output: MortgageOutput;
  className?: string;
}

export function SummaryCards({ output, className }: SummaryCardsProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      <Card title="Monthly Payment" value={formatCurrency(output.totalMonthlyPayment)} highlight />
      <Card title="Total Interest" value={formatCurrency(output.totalInterestPaid)} />
      <Card title="Total Cost" value={formatCurrency(output.totalCost)} />
      <Card 
        title="Payoff Date" 
        value={output.payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} 
      />
    </div>
  );
}

function Card({ title, value, highlight }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn(
      "flex flex-col gap-1 rounded-xl border p-4 shadow-sm transition-all",
      highlight ? "bg-primary text-primary-foreground border-primary" : "bg-card text-card-foreground border-border"
    )}>
      <span className={cn("text-sm font-medium", highlight ? "text-primary-foreground/80" : "text-muted-foreground")}>
        {title}
      </span>
      <span className="text-2xl font-serif font-semibold tracking-tight">{value}</span>
    </div>
  );
}
