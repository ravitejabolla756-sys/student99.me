import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToolLayout, ResultDisplay } from "@/components/tool-layout";
import { getToolById } from "@/lib/tools-data";
import { Copy, Check, RefreshCw, Plus, Trash2, Play, Pause, RotateCcw } from "lucide-react";

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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="outline" size="sm" onClick={copy}>
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
}

export function PasswordGenerator() {
  const tool = getToolById("password-generator")!;
  const [length, setLength] = useState([16]);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState("");

  const generate = () => {
    let chars = "";
    if (includeUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) chars += "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    if (!chars) {
      setPassword("Select at least one option");
      return;
    }

    let result = "";
    for (let i = 0; i < length[0]; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  useEffect(() => {
    generate();
  }, []);

  const getStrength = () => {
    let score = 0;
    if (length[0] >= 12) score++;
    if (length[0] >= 16) score++;
    if (includeUpper && includeLower) score++;
    if (includeNumbers) score++;
    if (includeSymbols) score++;
    
    if (score <= 2) return { label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { label: "Fair", color: "bg-yellow-500" };
    if (score <= 4) return { label: "Good", color: "bg-blue-500" };
    return { label: "Strong", color: "bg-green-500" };
  };

  const strength = getStrength();

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <ResultDisplay title="Generated Password">
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-background rounded font-mono text-lg break-all" data-testid="text-password">
              {password}
            </code>
            <CopyButton text={password} />
            <Button variant="outline" size="icon" onClick={generate} data-testid="button-refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${strength.color} transition-all`} style={{ width: `${(["Weak", "Fair", "Good", "Strong"].indexOf(strength.label) + 1) * 25}%` }} />
            </div>
            <span className="text-sm font-medium">{strength.label}</span>
          </div>
        </ResultDisplay>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Length</Label>
              <span className="text-sm font-medium">{length[0]}</span>
            </div>
            <Slider
              value={length}
              onValueChange={setLength}
              min={8}
              max={64}
              step={1}
              data-testid="slider-length"
            />
          </div>

          <div className="space-y-3">
            {[
              { id: "upper", label: "Uppercase (A-Z)", checked: includeUpper, onChange: setIncludeUpper },
              { id: "lower", label: "Lowercase (a-z)", checked: includeLower, onChange: setIncludeLower },
              { id: "numbers", label: "Numbers (0-9)", checked: includeNumbers, onChange: setIncludeNumbers },
              { id: "symbols", label: "Symbols (!@#$%)", checked: includeSymbols, onChange: setIncludeSymbols },
            ].map((opt) => (
              <div key={opt.id} className="flex items-center gap-3">
                <Checkbox
                  id={opt.id}
                  checked={opt.checked}
                  onCheckedChange={(c) => opt.onChange(c as boolean)}
                  data-testid={`checkbox-${opt.id}`}
                />
                <label htmlFor={opt.id} className="text-sm cursor-pointer">{opt.label}</label>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={generate} className="w-full" data-testid="button-generate">
          <RefreshCw className="w-4 h-4 mr-2" /> Generate New Password
        </Button>
      </div>
    </ToolLayout>
  );
}

export function QRCodeGenerator() {
  const tool = getToolById("qr-generator")!;
  const [text, setText] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const generate = () => {
    if (!text.trim()) return;
    // Using a public QR code API
    const encoded = encodeURIComponent(text);
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`);
  };

  useEffect(() => {
    if (text) {
      const timer = setTimeout(generate, 500);
      return () => clearTimeout(timer);
    } else {
      setQrUrl("");
    }
  }, [text]);

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Enter text or URL</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://example.com or any text"
            className="min-h-[100px]"
            data-testid="textarea-input"
          />
        </div>

        {qrUrl && (
          <ResultDisplay title="QR Code">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-background rounded-lg">
                <img
                  src={qrUrl}
                  alt="QR Code"
                  className="w-48 h-48"
                  data-testid="img-qr"
                />
              </div>
              <Button asChild variant="outline">
                <a href={qrUrl} download="qrcode.png" data-testid="button-download">
                  Download QR Code
                </a>
              </Button>
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function RandomNumberGenerator() {
  const tool = getToolById("random-number")!;
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("1");
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [results, setResults] = useState<number[]>([]);

  const generate = () => {
    const minVal = parseInt(min) || 1;
    const maxVal = parseInt(max) || 100;
    const countVal = Math.min(parseInt(count) || 1, allowDuplicates ? 1000 : maxVal - minVal + 1);

    if (minVal >= maxVal) {
      setResults([]);
      return;
    }

    const numbers: number[] = [];
    
    if (allowDuplicates) {
      for (let i = 0; i < countVal; i++) {
        numbers.push(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
      }
    } else {
      const pool = Array.from({ length: maxVal - minVal + 1 }, (_, i) => i + minVal);
      for (let i = 0; i < countVal && pool.length > 0; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        numbers.push(pool.splice(idx, 1)[0]);
      }
    }

    setResults(numbers);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Minimum</Label>
            <Input
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              data-testid="input-min"
            />
          </div>
          <div className="space-y-2">
            <Label>Maximum</Label>
            <Input
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              data-testid="input-max"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>How many numbers?</Label>
          <Input
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            data-testid="input-count"
          />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="duplicates"
            checked={allowDuplicates}
            onCheckedChange={(c) => setAllowDuplicates(c as boolean)}
            data-testid="checkbox-duplicates"
          />
          <label htmlFor="duplicates" className="text-sm cursor-pointer">Allow duplicates</label>
        </div>

        <Button onClick={generate} className="w-full" data-testid="button-generate">
          Generate
        </Button>

        {results.length > 0 && (
          <ResultDisplay title={`Random Number${results.length > 1 ? "s" : ""}`}>
            <div className="flex flex-wrap gap-2">
              {results.map((num, i) => (
                <span
                  key={i}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-lg font-mono text-lg"
                  data-testid={`number-${i}`}
                >
                  {num}
                </span>
              ))}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function UUIDGenerator() {
  const tool = getToolById("uuid-generator")!;
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState("5");
  const [version, setVersion] = useState("v4");

  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const generate = () => {
    const num = Math.min(Math.max(parseInt(count) || 1, 1), 100);
    const newUuids = Array.from({ length: num }, generateUUID);
    setUuids(newUuids);
  };

  useEffect(() => {
    generate();
  }, []);

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label>Number of UUIDs</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              data-testid="input-count"
            />
          </div>
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button onClick={generate} data-testid="button-generate">
              Generate
            </Button>
          </div>
        </div>

        {uuids.length > 0 && (
          <ResultDisplay title={`Generated UUID${uuids.length > 1 ? "s" : ""}`}>
            <div className="space-y-2">
              {uuids.map((uuid, i) => (
                <div key={i} className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-background rounded font-mono text-sm" data-testid={`uuid-${i}`}>
                    {uuid}
                  </code>
                  <CopyButton text={uuid} />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigator.clipboard.writeText(uuids.join("\n"))}
                data-testid="button-copy-all"
              >
                Copy All
              </Button>
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function ColorPicker() {
  const tool = getToolById("color-picker")!;
  const [color, setColor] = useState("#3b82f6");

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const formats = [
    { label: "HEX", value: color.toUpperCase() },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "RGBA", value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
  ];

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-32 h-32 rounded-xl border-4 border-border shadow-lg"
            style={{ backgroundColor: color }}
          />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-32 h-10 cursor-pointer"
            data-testid="input-color"
          />
        </div>

        <div className="space-y-2">
          <Label>Enter HEX color</Label>
          <Input
            value={color}
            onChange={(e) => {
              if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                setColor(e.target.value);
              }
            }}
            placeholder="#3b82f6"
            data-testid="input-hex"
          />
        </div>

        <ResultDisplay title="Color Formats">
          <div className="space-y-3">
            {formats.map((format) => (
              <div key={format.label} className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground w-16">{format.label}</span>
                <code className="flex-1 p-2 bg-background rounded text-sm font-mono" data-testid={`text-${format.label.toLowerCase()}`}>
                  {format.value}
                </code>
                <CopyButton text={format.value} />
              </div>
            ))}
          </div>
        </ResultDisplay>
      </div>
    </ToolLayout>
  );
}

export function HashGenerator() {
  const tool = getToolById("hash-generator")!;
  const [text, setText] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});

  const simpleHash = async (str: string, algorithm: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generate = async () => {
    if (!text) {
      setHashes({});
      return;
    }

    const results: Record<string, string> = {};
    results["SHA-1"] = await simpleHash(text, "SHA-1");
    results["SHA-256"] = await simpleHash(text, "SHA-256");
    results["SHA-384"] = await simpleHash(text, "SHA-384");
    results["SHA-512"] = await simpleHash(text, "SHA-512");
    setHashes(results);
  };

  useEffect(() => {
    generate();
  }, [text]);

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Enter text to hash</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text..."
            className="min-h-[100px]"
            data-testid="textarea-input"
          />
        </div>

        {Object.keys(hashes).length > 0 && (
          <ResultDisplay title="Generated Hashes">
            <div className="space-y-3">
              {Object.entries(hashes).map(([algo, hash]) => (
                <div key={algo} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{algo}</span>
                    <CopyButton text={hash} />
                  </div>
                  <code className="block p-2 bg-background rounded text-xs font-mono break-all" data-testid={`text-${algo.toLowerCase()}`}>
                    {hash}
                  </code>
                </div>
              ))}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function TimezoneConverter() {
  const tool = getToolById("timezone-converter")!;
  const [sourceTime, setSourceTime] = useState(new Date().toISOString().slice(0, 16));
  const [sourceZone, setSourceZone] = useState("America/New_York");
  const [targetZone, setTargetZone] = useState("Europe/London");

  const timezones = [
    "America/New_York",
    "America/Los_Angeles",
    "America/Chicago",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Australia/Sydney",
    "Pacific/Auckland",
  ];

  const convertTime = () => {
    try {
      const date = new Date(sourceTime);
      return date.toLocaleString("en-US", { timeZone: targetZone, dateStyle: "full", timeStyle: "long" });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Date & Time</Label>
          <Input
            type="datetime-local"
            value={sourceTime}
            onChange={(e) => setSourceTime(e.target.value)}
            data-testid="input-time"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>From Timezone</Label>
            <Select value={sourceZone} onValueChange={setSourceZone}>
              <SelectTrigger data-testid="select-from">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>To Timezone</Label>
            <Select value={targetZone} onValueChange={setTargetZone}>
              <SelectTrigger data-testid="select-to">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ResultDisplay title="Converted Time">
          <p className="text-lg font-medium text-center" data-testid="text-result">
            {convertTime()}
          </p>
        </ResultDisplay>
      </div>
    </ToolLayout>
  );
}

export function RomanNumeralConverter() {
  const tool = getToolById("roman-numeral")!;
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"toRoman" | "toDecimal">("toRoman");
  const [result, setResult] = useState("");

  const romanNumerals = [
    { value: 1000, numeral: "M" },
    { value: 900, numeral: "CM" },
    { value: 500, numeral: "D" },
    { value: 400, numeral: "CD" },
    { value: 100, numeral: "C" },
    { value: 90, numeral: "XC" },
    { value: 50, numeral: "L" },
    { value: 40, numeral: "XL" },
    { value: 10, numeral: "X" },
    { value: 9, numeral: "IX" },
    { value: 5, numeral: "V" },
    { value: 4, numeral: "IV" },
    { value: 1, numeral: "I" },
  ];

  const toRoman = (num: number): string => {
    if (num < 1 || num > 3999) return "Number must be 1-3999";
    let result = "";
    for (const { value, numeral } of romanNumerals) {
      while (num >= value) {
        result += numeral;
        num -= value;
      }
    }
    return result;
  };

  const toDecimal = (roman: string): string => {
    const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let result = 0;
    const upper = roman.toUpperCase();
    for (let i = 0; i < upper.length; i++) {
      const current = map[upper[i]];
      const next = map[upper[i + 1]];
      if (!current) return "Invalid Roman numeral";
      if (next && current < next) {
        result -= current;
      } else {
        result += current;
      }
    }
    return result.toString();
  };

  const convert = () => {
    if (!input.trim()) return;
    if (mode === "toRoman") {
      const num = parseInt(input);
      if (isNaN(num)) {
        setResult("Please enter a valid number");
      } else {
        setResult(toRoman(num));
      }
    } else {
      setResult(toDecimal(input));
    }
  };

  useEffect(() => {
    convert();
  }, [input, mode]);

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex gap-2">
          <Button
            variant={mode === "toRoman" ? "default" : "outline"}
            onClick={() => { setMode("toRoman"); setInput(""); setResult(""); }}
            data-testid="button-to-roman"
          >
            Number → Roman
          </Button>
          <Button
            variant={mode === "toDecimal" ? "default" : "outline"}
            onClick={() => { setMode("toDecimal"); setInput(""); setResult(""); }}
            data-testid="button-to-decimal"
          >
            Roman → Number
          </Button>
        </div>

        <div className="space-y-2">
          <Label>{mode === "toRoman" ? "Enter Number (1-3999)" : "Enter Roman Numeral"}</Label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "toRoman" ? "e.g., 2024" : "e.g., MMXXIV"}
            data-testid="input-value"
          />
        </div>

        {result && (
          <ResultDisplay title="Result">
            <div className="flex items-center gap-2">
              <span className="flex-1 text-3xl font-bold text-primary text-center" data-testid="text-result">
                {result}
              </span>
              <CopyButton text={result} />
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function MorseCodeTranslator() {
  const tool = getToolById("morse-code")!;
  const [text, setText] = useState("");
  const [morse, setMorse] = useState("");
  const [mode, setMode] = useState<"toMorse" | "toText">("toMorse");

  const morseMap: Record<string, string> = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', ' ': '/', '.': '.-.-.-', ',': '--..--',
    '?': '..--..', '!': '-.-.--', "'": '.----.', '"': '.-..-.', '(': '-.--.',
    ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '/': '-..-.',
    '_': '..--.-', '=': '-...-', '+': '.-.-.', '-': '-....-', '@': '.--.-.'
  };

  const reverseMap = Object.fromEntries(Object.entries(morseMap).map(([k, v]) => [v, k]));

  const toMorse = (text: string): string => {
    return text.toUpperCase().split('').map(char => morseMap[char] || char).join(' ');
  };

  const toText = (morse: string): string => {
    return morse.split(' ').map(code => {
      if (code === '/') return ' ';
      return reverseMap[code] || code;
    }).join('');
  };

  useEffect(() => {
    if (mode === "toMorse") {
      setMorse(toMorse(text));
    } else {
      setText(toText(morse));
    }
  }, [text, morse, mode]);

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex gap-2">
          <Button
            variant={mode === "toMorse" ? "default" : "outline"}
            onClick={() => setMode("toMorse")}
            data-testid="button-to-morse"
          >
            Text → Morse
          </Button>
          <Button
            variant={mode === "toText" ? "default" : "outline"}
            onClick={() => setMode("toText")}
            data-testid="button-to-text"
          >
            Morse → Text
          </Button>
        </div>

        {mode === "toMorse" ? (
          <>
            <div className="space-y-2">
              <Label>Enter Text</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Hello World"
                className="min-h-[100px]"
                data-testid="textarea-text"
              />
            </div>
            <ResultDisplay title="Morse Code">
              <div className="flex items-start gap-2">
                <code className="flex-1 p-3 bg-background rounded text-lg tracking-wider" data-testid="text-morse">
                  {morse}
                </code>
                <CopyButton text={morse} />
              </div>
            </ResultDisplay>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Enter Morse Code (separate letters with spaces, words with /)</Label>
              <Textarea
                value={morse}
                onChange={(e) => setMorse(e.target.value)}
                placeholder=".... . .-.. .-.. --- / .-- --- .-. .-.. -.."
                className="min-h-[100px] font-mono"
                data-testid="textarea-morse"
              />
            </div>
            <ResultDisplay title="Text">
              <div className="flex items-start gap-2">
                <p className="flex-1 p-3 bg-background rounded text-lg" data-testid="text-result">
                  {text}
                </p>
                <CopyButton text={text} />
              </div>
            </ResultDisplay>
          </>
        )}
      </div>
    </ToolLayout>
  );
}

export function Stopwatch() {
  const tool = getToolById("stopwatch")!;
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  };

  const reset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const lap = () => {
    if (isRunning) {
      setLaps((prev) => [time, ...prev]);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6 text-center">
        <div className="p-8 bg-muted/50 rounded-xl">
          <p className="text-6xl font-mono font-bold" data-testid="display-time">
            {formatTime(time)}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            onClick={() => setIsRunning(!isRunning)}
            className="w-24"
            data-testid="button-toggle"
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={lap}
            disabled={!isRunning}
            data-testid="button-lap"
          >
            Lap
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={reset}
            data-testid="button-reset"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        {laps.length > 0 && (
          <ResultDisplay title="Laps">
            <div className="space-y-2 max-h-48 overflow-auto">
              {laps.map((lapTime, i) => (
                <div key={i} className="flex justify-between p-2 bg-background rounded">
                  <span className="text-muted-foreground">Lap {laps.length - i}</span>
                  <span className="font-mono">{formatTime(lapTime)}</span>
                </div>
              ))}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function CountdownTimer() {
  const tool = getToolById("countdown-timer")!;
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("5");
  const [seconds, setSeconds] = useState("0");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const start = () => {
    const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setIsRunning(true);
      setIsFinished(false);
    }
  };

  const formatTimeLeft = () => {
    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setIsFinished(false);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6 text-center">
        {!isRunning && timeLeft === 0 && !isFinished ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Hours</Label>
              <Input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="text-center text-2xl"
                data-testid="input-hours"
              />
            </div>
            <div className="space-y-2">
              <Label>Minutes</Label>
              <Input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="text-center text-2xl"
                data-testid="input-minutes"
              />
            </div>
            <div className="space-y-2">
              <Label>Seconds</Label>
              <Input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className="text-center text-2xl"
                data-testid="input-seconds"
              />
            </div>
          </div>
        ) : (
          <div className={`p-8 rounded-xl ${isFinished ? "bg-green-500/20" : "bg-muted/50"}`}>
            <p className={`text-6xl font-mono font-bold ${isFinished ? "text-green-500" : ""}`} data-testid="display-time">
              {isFinished ? "Done!" : formatTimeLeft()}
            </p>
          </div>
        )}

        <div className="flex justify-center gap-4">
          {!isRunning && timeLeft === 0 && !isFinished ? (
            <Button size="lg" onClick={start} className="w-32" data-testid="button-start">
              <Play className="w-5 h-5 mr-2" /> Start
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                onClick={() => setIsRunning(!isRunning)}
                className="w-24"
                disabled={isFinished}
                data-testid="button-toggle"
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button variant="outline" size="lg" onClick={reset} data-testid="button-reset">
                <RotateCcw className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

interface Habit {
  id: string;
  name: string;
  streak: number;
  completedDates: string[];
}

export function HabitTracker() {
  const tool = getToolById("habit-tracker")!;
  const [habits, setHabits] = useLocalStorage<Habit[]>("student-habits", []);
  const [newHabit, setNewHabit] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const addHabit = () => {
    if (!newHabit.trim()) return;
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.trim(),
      streak: 0,
      completedDates: [],
    };
    setHabits((prev) => [...prev, habit]);
    setNewHabit("");
  };

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const isCompleted = h.completedDates.includes(today);
        const newDates = isCompleted
          ? h.completedDates.filter((d) => d !== today)
          : [...h.completedDates, today];
        
        // Calculate streak
        let streak = 0;
        const sortedDates = [...newDates].sort().reverse();
        const todayDate = new Date(today);
        
        for (let i = 0; i < sortedDates.length; i++) {
          const checkDate = new Date(todayDate);
          checkDate.setDate(checkDate.getDate() - i);
          if (sortedDates.includes(checkDate.toISOString().split("T")[0])) {
            streak++;
          } else {
            break;
          }
        }

        return { ...h, completedDates: newDates, streak };
      })
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex gap-2">
          <Input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="Add a new habit..."
            data-testid="input-habit"
          />
          <Button onClick={addHabit} data-testid="button-add">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {habits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No habits yet. Add one above to start tracking!
            </p>
          ) : (
            habits.map((habit) => {
              const isCompleted = habit.completedDates.includes(today);
              return (
                <div
                  key={habit.id}
                  className={`flex items-center gap-3 p-4 rounded-lg ${
                    isCompleted ? "bg-green-500/10 border border-green-500/30" : "bg-muted/50"
                  }`}
                  data-testid={`habit-${habit.id}`}
                >
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => toggleHabit(habit.id)}
                    data-testid={`checkbox-${habit.id}`}
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {habit.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      🔥 {habit.streak} day streak
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteHabit(habit.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  createdAt: number;
}

export function BookmarkManager() {
  const tool = getToolById("bookmark-manager")!;
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("student-bookmarks", []);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("General");
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...new Set(bookmarks.map((b) => b.category))];

  const addBookmark = () => {
    if (!title.trim() || !url.trim()) return;
    const bookmark: Bookmark = {
      id: Date.now().toString(),
      title: title.trim(),
      url: url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`,
      category,
      createdAt: Date.now(),
    };
    setBookmarks((prev) => [bookmark, ...prev]);
    setTitle("");
    setUrl("");
  };

  const deleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const filteredBookmarks = filter === "All" ? bookmarks : bookmarks.filter((b) => b.category === filter);

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Google"
              data-testid="input-title"
            />
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., google.com"
              data-testid="input-url"
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Study"
              data-testid="input-category"
            />
          </div>
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button onClick={addBookmark} className="w-full" data-testid="button-add">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
        </div>

        {categories.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(cat)}
                data-testid={`button-filter-${cat}`}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {filteredBookmarks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No bookmarks yet. Add one above!
            </p>
          ) : (
            filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                data-testid={`bookmark-${bookmark.id}`}
              >
                <div className="flex-1 min-w-0">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {bookmark.title}
                  </a>
                  <p className="text-xs text-muted-foreground truncate">{bookmark.url}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    {bookmark.category}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteBookmark(bookmark.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
