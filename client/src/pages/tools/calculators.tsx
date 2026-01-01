import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolLayout, LoadingSpinner, ResultDisplay } from "@/components/tool-layout";
import { getToolById } from "@/lib/tools-data";
import { Plus, Minus, X, Divide, Delete, Equal } from "lucide-react";

function simulateProcessing(callback: () => void) {
  setTimeout(callback, 800 + Math.random() * 400);
}

export function BasicCalculator() {
  const tool = getToolById("basic-calculator")!;
  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay("0.");
      setWaitingForSecondOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      setDisplay(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case "+": return first + second;
      case "-": return first - second;
      case "*": return first * second;
      case "/": return second !== 0 ? first / second : 0;
      default: return second;
    }
  };

  const handleEquals = () => {
    if (operator && firstOperand !== null) {
      const result = calculate(firstOperand, parseFloat(display), operator);
      setDisplay(String(result));
      setFirstOperand(null);
      setOperator(null);
      setWaitingForSecondOperand(false);
    }
  };

  const buttons = [
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"],
  ];

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-sm mx-auto">
        <div className="bg-muted rounded-lg p-4 mb-4">
          <div className="text-right text-3xl font-mono overflow-x-auto" data-testid="display-result">
            {display}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mb-4">
          <Button 
            variant="destructive" 
            className="col-span-2"
            onClick={clear}
            data-testid="button-clear"
          >
            <Delete className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button 
            variant="secondary"
            className="col-span-2"
            onClick={() => setDisplay(display.slice(0, -1) || "0")}
            data-testid="button-backspace"
          >
            Backspace
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {buttons.flat().map((btn) => (
            <Button
              key={btn}
              variant={["+", "-", "*", "/"].includes(btn) ? "secondary" : btn === "=" ? "default" : "outline"}
              className="h-14 text-xl"
              onClick={() => {
                if (btn === "=") handleEquals();
                else if (["+", "-", "*", "/"].includes(btn)) performOperation(btn);
                else if (btn === ".") inputDecimal();
                else inputDigit(btn);
              }}
              data-testid={`button-${btn === "*" ? "multiply" : btn === "/" ? "divide" : btn === "+" ? "add" : btn === "-" ? "subtract" : btn === "=" ? "equals" : btn === "." ? "decimal" : btn}`}
            >
              {btn === "*" ? <X className="w-5 h-5" /> : btn === "/" ? <Divide className="w-5 h-5" /> : btn === "+" ? <Plus className="w-5 h-5" /> : btn === "-" ? <Minus className="w-5 h-5" /> : btn === "=" ? <Equal className="w-5 h-5" /> : btn}
            </Button>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}

export function ScientificCalculator() {
  const tool = getToolById("scientific-calculator")!;
  const [display, setDisplay] = useState("0");
  const [memory, setMemory] = useState(0);

  const handleFunction = (fn: string) => {
    const value = parseFloat(display);
    let result: number;
    
    switch (fn) {
      case "sin": result = Math.sin(value * Math.PI / 180); break;
      case "cos": result = Math.cos(value * Math.PI / 180); break;
      case "tan": result = Math.tan(value * Math.PI / 180); break;
      case "log": result = Math.log10(value); break;
      case "ln": result = Math.log(value); break;
      case "sqrt": result = Math.sqrt(value); break;
      case "square": result = value * value; break;
      case "cube": result = value * value * value; break;
      case "1/x": result = 1 / value; break;
      case "pi": result = Math.PI; break;
      case "e": result = Math.E; break;
      case "fact": result = factorial(Math.floor(value)); break;
      case "pow": result = Math.pow(value, 2); break;
      default: result = value;
    }
    
    setDisplay(String(result));
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  const scientificButtons = [
    ["sin", "cos", "tan", "log"],
    ["ln", "sqrt", "x²", "x³"],
    ["1/x", "π", "e", "n!"],
  ];

  const numButtons = [
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"],
  ];

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto">
        <div className="bg-muted rounded-lg p-4 mb-4">
          <div className="text-right text-3xl font-mono overflow-x-auto" data-testid="display-result">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {scientificButtons.flat().map((btn) => (
            <Button
              key={btn}
              variant="outline"
              className="text-sm"
              onClick={() => handleFunction(btn === "x²" ? "square" : btn === "x³" ? "cube" : btn === "π" ? "pi" : btn === "n!" ? "fact" : btn)}
              data-testid={`button-${btn.replace(/[²³πn!\/]/g, '')}`}
            >
              {btn}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <Button variant="destructive" className="col-span-2" onClick={() => setDisplay("0")} data-testid="button-clear">
            Clear
          </Button>
          <Button variant="secondary" onClick={() => setMemory(parseFloat(display))} data-testid="button-ms">MS</Button>
          <Button variant="secondary" onClick={() => setDisplay(String(memory))} data-testid="button-mr">MR</Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {numButtons.flat().map((btn) => (
            <Button
              key={btn}
              variant={["+", "-", "*", "/"].includes(btn) ? "secondary" : btn === "=" ? "default" : "outline"}
              className="h-12"
              onClick={() => {
                if (btn === "=") {
                  try {
                    const result = eval(display.replace(/×/g, "*").replace(/÷/g, "/"));
                    setDisplay(String(result));
                  } catch { setDisplay("Error"); }
                } else if (["+", "-", "*", "/"].includes(btn)) {
                  setDisplay(display + btn);
                } else if (btn === ".") {
                  if (!display.includes(".")) setDisplay(display + ".");
                } else {
                  setDisplay(display === "0" ? btn : display + btn);
                }
              }}
              data-testid={`button-num-${btn}`}
            >
              {btn}
            </Button>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}

export function PercentageCalculator() {
  const tool = getToolById("percentage-calculator")!;
  const [mode, setMode] = useState<"of" | "change" | "find">("of");
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = () => {
    const v1 = parseFloat(value1);
    const v2 = parseFloat(value2);
    if (isNaN(v1) || isNaN(v2)) return;

    setLoading(true);
    simulateProcessing(() => {
      let res: number;
      switch (mode) {
        case "of": res = (v1 / 100) * v2; break;
        case "change": res = ((v2 - v1) / v1) * 100; break;
        case "find": res = (v1 / v2) * 100; break;
        default: res = 0;
      }
      setResult(res.toFixed(2));
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Calculation Type</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
            <SelectTrigger data-testid="select-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="of">X% of Y</SelectItem>
              <SelectItem value="change">Percentage Change</SelectItem>
              <SelectItem value="find">X is what % of Y</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{mode === "of" ? "Percentage" : mode === "change" ? "Original Value" : "Value"}</Label>
            <Input
              type="number"
              value={value1}
              onChange={(e) => setValue1(e.target.value)}
              placeholder="Enter value"
              data-testid="input-value1"
            />
          </div>
          <div className="space-y-2">
            <Label>{mode === "of" ? "Number" : mode === "change" ? "New Value" : "Total"}</Label>
            <Input
              type="number"
              value={value2}
              onChange={(e) => setValue2(e.target.value)}
              placeholder="Enter value"
              data-testid="input-value2"
            />
          </div>
        </div>

        <Button onClick={calculate} disabled={loading} className="w-full" data-testid="button-calculate">
          {loading ? "Calculating..." : "Calculate"}
        </Button>

        {loading && <LoadingSpinner text="Calculating..." />}

        {result && !loading && (
          <ResultDisplay title="Result">
            <p className="text-2xl font-bold text-primary" data-testid="text-result">
              {mode === "change" || mode === "find" ? `${result}%` : result}
            </p>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function EMICalculator() {
  const tool = getToolById("emi-calculator")!;
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [result, setResult] = useState<{emi: number; total: number; interest: number} | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 12 / 100;
    const n = parseFloat(tenure);
    if (isNaN(p) || isNaN(r) || isNaN(n) || r === 0) return;

    setLoading(true);
    simulateProcessing(() => {
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = emi * n;
      const interest = total - p;
      setResult({ emi, total, interest });
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
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
            placeholder="e.g., 10"
            data-testid="input-rate"
          />
        </div>

        <div className="space-y-2">
          <Label>Loan Tenure (months)</Label>
          <Input
            type="number"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            placeholder="e.g., 12"
            data-testid="input-tenure"
          />
        </div>

        <Button onClick={calculate} disabled={loading} className="w-full" data-testid="button-calculate">
          {loading ? "Calculating..." : "Calculate EMI"}
        </Button>

        {loading && <LoadingSpinner text="Calculating EMI..." />}

        {result && !loading && (
          <ResultDisplay title="EMI Breakdown">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly EMI</span>
                <span className="font-bold text-xl text-primary" data-testid="text-emi">
                  ${result.emi.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Interest</span>
                <span className="font-semibold" data-testid="text-interest">${result.interest.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Payment</span>
                <span className="font-semibold" data-testid="text-total">${result.total.toFixed(2)}</span>
              </div>
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function GPACalculator() {
  const tool = getToolById("gpa-calculator")!;
  const [subjects, setSubjects] = useState([{ name: "", grade: "", credits: "" }]);
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const gradePoints: Record<string, number> = {
    "A+": 4.0, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "D-": 0.7,
    "F": 0.0
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: "", grade: "", credits: "" }]);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index: number, field: string, value: string) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], [field]: value };
    setSubjects(updated);
  };

  const calculate = () => {
    setLoading(true);
    simulateProcessing(() => {
      let totalPoints = 0;
      let totalCredits = 0;

      subjects.forEach((s) => {
        const credits = parseFloat(s.credits);
        const points = gradePoints[s.grade.toUpperCase()];
        if (!isNaN(credits) && points !== undefined) {
          totalPoints += points * credits;
          totalCredits += credits;
        }
      });

      setResult(totalCredits > 0 ? totalPoints / totalCredits : 0);
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-4">
          {subjects.map((subject, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4">
                <Label className="text-xs">Subject</Label>
                <Input
                  value={subject.name}
                  onChange={(e) => updateSubject(index, "name", e.target.value)}
                  placeholder="Subject name"
                  data-testid={`input-subject-${index}`}
                />
              </div>
              <div className="col-span-3">
                <Label className="text-xs">Grade</Label>
                <Select value={subject.grade} onValueChange={(v) => updateSubject(index, "grade", v)}>
                  <SelectTrigger data-testid={`select-grade-${index}`}>
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(gradePoints).map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Label className="text-xs">Credits</Label>
                <Input
                  type="number"
                  value={subject.credits}
                  onChange={(e) => updateSubject(index, "credits", e.target.value)}
                  placeholder="Credits"
                  data-testid={`input-credits-${index}`}
                />
              </div>
              <div className="col-span-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeSubject(index)}
                  disabled={subjects.length === 1}
                  data-testid={`button-remove-${index}`}
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addSubject} data-testid="button-add-subject">
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>

        <Button onClick={calculate} disabled={loading} className="w-full" data-testid="button-calculate">
          {loading ? "Calculating..." : "Calculate GPA"}
        </Button>

        {loading && <LoadingSpinner text="Calculating GPA..." />}

        {result !== null && !loading && (
          <ResultDisplay title="Your GPA">
            <p className="text-4xl font-bold text-primary text-center" data-testid="text-result">
              {result.toFixed(2)}
            </p>
            <p className="text-center text-muted-foreground mt-2">out of 4.0</p>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function CGPACalculator() {
  const tool = getToolById("cgpa-calculator")!;
  const [semesters, setSemesters] = useState([{ gpa: "", credits: "" }]);
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const addSemester = () => {
    setSemesters([...semesters, { gpa: "", credits: "" }]);
  };

  const removeSemester = (index: number) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter((_, i) => i !== index));
    }
  };

  const updateSemester = (index: number, field: string, value: string) => {
    const updated = [...semesters];
    updated[index] = { ...updated[index], [field]: value };
    setSemesters(updated);
  };

  const calculate = () => {
    setLoading(true);
    simulateProcessing(() => {
      let totalPoints = 0;
      let totalCredits = 0;

      semesters.forEach((s) => {
        const gpa = parseFloat(s.gpa);
        const credits = parseFloat(s.credits);
        if (!isNaN(gpa) && !isNaN(credits)) {
          totalPoints += gpa * credits;
          totalCredits += credits;
        }
      });

      setResult(totalCredits > 0 ? totalPoints / totalCredits : 0);
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          {semesters.map((semester, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <Label className="text-xs">Semester {index + 1} GPA</Label>
                <Input
                  type="number"
                  step="0.01"
                  max="4"
                  value={semester.gpa}
                  onChange={(e) => updateSemester(index, "gpa", e.target.value)}
                  placeholder="e.g., 3.5"
                  data-testid={`input-gpa-${index}`}
                />
              </div>
              <div className="col-span-5">
                <Label className="text-xs">Credits</Label>
                <Input
                  type="number"
                  value={semester.credits}
                  onChange={(e) => updateSemester(index, "credits", e.target.value)}
                  placeholder="e.g., 15"
                  data-testid={`input-credits-${index}`}
                />
              </div>
              <div className="col-span-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeSemester(index)}
                  disabled={semesters.length === 1}
                  data-testid={`button-remove-${index}`}
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addSemester} data-testid="button-add-semester">
          <Plus className="w-4 h-4 mr-2" />
          Add Semester
        </Button>

        <Button onClick={calculate} disabled={loading} className="w-full" data-testid="button-calculate">
          {loading ? "Calculating..." : "Calculate CGPA"}
        </Button>

        {loading && <LoadingSpinner text="Calculating CGPA..." />}

        {result !== null && !loading && (
          <ResultDisplay title="Your CGPA">
            <p className="text-4xl font-bold text-primary text-center" data-testid="text-result">
              {result.toFixed(2)}
            </p>
            <p className="text-center text-muted-foreground mt-2">Cumulative GPA across all semesters</p>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function AgeCalculator() {
  const tool = getToolById("age-calculator")!;
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<{years: number; months: number; days: number; totalDays: number} | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = () => {
    if (!birthDate) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const birth = new Date(birthDate);
      const today = new Date();
      
      let years = today.getFullYear() - birth.getFullYear();
      let months = today.getMonth() - birth.getMonth();
      let days = today.getDate() - birth.getDate();

      if (days < 0) {
        months--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
      
      setResult({ years, months, days, totalDays });
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            data-testid="input-birthdate"
          />
        </div>

        <Button onClick={calculate} disabled={loading} className="w-full" data-testid="button-calculate">
          {loading ? "Calculating..." : "Calculate Age"}
        </Button>

        {loading && <LoadingSpinner text="Calculating age..." />}

        {result && !loading && (
          <ResultDisplay title="Your Age">
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-3xl font-bold text-primary" data-testid="text-years">{result.years}</p>
                <p className="text-sm text-muted-foreground">Years</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-3xl font-bold text-primary" data-testid="text-months">{result.months}</p>
                <p className="text-sm text-muted-foreground">Months</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-3xl font-bold text-primary" data-testid="text-days">{result.days}</p>
                <p className="text-sm text-muted-foreground">Days</p>
              </div>
            </div>
            <p className="text-center text-muted-foreground">
              Total: <span className="font-semibold">{result.totalDays.toLocaleString()}</span> days
            </p>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function UnitConverter() {
  const tool = getToolById("unit-converter")!;
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [value, setValue] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const units: Record<string, Record<string, number>> = {
    length: { meter: 1, kilometer: 1000, centimeter: 0.01, millimeter: 0.001, mile: 1609.34, yard: 0.9144, foot: 0.3048, inch: 0.0254 },
    weight: { kilogram: 1, gram: 0.001, milligram: 0.000001, pound: 0.453592, ounce: 0.0283495, ton: 1000 },
    temperature: { celsius: 1, fahrenheit: 1, kelvin: 1 },
    volume: { liter: 1, milliliter: 0.001, gallon: 3.78541, quart: 0.946353, cup: 0.236588 },
  };

  const convertTemperature = (val: number, from: string, to: string): number => {
    let celsius: number;
    if (from === "celsius") celsius = val;
    else if (from === "fahrenheit") celsius = (val - 32) * 5/9;
    else celsius = val - 273.15;

    if (to === "celsius") return celsius;
    if (to === "fahrenheit") return celsius * 9/5 + 32;
    return celsius + 273.15;
  };

  const convert = () => {
    const val = parseFloat(value);
    if (isNaN(val) || !fromUnit || !toUnit) return;

    setLoading(true);
    simulateProcessing(() => {
      let res: number;
      if (category === "temperature") {
        res = convertTemperature(val, fromUnit, toUnit);
      } else {
        const baseValue = val * units[category][fromUnit];
        res = baseValue / units[category][toUnit];
      }
      setResult(res.toFixed(6).replace(/\.?0+$/, ""));
      setLoading(false);
    });
  };

  const currentUnits = Object.keys(units[category] || {});

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={(v) => { setCategory(v); setFromUnit(""); setToUnit(""); setResult(null); }}>
            <SelectTrigger data-testid="select-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="length">Length</SelectItem>
              <SelectItem value="weight">Weight</SelectItem>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>From</Label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger data-testid="select-from">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {currentUnits.map((u) => (
                  <SelectItem key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger data-testid="select-to">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {currentUnits.map((u) => (
                  <SelectItem key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Value</Label>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value to convert"
            data-testid="input-value"
          />
        </div>

        <Button onClick={convert} disabled={loading} className="w-full" data-testid="button-convert">
          {loading ? "Converting..." : "Convert"}
        </Button>

        {loading && <LoadingSpinner text="Converting..." />}

        {result && !loading && (
          <ResultDisplay title="Result">
            <p className="text-2xl font-bold text-primary text-center" data-testid="text-result">
              {value} {fromUnit} = {result} {toUnit}
            </p>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function TimeDurationCalculator() {
  const tool = getToolById("time-duration")!;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<{years: number; months: number; days: number; hours: number; minutes: number} | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    simulateProcessing(() => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const diffMs = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      const years = Math.floor(diffDays / 365);
      const remainingDays = diffDays % 365;
      const months = Math.floor(remainingDays / 30);
      const days = remainingDays % 30;

      setResult({ years, months, days, hours: diffHours, minutes: diffMinutes });
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Start Date & Time</Label>
          <Input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            data-testid="input-start"
          />
        </div>

        <div className="space-y-2">
          <Label>End Date & Time</Label>
          <Input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            data-testid="input-end"
          />
        </div>

        <Button onClick={calculate} disabled={loading} className="w-full" data-testid="button-calculate">
          {loading ? "Calculating..." : "Calculate Duration"}
        </Button>

        {loading && <LoadingSpinner text="Calculating duration..." />}

        {result && !loading && (
          <ResultDisplay title="Duration">
            <div className="grid grid-cols-5 gap-2 text-center">
              <div className="p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary" data-testid="text-years">{result.years}</p>
                <p className="text-xs text-muted-foreground">Years</p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary" data-testid="text-months">{result.months}</p>
                <p className="text-xs text-muted-foreground">Months</p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary" data-testid="text-days">{result.days}</p>
                <p className="text-xs text-muted-foreground">Days</p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary" data-testid="text-hours">{result.hours}</p>
                <p className="text-xs text-muted-foreground">Hours</p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary" data-testid="text-minutes">{result.minutes}</p>
                <p className="text-xs text-muted-foreground">Min</p>
              </div>
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}
