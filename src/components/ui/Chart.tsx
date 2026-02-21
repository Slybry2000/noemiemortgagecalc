import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AmortizationRow } from '@/lib/mortgage';
import { formatCurrency } from '@/lib/utils';

interface ChartProps {
  schedule: AmortizationRow[];
}

export function Chart({ schedule }: ChartProps) {
  const data = useMemo(() => {
    const yearly: { year: number; balance: number; totalInterest: number; totalPrincipal: number }[] = [];
    let currentYear = schedule[0]?.date.getFullYear();
    let yearData: { year: number; balance: number; totalInterest: number; totalPrincipal: number } | null = null;

    for (const row of schedule) {
      if (row.date.getFullYear() !== currentYear || !yearData) {
        if (yearData) yearly.push(yearData);
        currentYear = row.date.getFullYear();
        yearData = {
          year: currentYear,
          balance: row.balance,
          totalInterest: row.totalInterestPaid,
          totalPrincipal: row.totalPrincipalPaid,
        };
      }
      yearData.balance = row.balance;
      yearData.totalInterest = row.totalInterestPaid;
      yearData.totalPrincipal = row.totalPrincipalPaid;
    }
    if (yearData) yearly.push(yearData);

    return yearly;
  }, [schedule]);

  if (!data.length) return null;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-serif font-semibold" id="chart-title">Balance Over Time</h3>
      <div 
        className="h-[300px] w-full rounded-xl border border-border bg-card p-4 shadow-sm"
        role="img"
        aria-labelledby="chart-title"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-brand-500)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-brand-500)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent-500)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-accent-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              width={60}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-border bg-popover p-3 shadow-md">
                      <p className="mb-2 font-medium text-popover-foreground">{label}</p>
                      {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4 text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            {entry.name === 'balance' ? 'Balance' : 'Total Interest'}
                          </span>
                          <span className="font-medium text-popover-foreground">
                            {formatCurrency(entry.value as number)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="var(--color-brand-500)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBalance)"
            />
            <Area
              type="monotone"
              dataKey="totalInterest"
              stroke="var(--color-accent-500)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorInterest)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
