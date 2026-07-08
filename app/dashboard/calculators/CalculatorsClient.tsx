"use client";

import { useState } from "react";

type CalculatorType = "TAX" | "GST" | "EMI";

export default function CalculatorsClient() {
  const [activeTab, setActiveTab] = useState<CalculatorType>("TAX");

  // Tax State
  const [income, setIncome] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [taxResult, setTaxResult] = useState<{old: number, new: number} | null>(null);

  // GST State
  const [gstType, setGstType] = useState<"NIL" | "REGULAR">("REGULAR");
  const [daysLate, setDaysLate] = useState<number>(0);
  const [gstLateFee, setGstLateFee] = useState<number | null>(null);

  // EMI State
  const [principal, setPrincipal] = useState<number>(1000000);
  const [rate, setRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(10);
  const [emiResult, setEmiResult] = useState<number | null>(null);

  const calculateTax = (e: React.FormEvent) => {
    e.preventDefault();
    // Simplified India Tax Calculation (Budget 2023-24 approximations)
    
    // Old Regime
    const taxableOld = Math.max(0, income - deductions);
    let oldTax = 0;
    if (taxableOld > 1000000) oldTax = 112500 + 0.3 * (taxableOld - 1000000);
    else if (taxableOld > 500000) oldTax = 12500 + 0.2 * (taxableOld - 500000);
    else if (taxableOld > 250000) oldTax = 0.05 * (taxableOld - 250000);
    // Rebate 87A for Old Regime
    if (taxableOld <= 500000) oldTax = 0;

    // New Regime
    let newTax = 0;
    const taxableNew = income; // no deductions
    if (taxableNew > 1500000) newTax = 150000 + 0.3 * (taxableNew - 1500000);
    else if (taxableNew > 1200000) newTax = 90000 + 0.2 * (taxableNew - 1200000);
    else if (taxableNew > 900000) newTax = 45000 + 0.15 * (taxableNew - 900000);
    else if (taxableNew > 600000) newTax = 15000 + 0.1 * (taxableNew - 600000);
    else if (taxableNew > 300000) newTax = 0.05 * (taxableNew - 300000);
    // Rebate 87A for New Regime (up to 7L)
    if (taxableNew <= 700000) newTax = 0;

    // Add 4% Cess
    setTaxResult({
      old: Math.round(oldTax * 1.04),
      new: Math.round(newTax * 1.04)
    });
  };

  const calculateGST = (e: React.FormEvent) => {
    e.preventDefault();
    if (daysLate <= 0) {
      setGstLateFee(0);
      return;
    }
    const perDay = gstType === "NIL" ? 20 : 50; // 20 for nil, 50 for regular
    let fee = daysLate * perDay;
    // Cap at 5000
    if (fee > 5000) fee = 5000;
    setGstLateFee(fee);
  };

  const calculateEMI = (e: React.FormEvent) => {
    e.preventDefault();
    const r = (rate / 12) / 100; // monthly interest
    const n = tenure * 12; // months
    if (r === 0) {
      setEmiResult(principal / n);
      return;
    }
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEmiResult(Math.round(emi));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display-lg text-display-lg text-primary">CA Calculators</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Quick calculators for Tax, GST late fees, and Loans.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab("TAX")}
          className={`px-6 py-3 font-title-sm text-title-sm border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab === "TAX" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"}`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">account_balance</span>
            Income Tax (Old vs New)
          </div>
        </button>
        <button 
          onClick={() => setActiveTab("GST")}
          className={`px-6 py-3 font-title-sm text-title-sm border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${activeTab === "GST" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"}`}
        >
          <span className="material-symbols-outlined text-sm">receipt_long</span>
          GST Late Fee
        </button>
        <button 
          onClick={() => setActiveTab("EMI")}
          className={`px-6 py-3 font-title-sm text-title-sm border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${activeTab === "EMI" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"}`}
        >
          <span className="material-symbols-outlined text-sm">real_estate_agent</span>
          Loan / EMI
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TAX CALCULATOR */}
        {activeTab === "TAX" && (
          <>
            <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
              <h2 className="font-title-lg text-title-lg text-primary mb-6">Income Details</h2>
              <form onSubmit={calculateTax} className="flex flex-col gap-6">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Total Gross Income (INR)</label>
                  <input type="number" value={income || ""} onChange={(e) => setIncome(Number(e.target.value))} required className="w-full px-4 py-3 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg" placeholder="1200000" />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Total Deductions (80C, HRA, etc.)</label>
                  <input type="number" value={deductions || ""} onChange={(e) => setDeductions(Number(e.target.value))} className="w-full px-4 py-3 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg" placeholder="150000" />
                  <p className="text-xs text-on-surface-variant mt-2">* Deductions are only applied to the Old Regime.</p>
                </div>
                <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">Calculate Tax</button>
              </form>
            </div>
            
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <h2 className="font-title-lg text-title-lg text-primary mb-6">Tax Comparison</h2>
              {taxResult ? (
                <div className="flex flex-col gap-4">
                  <div className={`p-6 rounded-xl border ${taxResult.old < taxResult.new ? "bg-emerald-50 border-emerald-200" : "bg-white border-outline-variant"}`}>
                    <h3 className="font-label-lg text-on-surface-variant mb-1">Old Regime Tax</h3>
                    <p className={`font-display-md text-display-md ${taxResult.old < taxResult.new ? "text-emerald-700" : "text-primary"}`}>{formatCurrency(taxResult.old)}</p>
                    {taxResult.old < taxResult.new && <span className="inline-block mt-2 bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded font-bold">Recommended</span>}
                  </div>
                  <div className={`p-6 rounded-xl border ${taxResult.new <= taxResult.old ? "bg-emerald-50 border-emerald-200" : "bg-white border-outline-variant"}`}>
                    <h3 className="font-label-lg text-on-surface-variant mb-1">New Regime Tax</h3>
                    <p className={`font-display-md text-display-md ${taxResult.new <= taxResult.old ? "text-emerald-700" : "text-primary"}`}>{formatCurrency(taxResult.new)}</p>
                    {taxResult.new <= taxResult.old && <span className="inline-block mt-2 bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded font-bold">Recommended</span>}
                  </div>
                </div>
              ) : (
                <div className="min-h-[200px] flex items-center justify-center text-on-surface-variant text-center px-8 border-2 border-dashed border-outline-variant rounded-xl">
                  Enter income and deductions to compare tax liability between the Old and New tax regimes.
                </div>
              )}
            </div>
          </>
        )}

        {/* GST CALCULATOR */}
        {activeTab === "GST" && (
          <>
            <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
              <h2 className="font-title-lg text-title-lg text-primary mb-6">Return Details</h2>
              <form onSubmit={calculateGST} className="flex flex-col gap-6">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Type of Return</label>
                  <select value={gstType} onChange={(e) => setGstType(e.target.value as any)} className="w-full px-4 py-3 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-lg">
                    <option value="REGULAR">Regular Return (₹50/day)</option>
                    <option value="NIL">Nil Return (₹20/day)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Number of Days Late</label>
                  <input type="number" min="0" value={daysLate || ""} onChange={(e) => setDaysLate(Number(e.target.value))} required className="w-full px-4 py-3 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg" placeholder="10" />
                </div>
                <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">Calculate Late Fee</button>
              </form>
            </div>
            
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <h2 className="font-title-lg text-title-lg text-primary mb-6">Calculation Result</h2>
              {gstLateFee !== null ? (
                <div className="p-8 rounded-xl bg-error-container border border-error/20 text-center">
                  <h3 className="font-label-lg text-error mb-2">Total GST Late Fee</h3>
                  <p className="font-display-md text-display-md text-error font-bold">{formatCurrency(gstLateFee)}</p>
                  <p className="text-sm text-error/80 mt-4">Calculated at {gstType === "NIL" ? "₹20" : "₹50"} per day for {daysLate} days.</p>
                </div>
              ) : (
                <div className="min-h-[200px] flex items-center justify-center text-on-surface-variant text-center px-8 border-2 border-dashed border-outline-variant rounded-xl">
                  Enter the number of days delayed to calculate the maximum GST late fee applicable under CGST/SGST.
                </div>
              )}
            </div>
          </>
        )}

        {/* EMI CALCULATOR */}
        {activeTab === "EMI" && (
          <>
            <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
              <h2 className="font-title-lg text-title-lg text-primary mb-6">Loan Details</h2>
              <form onSubmit={calculateEMI} className="flex flex-col gap-6">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Loan Amount (Principal)</label>
                  <input type="number" min="1" value={principal || ""} onChange={(e) => setPrincipal(Number(e.target.value))} required className="w-full px-4 py-3 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-2">Interest Rate (%)</label>
                    <input type="number" min="0" step="0.1" value={rate || ""} onChange={(e) => setRate(Number(e.target.value))} required className="w-full px-4 py-3 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg" />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-2">Tenure (Years)</label>
                    <input type="number" min="1" value={tenure || ""} onChange={(e) => setTenure(Number(e.target.value))} required className="w-full px-4 py-3 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">Calculate EMI</button>
              </form>
            </div>
            
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <h2 className="font-title-lg text-title-lg text-primary mb-6">Payment Schedule</h2>
              {emiResult !== null ? (
                <div className="flex flex-col gap-4">
                  <div className="p-6 rounded-xl bg-blue-50 border border-blue-200">
                    <h3 className="font-label-lg text-blue-800 mb-1">Monthly EMI</h3>
                    <p className="font-display-md text-display-md text-blue-900 font-bold">{formatCurrency(emiResult)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white border border-outline-variant">
                      <h3 className="font-label-sm text-on-surface-variant mb-1">Total Interest Payable</h3>
                      <p className="font-title-lg text-primary">{formatCurrency((emiResult * tenure * 12) - principal)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-outline-variant">
                      <h3 className="font-label-sm text-on-surface-variant mb-1">Total Payment</h3>
                      <p className="font-title-lg text-primary">{formatCurrency(emiResult * tenure * 12)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="min-h-[200px] flex items-center justify-center text-on-surface-variant text-center px-8 border-2 border-dashed border-outline-variant rounded-xl">
                  Enter loan details to view the monthly EMI, total interest, and total payment amounts.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
