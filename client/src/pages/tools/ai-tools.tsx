import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ToolLayout, LoadingSpinner, ResultDisplay } from "@/components/tool-layout";
import { getToolById } from "@/lib/tools-data";
import { Copy, Check, Sparkles, AlertTriangle } from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Button variant="outline" size="sm" onClick={copy} data-testid="button-copy">
      {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

function AIBadge({ configured }: { configured: boolean }) {
  return (
    <Badge variant={configured ? "default" : "secondary"} className="gap-1" data-testid="badge-ai-version">
      <Sparkles className="w-3 h-3" />
      {configured ? "Powered by Gemini AI" : "AI Not Configured"}
    </Badge>
  );
}

function AINotConfigured() {
  return (
    <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
      <div>
        <p className="font-medium text-amber-600 dark:text-amber-400">AI Service Not Configured</p>
        <p className="text-sm text-muted-foreground">
          Please add your GEMINI_API_KEY to enable AI features.
        </p>
      </div>
    </div>
  );
}

function useAIStatus() {
  const [configured, setConfigured] = useState(true);
  
  useEffect(() => {
    fetch("/api/ai/status")
      .then(res => res.json())
      .then(data => setConfigured(data.configured))
      .catch(() => setConfigured(false));
  }, []);
  
  return configured;
}

export function EssayGenerator() {
  const tool = getToolById("essay-generator")!;
  const [topic, setTopic] = useState("");
  const [essayType, setEssayType] = useState("argumentative");
  const [paragraphs, setParagraphs] = useState("5");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = useAIStatus();

  const generate = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, type: essayType, paragraphs: parseInt(paragraphs) })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate essay");
      }
      
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge configured={configured} />
        
        {!configured && <AINotConfigured />}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label>Essay Topic (max 500 characters)</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value.slice(0, 500))}
              placeholder="e.g., The Impact of Social Media on Education"
              data-testid="input-topic"
            />
            <p className="text-xs text-muted-foreground">{topic.length}/500</p>
          </div>
          <div className="space-y-2">
            <Label>Essay Type</Label>
            <Select value={essayType} onValueChange={setEssayType}>
              <SelectTrigger data-testid="select-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="argumentative">Argumentative</SelectItem>
                <SelectItem value="expository">Expository</SelectItem>
                <SelectItem value="descriptive">Descriptive</SelectItem>
                <SelectItem value="narrative">Narrative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Number of Paragraphs</Label>
          <Select value={paragraphs} onValueChange={setParagraphs}>
            <SelectTrigger className="w-32" data-testid="select-paragraphs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["3", "4", "5", "6", "7"].map(n => (
                <SelectItem key={n} value={n}>{n} paragraphs</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generate} disabled={loading || !topic.trim() || !configured} data-testid="button-generate">
          {loading ? "Generating..." : "Generate Essay"}
        </Button>

        {loading && <LoadingSpinner text="Generating essay with AI..." />}
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {result && !loading && (
          <ResultDisplay title="Generated Essay">
            <div className="flex justify-end mb-2">
              <CopyButton text={result} />
            </div>
            <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg max-h-96 overflow-auto" data-testid="text-result">
              {result}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function TextSummarizer() {
  const tool = getToolById("text-summarizer")!;
  const [text, setText] = useState("");
  const [length, setLength] = useState("medium");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = useAIStatus();

  const summarize = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, length })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to summarize");
      }
      
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge configured={configured} />
        
        {!configured && <AINotConfigured />}
        
        <div className="space-y-2">
          <Label>Text to Summarize (max 10,000 characters)</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 10000))}
            placeholder="Paste the text you want to summarize here..."
            className="min-h-[200px]"
            data-testid="textarea-input"
          />
          <p className="text-xs text-muted-foreground">{text.length}/10,000</p>
        </div>

        <div className="space-y-2">
          <Label>Summary Length</Label>
          <Select value={length} onValueChange={setLength}>
            <SelectTrigger className="w-40" data-testid="select-length">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={summarize} disabled={loading || !text.trim() || !configured} data-testid="button-summarize">
          {loading ? "Summarizing..." : "Summarize Text"}
        </Button>

        {loading && <LoadingSpinner text="Summarizing with AI..." />}
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {result && !loading && (
          <ResultDisplay title="Summary">
            <div className="flex justify-end mb-2">
              <CopyButton text={result} />
            </div>
            <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg" data-testid="text-result">
              {result}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function Paraphraser() {
  const tool = getToolById("paraphraser")!;
  const [text, setText] = useState("");
  const [style, setStyle] = useState("standard");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = useAIStatus();

  const paraphrase = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai/paraphrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, style })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to paraphrase");
      }
      
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge configured={configured} />
        
        {!configured && <AINotConfigured />}
        
        <div className="space-y-2">
          <Label>Original Text (max 5,000 characters)</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 5000))}
            placeholder="Enter the text you want to paraphrase..."
            className="min-h-[200px]"
            data-testid="textarea-input"
          />
          <p className="text-xs text-muted-foreground">{text.length}/5,000</p>
        </div>

        <div className="space-y-2">
          <Label>Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger className="w-40" data-testid="select-style">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="simple">Simple</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={paraphrase} disabled={loading || !text.trim() || !configured} data-testid="button-paraphrase">
          {loading ? "Paraphrasing..." : "Paraphrase Text"}
        </Button>

        {loading && <LoadingSpinner text="Paraphrasing with AI..." />}
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {result && !loading && (
          <ResultDisplay title="Paraphrased Result">
            <div className="flex justify-end mb-2">
              <CopyButton text={result} />
            </div>
            <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg" data-testid="text-result">
              {result}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function GrammarChecker() {
  const tool = getToolById("grammar-checker")!;
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ corrected: string; issues: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = useAIStatus();

  const check = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to check grammar");
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge configured={configured} />
        
        {!configured && <AINotConfigured />}
        
        <div className="space-y-2">
          <Label>Text to Check (max 5,000 characters)</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 5000))}
            placeholder="Enter text to check for grammar errors..."
            className="min-h-[200px]"
            data-testid="textarea-input"
          />
          <p className="text-xs text-muted-foreground">{text.length}/5,000</p>
        </div>

        <Button onClick={check} disabled={loading || !text.trim() || !configured} data-testid="button-check">
          {loading ? "Checking..." : "Check Grammar"}
        </Button>

        {loading && <LoadingSpinner text="Checking grammar with AI..." />}
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {result && !loading && (
          <>
            <ResultDisplay title={`Issues Found (${result.issues.length})`}>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {result.issues.map((issue, i) => (
                  <li key={i} className={issue.toLowerCase().includes("no") && issue.toLowerCase().includes("issue") ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}>
                    {issue}
                  </li>
                ))}
              </ul>
            </ResultDisplay>
            
            <ResultDisplay title="Corrected Text">
              <div className="flex justify-end mb-2">
                <CopyButton text={result.corrected} />
              </div>
              <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg" data-testid="text-result">
                {result.corrected}
              </div>
            </ResultDisplay>
          </>
        )}
      </div>
    </ToolLayout>
  );
}

