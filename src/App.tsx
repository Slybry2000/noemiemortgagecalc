import React, { useState, useMemo } from "react";
import { useMortgageState } from "@/hooks/useMortgageState";
import { calculateMortgage, estimatePMI } from "@/lib/mortgage";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { PercentInput } from "@/components/ui/PercentInput";
import { Toggle } from "@/components/ui/Toggle";
import { Tabs } from "@/components/ui/Tabs";
import { SummaryCards } from "@/components/ui/SummaryCards";
import { AmortizationTable } from "@/components/ui/AmortizationTable";
import { Chart } from "@/components/ui/Chart";
import { LeadCapture } from "@/components/ui/LeadCapture";
import { ComparePanel } from "@/components/ui/ComparePanel";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Settings2, Copy, Check } from "lucide-react";

import { SignatureMotif } from "@/components/ui/SignatureMotif";

export default function App() {
  const [mode, setMode] = useState<"single" | "compare">("single");
  const [activeTab, setActiveTab] = useState<"chart" | "schedule">("chart");
  const [copied, setCopied] = useState(false);

  const { input: inputA, updateInput: updateA, applyPreset: applyPresetA } = useMortgageState("A");
  const { input: inputB, updateInput: updateB } = useMortgageState("B");

  const [downPaymentMode, setDownPaymentMode] = useState<"$" | "%">("%");
  const [taxMode, setTaxMode] = useState<"$" | "%">("%");
  const [autoPMI, setAutoPMI] = useState(true);

  const outputA = useMemo(() => calculateMortgage(inputA), [inputA]);
  const outputB = useMemo(() => calculateMortgage(inputB), [inputB]);

  const handleCopySummary = () => {
    const summary = `Mortgage Estimate Summary:
Home Price: $${inputA.homePrice.toLocaleString()}
Down Payment: $${inputA.downPayment.toLocaleString()}
Loan Amount: $${outputA.loanAmount.toLocaleString()}
Interest Rate: ${inputA.interestRate}%
Term: ${inputA.termYears} Years

Monthly Payment: $${outputA.totalMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
Total Cost: $${outputA.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownPaymentChange = (val: number, isPercent: boolean) => {
    if (isPercent) {
      updateA({ downPayment: (inputA.homePrice * val) / 100 });
    } else {
      updateA({ downPayment: val });
    }
  };

  const handleTaxChange = (val: number, isPercent: boolean) => {
    if (isPercent) {
      updateA({ propertyTax: (inputA.homePrice * val) / 100 });
    } else {
      updateA({ propertyTax: val });
    }
  };

  React.useEffect(() => {
    if (autoPMI) {
      const estimated = estimatePMI(outputA.loanAmount, inputA.homePrice);
      if (estimated !== inputA.pmi) {
        updateA({ pmi: estimated });
      }
    }
  }, [autoPMI, outputA.loanAmount, inputA.homePrice, inputA.pmi, updateA]);

  const presets = [
    { label: "First-time buyer", values: { downPayment: inputA.homePrice * 0.03, termYears: 30 } },
    { label: "15-year payoff", values: { termYears: 15 } },
    { label: "Higher-rate stress test", values: { interestRate: inputA.interestRate + 2 } },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold tracking-tight">Noémie Piard</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mortgage Calculator</p>
                <SignatureMotif className="h-3 w-12 text-accent" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Toggle
              options={[
                { label: "Single", value: "single" },
                { label: "Compare", value: "compare" },
              ]}
              value={mode}
              onChange={(v) => setMode(v as "single" | "compare")}
              className="hidden sm:flex"
              aria-label="Toggle comparison mode"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-2 text-lg font-serif font-semibold">
                  <Settings2 className="h-5 w-5 text-muted-foreground" />
                  Loan Details
                </h2>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => applyPresetA(preset.values)}
                      className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-5">
                <MoneyInput
                  label="Home Price"
                  value={inputA.homePrice}
                  onChange={(v) => updateA({ homePrice: v })}
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground/80">Down Payment</label>
                    <Toggle
                      options={[{ label: "$", value: "$" }, { label: "%", value: "%" }]}
                      value={downPaymentMode}
                      onChange={(v) => setDownPaymentMode(v as "$" | "%")}
                      className="scale-90 origin-right"
                      aria-label="Down payment input mode"
                    />
                  </div>
                  {downPaymentMode === "$" ? (
                    <MoneyInput
                      label=""
                      value={inputA.downPayment}
                      onChange={(v) => handleDownPaymentChange(v, false)}
                    />
                  ) : (
                    <PercentInput
                      label=""
                      value={(inputA.downPayment / inputA.homePrice) * 100 || 0}
                      onChange={(v) => handleDownPaymentChange(v, true)}
                    />
                  )}
                  <div className="text-xs text-muted-foreground text-right">
                    Loan Amount: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(outputA.loanAmount)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <PercentInput
                    label="Interest Rate"
                    value={inputA.interestRate}
                    onChange={(v) => updateA({ interestRate: v })}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="term-years" className="text-sm font-medium text-foreground/80">Term (Years)</label>
                    <select
                      id="term-years"
                      value={inputA.termYears}
                      onChange={(e) => updateA({ termYears: Number(e.target.value) })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value={15}>15 Years</option>
                      <option value={20}>20 Years</option>
                      <option value={30}>30 Years</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-serif font-semibold">Taxes & Insurance</h2>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground/80">Property Tax (Yearly)</label>
                    <Toggle
                      options={[{ label: "$", value: "$" }, { label: "%", value: "%" }]}
                      value={taxMode}
                      onChange={(v) => setTaxMode(v as "$" | "%")}
                      className="scale-90 origin-right"
                      aria-label="Property tax input mode"
                    />
                  </div>
                  {taxMode === "$" ? (
                    <MoneyInput
                      label=""
                      value={inputA.propertyTax}
                      onChange={(v) => handleTaxChange(v, false)}
                    />
                  ) : (
                    <PercentInput
                      label=""
                      value={(inputA.propertyTax / inputA.homePrice) * 100 || 0}
                      onChange={(v) => handleTaxChange(v, true)}
                    />
                  )}
                </div>

                <MoneyInput
                  label="Home Insurance (Yearly)"
                  value={inputA.homeInsurance}
                  onChange={(v) => updateA({ homeInsurance: v })}
                />

                <MoneyInput
                  label="HOA Fees (Monthly)"
                  value={inputA.hoa}
                  onChange={(v) => updateA({ hoa: v })}
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground/80">PMI (Monthly)</label>
                    <div className="flex items-center gap-2">
                      <label htmlFor="auto-pmi" className="text-xs text-muted-foreground">Auto</label>
                      <input
                        id="auto-pmi"
                        type="checkbox"
                        checked={autoPMI}
                        onChange={(e) => setAutoPMI(e.target.checked)}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                  <MoneyInput
                    label=""
                    value={inputA.pmi}
                    onChange={(v) => {
                      setAutoPMI(false);
                      updateA({ pmi: v });
                    }}
                    disabled={autoPMI}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-serif font-semibold">Extra Payments</h2>
              <div className="space-y-5">
                <MoneyInput
                  label="Extra Monthly Payment"
                  value={inputA.extraMonthlyPayment || 0}
                  onChange={(v) => updateA({ extraMonthlyPayment: v })}
                />
                <MoneyInput
                  label="Extra Yearly Payment"
                  value={inputA.extraYearlyPayment || 0}
                  onChange={(v) => updateA({ extraYearlyPayment: v })}
                />
                {outputA.interestSaved > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-xl bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  >
                    <p className="font-medium">You will save:</p>
                    <ul className="mt-1 list-inside list-disc space-y-1 pl-2">
                      <li>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(outputA.interestSaved)} in interest</li>
                      <li>{Math.floor(outputA.timeSavedMonths / 12)} years and {outputA.timeSavedMonths % 12} months of payments</li>
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-semibold">Estimate Summary</h2>
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Summary"}
              </button>
            </div>
            <SummaryCards output={outputA} />

            {mode === "compare" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-serif font-semibold">Scenario B</h2>
                  <button
                    onClick={() => updateB(inputA)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Copy from A
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <MoneyInput
                    label="Home Price"
                    value={inputB.homePrice}
                    onChange={(v) => updateB({ homePrice: v })}
                  />
                  <MoneyInput
                    label="Down Payment"
                    value={inputB.downPayment}
                    onChange={(v) => updateB({ downPayment: v })}
                  />
                  <PercentInput
                    label="Interest Rate"
                    value={inputB.interestRate}
                    onChange={(v) => updateB({ interestRate: v })}
                  />
                </div>
                <ComparePanel scenarioA={outputA} scenarioB={outputB} />
              </motion.div>
            )}

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Tabs
                tabs={[
                  { id: "chart", label: "Chart" },
                  { id: "schedule", label: "Schedule" },
                ]}
                activeTab={activeTab}
                onChange={(id) => setActiveTab(id as "chart" | "schedule")}
              />
              <div className="mt-6">
                <AnimatePresence mode="wait">
                  {activeTab === "chart" ? (
                    <motion.div
                      key="chart"
                      role="tabpanel"
                      id="panel-chart"
                      aria-labelledby="tab-chart"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Chart schedule={outputA.amortizationSchedule} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="schedule"
                      role="tabpanel"
                      id="panel-schedule"
                      aria-labelledby="tab-schedule"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AmortizationTable schedule={outputA.amortizationSchedule} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <LeadCapture />
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-muted/30 py-8 text-center text-sm text-muted-foreground">
        <p className="mx-auto max-w-2xl px-4">
          Estimates only; taxes, insurance, and PMI vary. Please confirm with your lender.
          This tool does not constitute financial advice.
        </p>
        <p className="mt-2"> {new Date().getFullYear()} Piard Properties. All rights reserved.</p>
      </footer>
    </div>
  );
}
