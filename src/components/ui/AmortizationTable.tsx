import React, { useState } from 'react';
import type { AmortizationRow } from '@/lib/mortgage';
import { formatCurrency } from '@/lib/utils';
import { Toggle } from './Toggle';

interface AmortizationTableProps {
  schedule: AmortizationRow[];
}

export function AmortizationTable({ schedule }: AmortizationTableProps) {
  const [view, setView] = useState<'monthly' | 'yearly'>('yearly');

  const displayData = React.useMemo(() => {
    if (view === 'monthly') return schedule;

    const yearly: AmortizationRow[] = [];
    let currentYear = schedule[0]?.date.getFullYear();
    let yearData: AmortizationRow | null = null;

    for (const row of schedule) {
      if (row.date.getFullYear() !== currentYear || !yearData) {
        if (yearData) yearly.push(yearData);
        currentYear = row.date.getFullYear();
        yearData = { ...row, payment: 0, principal: 0, interest: 0, extraPayment: 0, totalPayment: 0 };
      }
      yearData.payment += row.payment;
      yearData.principal += row.principal;
      yearData.interest += row.interest;
      yearData.extraPayment += row.extraPayment;
      yearData.totalPayment += row.totalPayment;
      yearData.balance = row.balance;
      yearData.totalInterestPaid = row.totalInterestPaid;
      yearData.totalPrincipalPaid = row.totalPrincipalPaid;
      yearData.date = row.date; // Keep the last month's date for the year
    }
    if (yearData) yearly.push(yearData);

    return yearly;
  }, [schedule, view]);

  if (!schedule.length) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-semibold" id="amortization-title">Amortization Schedule</h3>
        <Toggle
          options={[
            { label: 'Yearly', value: 'yearly' },
            { label: 'Monthly', value: 'monthly' },
          ]}
          value={view}
          onChange={(v) => setView(v as 'monthly' | 'yearly')}
          className="w-48"
          aria-label="Toggle view"
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm" aria-labelledby="amortization-title">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Payment</th>
              <th className="px-4 py-3 font-medium text-right">Principal</th>
              <th className="px-4 py-3 font-medium text-right">Interest</th>
              <th className="px-4 py-3 font-medium text-right">Total Interest</th>
              <th className="px-4 py-3 font-medium text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayData.map((row, i) => (
              <tr key={i} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  {view === 'yearly'
                    ? row.date.getFullYear()
                    : row.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.totalPayment)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.principal + row.extraPayment)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.interest)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.totalInterestPaid)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
