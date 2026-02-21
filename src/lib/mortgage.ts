export interface MortgageInput {
  homePrice: number;
  downPayment: number; // in dollars
  interestRate: number; // annual percentage rate (e.g., 6.5 for 6.5%)
  termYears: number;
  propertyTax: number; // yearly in dollars
  homeInsurance: number; // yearly in dollars
  hoa: number; // monthly in dollars
  pmi: number; // monthly in dollars
  startDate: Date;
  extraMonthlyPayment?: number;
  extraYearlyPayment?: number;
  oneTimePayments?: { date: Date; amount: number }[];
}

export interface AmortizationRow {
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  totalPayment: number;
  balance: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
}

export interface MortgageOutput {
  loanAmount: number;
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyHomeInsurance: number;
  monthlyHOA: number;
  monthlyPMI: number;
  totalMonthlyPayment: number;
  totalInterestPaid: number;
  totalCost: number;
  payoffDate: Date;
  amortizationSchedule: AmortizationRow[];
  interestSaved: number;
  timeSavedMonths: number;
}

export function calculateMortgage(input: MortgageInput): MortgageOutput {
  const {
    homePrice,
    downPayment,
    interestRate,
    termYears,
    propertyTax,
    homeInsurance,
    hoa,
    pmi,
    startDate,
    extraMonthlyPayment = 0,
    extraYearlyPayment = 0,
    oneTimePayments = [],
  } = input;

  const loanAmount = Math.max(0, homePrice - downPayment);
  const monthlyInterestRate = interestRate / 100 / 12;
  const totalPayments = termYears * 12;

  let monthlyPrincipalAndInterest = 0;
  if (loanAmount > 0) {
    if (monthlyInterestRate > 0) {
      monthlyPrincipalAndInterest =
        (loanAmount *
          (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments))) /
        (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
    } else {
      monthlyPrincipalAndInterest = loanAmount / totalPayments;
    }
  }

  const monthlyPropertyTax = propertyTax / 12;
  const monthlyHomeInsurance = homeInsurance / 12;
  const monthlyHOA = hoa;
  const monthlyPMI = pmi;

  const baseMonthlyPayment =
    monthlyPrincipalAndInterest +
    monthlyPropertyTax +
    monthlyHomeInsurance +
    monthlyHOA +
    monthlyPMI;

  // Calculate Amortization Schedule
  const amortizationSchedule: AmortizationRow[] = [];
  let balance = loanAmount;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;
  const currentDate = new Date(startDate);
  let monthCount = 0;

  // For calculating savings
  let baseTotalInterest = 0;
  let baseBalance = loanAmount;
  let baseMonthCount = 0;

  // Calculate base scenario (no extra payments) to find savings
  if (loanAmount > 0) {
    while (baseBalance > 0.01 && baseMonthCount < totalPayments) {
      const interest = baseBalance * monthlyInterestRate;
      let principal = monthlyPrincipalAndInterest - interest;
      if (baseBalance < principal) {
        principal = baseBalance;
      }
      baseBalance -= principal;
      baseTotalInterest += interest;
      baseMonthCount++;
    }
  }

  while (balance > 0.01 && monthCount < totalPayments * 2) { // safety limit
    const interest = balance * monthlyInterestRate;
    let principal = monthlyPrincipalAndInterest - interest;
    
    let extraPayment = extraMonthlyPayment;
    
    // Add yearly extra payment
    if (monthCount > 0 && monthCount % 12 === 0) {
      extraPayment += extraYearlyPayment;
    }

    // Add one-time payments
    const currentMonthYear = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    const oneTimeForMonth = oneTimePayments
      .filter(
        (p) =>
          `${p.date.getFullYear()}-${p.date.getMonth()}` === currentMonthYear
      )
      .reduce((sum, p) => sum + p.amount, 0);
    
    extraPayment += oneTimeForMonth;

    if (balance < principal + extraPayment) {
      extraPayment = balance - principal;
      if (extraPayment < 0) {
        principal = balance;
        extraPayment = 0;
      }
    }

    const totalPrincipalThisMonth = principal + extraPayment;
    balance -= totalPrincipalThisMonth;
    totalInterestPaid += interest;
    totalPrincipalPaid += totalPrincipalThisMonth;

    amortizationSchedule.push({
      date: new Date(currentDate),
      payment: monthlyPrincipalAndInterest,
      principal,
      interest,
      extraPayment,
      totalPayment: monthlyPrincipalAndInterest + extraPayment,
      balance: Math.max(0, balance),
      totalInterestPaid,
      totalPrincipalPaid,
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
    monthCount++;
  }

  const payoffDate = amortizationSchedule.length > 0 
    ? amortizationSchedule[amortizationSchedule.length - 1].date 
    : startDate;

  const totalCost =
    downPayment +
    totalPrincipalPaid +
    totalInterestPaid +
    (monthlyPropertyTax + monthlyHomeInsurance + monthlyHOA + monthlyPMI) * monthCount;

  const interestSaved = Math.max(0, baseTotalInterest - totalInterestPaid);
  const timeSavedMonths = Math.max(0, baseMonthCount - monthCount);

  return {
    loanAmount,
    monthlyPrincipalAndInterest,
    monthlyPropertyTax,
    monthlyHomeInsurance,
    monthlyHOA,
    monthlyPMI,
    totalMonthlyPayment: baseMonthlyPayment,
    totalInterestPaid,
    totalCost,
    payoffDate,
    amortizationSchedule,
    interestSaved,
    timeSavedMonths,
  };
}

export function estimatePMI(loanAmount: number, homePrice: number): number {
  if (homePrice === 0) return 0;
  const ltv = loanAmount / homePrice;
  if (ltv > 0.8) {
    // Rough estimate: 0.5% to 1% of loan amount annually
    return (loanAmount * 0.005) / 12;
  }
  return 0;
}
