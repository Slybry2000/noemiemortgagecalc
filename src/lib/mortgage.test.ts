import { describe, it, expect } from 'vitest';
import { calculateMortgage, estimatePMI } from './mortgage';

describe('Mortgage Calculator Math Model', () => {
  const baseInput = {
    homePrice: 300000,
    downPayment: 60000, // 20%
    interestRate: 6.5,
    termYears: 30,
    propertyTax: 3600, // $300/mo
    homeInsurance: 1200, // $100/mo
    hoa: 0,
    pmi: 0,
    startDate: new Date('2026-01-01'),
  };

  it('calculates basic mortgage correctly', () => {
    const result = calculateMortgage(baseInput);
    expect(result.loanAmount).toBe(240000);
    expect(result.monthlyPrincipalAndInterest).toBeCloseTo(1516.96, 1);
    expect(result.monthlyPropertyTax).toBe(300);
    expect(result.monthlyHomeInsurance).toBe(100);
    expect(result.totalMonthlyPayment).toBeCloseTo(1916.96, 1);
    expect(result.amortizationSchedule.length).toBe(360);
  });

  it('handles 0% interest rate', () => {
    const result = calculateMortgage({ ...baseInput, interestRate: 0 });
    expect(result.monthlyPrincipalAndInterest).toBeCloseTo(240000 / 360, 2);
    expect(result.totalInterestPaid).toBe(0);
  });

  it('handles huge down payment (100%)', () => {
    const result = calculateMortgage({ ...baseInput, downPayment: 300000 });
    expect(result.loanAmount).toBe(0);
    expect(result.monthlyPrincipalAndInterest).toBe(0);
    expect(result.totalMonthlyPayment).toBe(400); // Tax + Insurance
    expect(result.amortizationSchedule.length).toBe(0);
  });

  it('handles high HOA', () => {
    const result = calculateMortgage({ ...baseInput, hoa: 1000 });
    expect(result.totalMonthlyPayment).toBeCloseTo(2916.96, 1);
  });

  it('estimates PMI correctly', () => {
    expect(estimatePMI(240000, 300000)).toBe(0); // 80% LTV
    expect(estimatePMI(270000, 300000)).toBeCloseTo(112.5, 1); // 90% LTV
  });

  it('handles extra monthly payments', () => {
    const result = calculateMortgage({ ...baseInput, extraMonthlyPayment: 500 });
    expect(result.amortizationSchedule.length).toBeLessThan(360);
    expect(result.interestSaved).toBeGreaterThan(0);
    expect(result.timeSavedMonths).toBeGreaterThan(0);
  });

  it('handles extra yearly payments', () => {
    const result = calculateMortgage({ ...baseInput, extraYearlyPayment: 5000 });
    expect(result.amortizationSchedule.length).toBeLessThan(360);
    expect(result.interestSaved).toBeGreaterThan(0);
  });

  it('handles one-time payments', () => {
    const result = calculateMortgage({
      ...baseInput,
      oneTimePayments: [{ date: new Date('2026-06-01'), amount: 10000 }],
    });
    expect(result.amortizationSchedule.length).toBeLessThan(360);
    expect(result.interestSaved).toBeGreaterThan(0);
  });

  it('handles short term (15 years)', () => {
    const result = calculateMortgage({ ...baseInput, termYears: 15 });
    expect(result.amortizationSchedule.length).toBe(180);
    expect(result.monthlyPrincipalAndInterest).toBeGreaterThan(1516.96);
  });

  it('calculates payoff date correctly', () => {
    const result = calculateMortgage(baseInput);
    const lastPayment = result.amortizationSchedule[result.amortizationSchedule.length - 1];
    expect(lastPayment.date.getFullYear()).toBe(2055);
    expect(lastPayment.date.getMonth()).toBe(11); // December
  });

  it('handles overpaying on the last month', () => {
    const result = calculateMortgage({ ...baseInput, extraMonthlyPayment: 10000 });
    const lastPayment = result.amortizationSchedule[result.amortizationSchedule.length - 1];
    expect(lastPayment.balance).toBeCloseTo(0, 2);
    expect(lastPayment.totalPayment).toBeLessThanOrEqual(10000 + result.monthlyPrincipalAndInterest);
  });
});
