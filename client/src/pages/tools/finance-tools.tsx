import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolLayout, LoadingSpinner, ResultDisplay } from "@/components/tool-layout";
import { getToolById } from "@/lib/tools-data";
import { Plus, Trash2 } from "lucide-react";

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  return [storedValue, setValue];
}

function simulateProcessing(callback: () => void) {
  setTimeout(callback, 600 + Math.random() * 300);
}

export function SIPCalculator() {
  const tool = getToolById("sip-calculator")!;
  const [monthlyInvestment, setMonthlyInvestment] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [timePeriod, setTimePeriod] = useState("");
  const [result, setResult] = useState<{ invested: number; returns: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = () => {
    const P = parseFloat(monthlyInvestment);
    const r = parseFloat(expectedReturn) / 100 / 12;
    const n = parseFloat(timePeriod) * 12;
    
    if (isNaN(P) || isNaN(r) || isNaN(n) || r === 0) return;

    setLoading(true);
    simulateProcessing(() => {
      const total = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      const invested = P * n;
      setResult({
        invested,
        returns: total - invested,
        total,
      });
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Monthly Investment Amount</Label>
          <Input
            type="number"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(e.target.value)}
            placeholder="e.g., 5000"
            data-testid="input-monthly"
          />
        </div>

        <div className="space-y-2">
          <Label>Expected Annual Return (%)</Label>
          <Input
            type="number"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(e.target.value)}
            placeholder="e.g., 12"
            data-testid="input-return"
          />
        </div>

        <div className="space-y-2">
          <Label>Time Period (Years)</Label>
          <Input
            type="number"
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            placeholder="e.g., 10"
            data-testid="input-years"
          />
        </div>

        <Button onClick={calculate} disabled={loading} className="w-full" data-testid="button-calculate">
          {loading ? "Calculating..." : "Calculate SIP Returns"}
        </Button>

        {loading && <LoadingSpinner text="Calculating..." />}

        {result && !loading && (
          <ResultDisplay title="SIP Returns">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Invested</span>
                <span className="font-semibold" data-testid="text-invested">
                  ${result.invested.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Returns</span>
                <span className="font-semibold text-green-500" data-testid="text-returns">
                  +${result.returns.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="pt-3 border-t flex justify-between">
                <span className="font-medium">Total Value</span>
                <span className="text-xl font-bold text-primary" data-testid="text-total">
                  ${result.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function TipCalculator() {
  const tool = getToolById("tip-calculator")!;
  const [billAmount, setBillAmount] = useState("");
  const [tipPercent, setTipPercent] = useState("15");
  const [splitCount, setSplitCount] = useState("1");

  const bill = parseFloat(billAmount) || 0;
  const tip = parseFloat(tipPercent) || 0;
  const people = parseInt(splitCount) || 1;

  const tipAmount = (bill * tip) / 100;
  const total = bill + tipAmount;
  const perPerson = total / people;
  const tipPerPerson = tipAmount / people;

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Bill Amount</Label>
          <Input
            type="number"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            placeholder="e.g., 50.00"
            data-testid="input-bill"
          />
        </div>

        <div className="space-y-2">
          <Label>Tip Percentage</Label>
          <div className="flex gap-2">
            {[10, 15, 18, 20, 25].map((t) => (
              <Button
                key={t}
                variant={tipPercent === String(t) ? "default" : "outline"}
                size="sm"
                onClick={() => setTipPercent(String(t))}
                data-testid={`button-tip-${t}`}
              >
                {t}%
              </Button>
            ))}
          </div>
          <Input
            type="number"
            value={tipPercent}
            onChange={(e) => setTipPercent(e.target.value)}
            placeholder="Custom %"
            data-testid="input-tip"
          />
        </div>

        <div className="space-y-2">
          <Label>Split Between</Label>
          <Input
            type="number"
            min="1"
            value={splitCount}
            onChange={(e) => setSplitCount(e.target.value)}
            placeholder="Number of people"
            data-testid="input-split"
          />
        </div>

        {bill > 0 && (
          <ResultDisplay title="Bill Breakdown">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tip Amount</span>
                <span className="font-semibold" data-testid="text-tip">${tipAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold" data-testid="text-total">${total.toFixed(2)}</span>
              </div>
              {people > 1 && (
                <>
                  <div className="pt-3 border-t" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per Person</span>
                    <span className="text-xl font-bold text-primary" data-testid="text-per-person">
                      ${perPerson.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tip Per Person</span>
                    <span data-testid="text-tip-per-person">${tipPerPerson.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function LoanCalculator() {
  const tool = getToolById("loan-calculator")!;
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [tenureType, setTenureType] = useState("months");
  const [result, setResult] = useState<{
    emi: number;
    totalInterest: number;
    totalPayment: number;
    schedule: { month: number; principal: number; interest: number; balance: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = () => {
    const p = parseFloat(principal);
    const annualRate = parseFloat(rate);
    const r = annualRate / 12 / 100;
    const n = tenureType === "years" ? parseFloat(tenure) * 12 : parseFloat(tenure);
    
    if (isNaN(p) || isNaN(r) || isNaN(n) || r === 0) return;

    setLoading(true);
    simulateProcessing(() => {
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = emi * n;
      const totalInterest = totalPayment - p;

      const schedule: { month: number; principal: number; interest: number; balance: number }[] = [];
      let balance = p;
      for (let i = 1; i <= Math.min(n, 12); i++) {
        const interestPayment = balance * r;
        const principalPayment = emi - interestPayment;
        balance -= principalPayment;
        schedule.push({
          month: i,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, balance),
        });
      }

      setResult({ emi, totalInterest, totalPayment, schedule });
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Loan Amount</Label>
            <Input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="e.g., 100000"
              data-testid="input-principal"
            />
          </div>
          <div className="space-y-2">
            <Label>Annual Interest Rate (%)</Label>
            <Input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g., 8"
              data-testid="input-rate"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Loan Tenure</Label>
            <Input
              type="number"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              placeholder="e.g., 12"
              data-testid="input-tenure"
            />
          </div>
          <div className="space-y-2">
            <Label>Period</Label>
            <Select value={tenureType} onValueChange={setTenureType}>
              <SelectTrigger data-testid="select-tenure-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="months">Months</SelectItem>
                <SelectItem value="years">Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={calculate} disabled={loading} className="w-full" data-testid="button-calculate">
          {loading ? "Calculating..." : "Calculate Loan"}
        </Button>

        {loading && <LoadingSpinner text="Calculating..." />}

        {result && !loading && (
          <>
            <ResultDisplay title="Loan Summary">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-2xl font-bold text-primary" data-testid="text-emi">
                    ${result.emi.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Monthly EMI</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-2xl font-bold text-orange-500" data-testid="text-interest">
                    ${result.totalInterest.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Interest</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-2xl font-bold" data-testid="text-total">
                    ${result.totalPayment.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Payment</p>
                </div>
              </div>
            </ResultDisplay>

            <ResultDisplay title="Amortization (First 12 months)">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Month</th>
                      <th className="text-right py-2">Principal</th>
                      <th className="text-right py-2">Interest</th>
                      <th className="text-right py-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((row) => (
                      <tr key={row.month} className="border-b border-muted">
                        <td className="py-2">{row.month}</td>
                        <td className="text-right">${row.principal.toFixed(2)}</td>
                        <td className="text-right">${row.interest.toFixed(2)}</td>
                        <td className="text-right">${row.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ResultDisplay>
          </>
        )}
      </div>
    </ToolLayout>
  );
}

export function SimpleInterestCalculator() {
  const tool = getToolById("simple-interest")!;
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [result, setResult] = useState<{ interest: number; total: number } | null>(null);

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(time);
    
    if (isNaN(p) || isNaN(r) || isNaN(t)) return;

    const interest = (p * r * t) / 100;
    setResult({ interest, total: p + interest });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Principal Amount</Label>
          <Input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g., 10000"
            data-testid="input-principal"
          />
        </div>

        <div className="space-y-2">
          <Label>Annual Interest Rate (%)</Label>
          <Input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g., 5"
            data-testid="input-rate"
          />
        </div>

        <div className="space-y-2">
          <Label>Time Period (Years)</Label>
          <Input
            type="number"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="e.g., 2"
            data-testid="input-time"
          />
        </div>

        <Button onClick={calculate} className="w-full" data-testid="button-calculate">
          Calculate Interest
        </Button>

        {result && (
          <ResultDisplay title="Simple Interest Result">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Earned</span>
                <span className="font-semibold text-green-500" data-testid="text-interest">
                  +${result.interest.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-medium">Total Amount</span>
                <span className="text-xl font-bold text-primary" data-testid="text-total">
                  ${result.total.toFixed(2)}
                </span>
              </div>
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function CompoundInterestCalculator() {
  const tool = getToolById("compound-interest")!;
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState("12");
  const [result, setResult] = useState<{ interest: number; total: number } | null>(null);

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);
    const n = parseFloat(frequency);
    
    if (isNaN(p) || isNaN(r) || isNaN(t) || isNaN(n)) return;

    const total = p * Math.pow(1 + r / n, n * t);
    setResult({ interest: total - p, total });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Principal Amount</Label>
          <Input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g., 10000"
            data-testid="input-principal"
          />
        </div>

        <div className="space-y-2">
          <Label>Annual Interest Rate (%)</Label>
          <Input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g., 8"
            data-testid="input-rate"
          />
        </div>

        <div className="space-y-2">
          <Label>Time Period (Years)</Label>
          <Input
            type="number"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="e.g., 5"
            data-testid="input-time"
          />
        </div>

        <div className="space-y-2">
          <Label>Compounding Frequency</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger data-testid="select-frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Annually</SelectItem>
              <SelectItem value="2">Semi-Annually</SelectItem>
              <SelectItem value="4">Quarterly</SelectItem>
              <SelectItem value="12">Monthly</SelectItem>
              <SelectItem value="365">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={calculate} className="w-full" data-testid="button-calculate">
          Calculate Compound Interest
        </Button>

        {result && (
          <ResultDisplay title="Compound Interest Result">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Earned</span>
                <span className="font-semibold text-green-500" data-testid="text-interest">
                  +${result.interest.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-medium">Total Amount</span>
                <span className="text-xl font-bold text-primary" data-testid="text-total">
                  ${result.total.toFixed(2)}
                </span>
              </div>
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function SavingsGoalCalculator() {
  const tool = getToolById("savings-goal")!;
  const [goal, setGoal] = useState("");
  const [current, setCurrent] = useState("");
  const [months, setMonths] = useState("");
  const [rate, setRate] = useState("0");

  const goalAmount = parseFloat(goal) || 0;
  const currentAmount = parseFloat(current) || 0;
  const targetMonths = parseFloat(months) || 1;
  const annualRate = parseFloat(rate) || 0;

  const needed = goalAmount - currentAmount;
  const monthlyWithoutInterest = needed / targetMonths;
  
  const monthlyRate = annualRate / 12 / 100;
  const monthlyWithInterest = monthlyRate > 0 
    ? (needed * monthlyRate) / (Math.pow(1 + monthlyRate, targetMonths) - 1)
    : monthlyWithoutInterest;

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Savings Goal</Label>
          <Input
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., 10000"
            data-testid="input-goal"
          />
        </div>

        <div className="space-y-2">
          <Label>Current Savings</Label>
          <Input
            type="number"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="e.g., 2000"
            data-testid="input-current"
          />
        </div>

        <div className="space-y-2">
          <Label>Months to Goal</Label>
          <Input
            type="number"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            placeholder="e.g., 12"
            data-testid="input-months"
          />
        </div>

        <div className="space-y-2">
          <Label>Expected Annual Return (%) - Optional</Label>
          <Input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g., 5"
            data-testid="input-rate"
          />
        </div>

        {goalAmount > 0 && targetMonths > 0 && (
          <ResultDisplay title="Savings Plan">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Needed</span>
                <span className="font-semibold" data-testid="text-needed">
                  ${needed.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-medium">Monthly Savings Needed</span>
                <span className="text-xl font-bold text-primary" data-testid="text-monthly">
                  ${monthlyWithInterest.toFixed(2)}
                </span>
              </div>
              {annualRate > 0 && (
                <p className="text-xs text-muted-foreground">
                  (With {annualRate}% annual returns)
                </p>
              )}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function DiscountCalculator() {
  const tool = getToolById("discount-calculator")!;
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [mode, setMode] = useState<"discount" | "original">("discount");

  const original = parseFloat(originalPrice) || 0;
  const discount = parseFloat(discountPercent) || 0;

  const discountAmount = (original * discount) / 100;
  const finalPrice = original - discountAmount;

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Original Price</Label>
          <Input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="e.g., 100"
            data-testid="input-price"
          />
        </div>

        <div className="space-y-2">
          <Label>Discount Percentage</Label>
          <div className="flex gap-2 flex-wrap">
            {[10, 15, 20, 25, 30, 50].map((d) => (
              <Button
                key={d}
                variant={discountPercent === String(d) ? "default" : "outline"}
                size="sm"
                onClick={() => setDiscountPercent(String(d))}
                data-testid={`button-discount-${d}`}
              >
                {d}%
              </Button>
            ))}
          </div>
          <Input
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            placeholder="Custom %"
            data-testid="input-discount"
          />
        </div>

        {original > 0 && discount > 0 && (
          <ResultDisplay title="Price After Discount">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Price</span>
                <span className="font-semibold">${original.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount ({discount}%)</span>
                <span className="font-semibold text-green-500" data-testid="text-savings">
                  -${discountAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-medium">Final Price</span>
                <span className="text-2xl font-bold text-primary" data-testid="text-final">
                  ${finalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function CurrencyConverter() {
  const tool = getToolById("currency-converter")!;
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [result, setResult] = useState<number | null>(null);

  // Static exchange rates (in production, use a live API)
  const rates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    INR: 83.12,
    CAD: 1.36,
    AUD: 1.53,
    CHF: 0.88,
    CNY: 7.24,
    MXN: 17.15,
  };

  const currencies = Object.keys(rates);

  const convert = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt)) return;

    const inUSD = amt / rates[fromCurrency];
    const converted = inUSD * rates[toCurrency];
    setResult(converted);
  };

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 100"
            data-testid="input-amount"
          />
        </div>

        <div className="grid grid-cols-5 gap-2 items-end">
          <div className="col-span-2 space-y-2">
            <Label>From</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger data-testid="select-from">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-center">
            <Button variant="outline" size="icon" onClick={swap} data-testid="button-swap">
              ⇄
            </Button>
          </div>

          <div className="col-span-2 space-y-2">
            <Label>To</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger data-testid="select-to">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={convert} className="w-full" data-testid="button-convert">
          Convert
        </Button>

        {result !== null && (
          <ResultDisplay title="Converted Amount">
            <p className="text-3xl font-bold text-primary text-center" data-testid="text-result">
              {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} {toCurrency}
            </p>
          </ResultDisplay>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Note: Exchange rates are approximate and may not reflect current market rates.
        </p>
      </div>
    </ToolLayout>
  );
}

export function TaxCalculator() {
  const tool = getToolById("tax-calculator")!;
  const [income, setIncome] = useState("");
  const [country, setCountry] = useState("us");
  const [result, setResult] = useState<{ tax: number; effective: number; afterTax: number; brackets: { rate: number; amount: number }[] } | null>(null);

  const taxBrackets: Record<string, { min: number; max: number; rate: number }[]> = {
    us: [
      { min: 0, max: 11000, rate: 10 },
      { min: 11000, max: 44725, rate: 12 },
      { min: 44725, max: 95375, rate: 22 },
      { min: 95375, max: 182100, rate: 24 },
      { min: 182100, max: 231250, rate: 32 },
      { min: 231250, max: 578125, rate: 35 },
      { min: 578125, max: Infinity, rate: 37 },
    ],
    uk: [
      { min: 0, max: 12570, rate: 0 },
      { min: 12570, max: 50270, rate: 20 },
      { min: 50270, max: 125140, rate: 40 },
      { min: 125140, max: Infinity, rate: 45 },
    ],
    india: [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 600000, rate: 5 },
      { min: 600000, max: 900000, rate: 10 },
      { min: 900000, max: 1200000, rate: 15 },
      { min: 1200000, max: 1500000, rate: 20 },
      { min: 1500000, max: Infinity, rate: 30 },
    ],
  };

  const calculate = () => {
    const inc = parseFloat(income);
    if (isNaN(inc)) return;

    const brackets = taxBrackets[country];
    let totalTax = 0;
    let remaining = inc;
    const taxByBracket: { rate: number; amount: number }[] = [];

    for (const bracket of brackets) {
      if (remaining <= 0) break;
      const taxableInBracket = Math.min(remaining, bracket.max - bracket.min);
      const taxInBracket = taxableInBracket * (bracket.rate / 100);
      totalTax += taxInBracket;
      if (taxInBracket > 0) {
        taxByBracket.push({ rate: bracket.rate, amount: taxInBracket });
      }
      remaining -= taxableInBracket;
    }

    setResult({
      tax: totalTax,
      effective: (totalTax / inc) * 100,
      afterTax: inc - totalTax,
      brackets: taxByBracket,
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Annual Income</Label>
          <Input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="e.g., 50000"
            data-testid="input-income"
          />
        </div>

        <div className="space-y-2">
          <Label>Country/Region</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger data-testid="select-country">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="india">India</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={calculate} className="w-full" data-testid="button-calculate">
          Calculate Tax
        </Button>

        {result && (
          <ResultDisplay title="Tax Breakdown">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Tax</span>
                <span className="font-semibold text-red-500" data-testid="text-tax">
                  ${result.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Effective Rate</span>
                <span className="font-semibold" data-testid="text-effective">
                  {result.effective.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-medium">After-Tax Income</span>
                <span className="text-xl font-bold text-primary" data-testid="text-after-tax">
                  ${result.afterTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </ResultDisplay>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Note: This is an estimate. Consult a tax professional for accurate calculations.
        </p>
      </div>
    </ToolLayout>
  );
}

interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  category: "income" | "expense";
}

export function BudgetPlanner() {
  const tool = getToolById("budget-planner")!;
  const [items, setItems] = useLocalStorage<BudgetItem[]>("student-budget", []);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<"income" | "expense">("expense");

  const addItem = () => {
    if (!name.trim() || !amount) return;
    const item: BudgetItem = {
      id: Date.now().toString(),
      name: name.trim(),
      amount: parseFloat(amount),
      category,
    };
    setItems((prev) => [...prev, item]);
    setName("");
    setAmount("");
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const totalIncome = items.filter((i) => i.category === "income").reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = items.filter((i) => i.category === "expense").reduce((sum, i) => sum + i.amount, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-500">${totalIncome.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">Income</p>
          </div>
          <div className="p-4 bg-red-500/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-500">${totalExpenses.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">Expenses</p>
          </div>
          <div className={`p-4 rounded-lg text-center ${balance >= 0 ? "bg-primary/10" : "bg-red-500/10"}`}>
            <p className={`text-2xl font-bold ${balance >= 0 ? "text-primary" : "text-red-500"}`}>
              ${Math.abs(balance).toFixed(0)}
            </p>
            <p className="text-sm text-muted-foreground">{balance >= 0 ? "Surplus" : "Deficit"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Salary"
              data-testid="input-name"
            />
          </div>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 5000"
              data-testid="input-amount"
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as "income" | "expense")}>
              <SelectTrigger data-testid="select-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button onClick={addItem} className="w-full" data-testid="button-add">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No budget items. Add income and expenses above.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                data-testid={`item-${item.id}`}
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${item.category === "income" ? "text-green-500" : "text-red-500"}`}>
                    {item.category === "income" ? "+" : "-"}${item.amount.toFixed(0)}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
