import { useState, useEffect } from 'react';
import type { MortgageInput } from '@/lib/mortgage';

const defaultInput: MortgageInput = {
  homePrice: 400000,
  downPayment: 80000,
  interestRate: 6.5,
  termYears: 30,
  propertyTax: 4800,
  homeInsurance: 1200,
  hoa: 0,
  pmi: 0,
  startDate: new Date(),
  extraMonthlyPayment: 0,
  extraYearlyPayment: 0,
  oneTimePayments: [],
};

export function useMortgageState(key: string) {
  const [input, setInput] = useState<MortgageInput>(() => {
    // Check URL params first
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('price') || params.has('down') || params.has('rate')) {
        return {
          ...defaultInput,
          homePrice: Number(params.get('price')) || defaultInput.homePrice,
          downPayment: Number(params.get('down')) || defaultInput.downPayment,
          interestRate: Number(params.get('rate')) || defaultInput.interestRate,
          termYears: Number(params.get('term')) || defaultInput.termYears,
          propertyTax: Number(params.get('tax')) || defaultInput.propertyTax,
          hoa: Number(params.get('hoa')) || defaultInput.hoa,
        };
      }
    }

    const saved = localStorage.getItem(`mortgage-state-${key}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultInput,
          ...parsed,
          startDate: parsed.startDate ? new Date(parsed.startDate) : new Date(),
          oneTimePayments: parsed.oneTimePayments?.map((p: { amount: number; date: string }) => ({
            ...p,
            date: new Date(p.date),
          })) || [],
        };
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    return defaultInput;
  });

  useEffect(() => {
    localStorage.setItem(`mortgage-state-${key}`, JSON.stringify(input));
  }, [input, key]);

  const updateInput = (updates: Partial<MortgageInput>) => {
    setInput((prev) => ({ ...prev, ...updates }));
  };

  const applyPreset = (preset: Partial<MortgageInput>) => {
    setInput((prev) => ({ ...prev, ...preset }));
  };

  return { input, updateInput, applyPreset };
}