export function NotesGenerator() {
  const tool = getToolById("notes-generator")!;
  const [text, setText] = useState("");
  const [format, setFormat] = useState("bullet");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = useAIStatus();

  const generate = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, format })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate notes");
      }
      
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge configured={configured} />
        
        {!configured && <AINotConfigured />}
        
        <div className="space-y-2">
          <Label>Source Text (max 10,000 characters)</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 10000))}
            placeholder="Paste the text you want to create notes from..."
            className="min-h-[200px]"
            data-testid="textarea-input"
          />
          <p className="text-xs text-muted-foreground">{text.length}/10,000</p>
        </div>

        <div className="space-y-2">
          <Label>Format</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-48" data-testid="select-format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bullet">Bullet Points</SelectItem>
              <SelectItem value="numbered">Numbered List</SelectItem>
              <SelectItem value="cornell">Cornell Style</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generate} disabled={loading || !text.trim() || !configured} data-testid="button-generate">
          {loading ? "Generating..." : "Generate Notes"}
        </Button>

        {loading && <LoadingSpinner text="Generating notes with AI..." />}
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {result && !loading && (
          <ResultDisplay title="Generated Notes">
            <div className="flex justify-end mb-2">
              <CopyButton text={result} />
            </div>
            <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg font-mono" data-testid="text-result">
              {result}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function QuestionGenerator() {
  const tool = getToolById("question-generator")!;
  const [text, setText] = useState("");
  const [questionType, setQuestionType] = useState("mixed");
  const [count, setCount] = useState("5");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = useAIStatus();

  const generate = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type: questionType, count: parseInt(count) })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions");
      }
      
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge configured={configured} />
        
        {!configured && <AINotConfigured />}
        
        <div className="space-y-2">
          <Label>Source Text (max 10,000 characters)</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 10000))}
            placeholder="Paste the content you want to generate questions from..."
            className="min-h-[200px]"
            data-testid="textarea-input"
          />
          <p className="text-xs text-muted-foreground">{text.length}/10,000</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select value={questionType} onValueChange={setQuestionType}>
              <SelectTrigger data-testid="select-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="what">What Questions</SelectItem>
                <SelectItem value="how">How Questions</SelectItem>
                <SelectItem value="why">Why Questions</SelectItem>
                <SelectItem value="tf">True/False</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Number of Questions</Label>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger data-testid="select-count">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["3", "5", "7", "10"].map(n => (
                  <SelectItem key={n} value={n}>{n} questions</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={generate} disabled={loading || !text.trim() || !configured} data-testid="button-generate">
          {loading ? "Generating..." : "Generate Questions"}
        </Button>

        {loading && <LoadingSpinner text="Generating questions with AI..." />}
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {result && !loading && (
          <ResultDisplay title="Generated Questions">
            <div className="flex justify-end mb-2">
              <CopyButton text={result} />
            </div>
            <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg" data-testid="text-result">
              {result}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function CheatSheetGenerator() {
  const tool = getToolById("cheatsheet-generator")!;
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("intermediate");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = useAIStatus();

  const generate = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai/cheatsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate cheat sheet");
      }
      
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge configured={configured} />
        
        {!configured && <AINotConfigured />}
        
        <div className="space-y-2">
          <Label>Topic (max 200 characters)</Label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value.slice(0, 200))}
            placeholder="e.g., Quadratic Equations, JavaScript Arrays, French Verbs"
            data-testid="input-topic"
          />
          <p className="text-xs text-muted-foreground">{topic.length}/200</p>
        </div>

        <div className="space-y-2">
          <Label>Difficulty Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-48" data-testid="select-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generate} disabled={loading || !topic.trim() || !configured} data-testid="button-generate">
          {loading ? "Generating..." : "Generate Cheat Sheet"}
        </Button>

        {loading && <LoadingSpinner text="Creating cheat sheet with AI..." />}
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {result && !loading && (
          <ResultDisplay title={`${topic} Cheat Sheet`}>
            <div className="flex justify-end mb-2">
              <CopyButton text={result} />
            </div>
            <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg" data-testid="text-result">
              {result}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function TopicExplainer() {
  const tool = getToolById("topic-explainer")!;
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("beginner");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = useAIStatus();

  const explain = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to explain topic");
      }
      
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge configured={configured} />
        
        {!configured && <AINotConfigured />}
        
        <div className="space-y-2">
          <Label>Topic to Explain (max 200 characters)</Label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value.slice(0, 200))}
            placeholder="e.g., Photosynthesis, Machine Learning, Supply and Demand"
            data-testid="input-topic"
          />
          <p className="text-xs text-muted-foreground">{topic.length}/200</p>
        </div>

        <div className="space-y-2">
          <Label>Explanation Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-48" data-testid="select-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner (Simple)</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced (Detailed)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={explain} disabled={loading || !topic.trim() || !configured} data-testid="button-explain">
          {loading ? "Explaining..." : "Explain Topic"}
        </Button>

        {loading && <LoadingSpinner text="Generating explanation with AI..." />}
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {result && !loading && (
          <ResultDisplay title={`Understanding: ${topic}`}>
            <div className="flex justify-end mb-2">
              <CopyButton text={result} />
            </div>
            <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg" data-testid="text-result">
              {result}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function YouTubeVideoSummarizer() {
  const tool = getToolById("youtube-summarizer")!;
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<{ summary: string; highlights: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = useAIStatus();

  const summarize = async () => {
    if (!transcript.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai/youtube-summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to summarize video");
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge configured={configured} />
        
        {!configured && <AINotConfigured />}
        
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <strong>How to use:</strong> Paste the YouTube video transcript below. This tool summarizes publicly available YouTube captions and transcripts only.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label>YouTube Video Transcript (max 20,000 characters)</Label>
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value.slice(0, 20000))}
            placeholder="Paste the YouTube video transcript here. You can get transcripts from YouTube's 'Show Transcript' feature or use a transcript extraction tool."
            className="min-h-[250px]"
            data-testid="textarea-transcript"
          />
          <p className="text-xs text-muted-foreground">{transcript.length}/20,000</p>
        </div>

        <Button onClick={summarize} disabled={loading || !transcript.trim() || !configured} data-testid="button-summarize-video">
          {loading ? "Summarizing..." : "Summarize Video"}
        </Button>

        {loading && <LoadingSpinner text="Analyzing video transcript with AI..." />}
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {result && !loading && (
          <>
            <ResultDisplay title="Summary">
              <div className="flex justify-end mb-2">
                <CopyButton text={result.summary} />
              </div>
              <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg" data-testid="text-summary">
                {result.summary}
              </div>
            </ResultDisplay>
            
            {result.highlights.length > 0 && (
              <ResultDisplay title="Key Highlights">
                <ul className="space-y-2">
                  {result.highlights.map((highlight, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-primary font-semibold shrink-0">•</span>
                      <span className="text-sm">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </ResultDisplay>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}
