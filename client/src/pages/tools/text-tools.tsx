import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolLayout, ResultDisplay } from "@/components/tool-layout";
import { getToolById } from "@/lib/tools-data";
import { Copy, Check } from "lucide-react";

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

export function WordCounter() {
  const tool = getToolById("word-counter")!;
  const [text, setText] = useState("");

  const stats = {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, "").length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    sentences: text.split(/[.!?]+/).filter(s => s.trim()).length,
    paragraphs: text.split(/\n\n+/).filter(p => p.trim()).length,
    lines: text.split("\n").length,
    readingTime: Math.ceil((text.trim() ? text.trim().split(/\s+/).length : 0) / 200),
    speakingTime: Math.ceil((text.trim() ? text.trim().split(/\s+/).length : 0) / 150),
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Enter your text</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here..."
            className="min-h-[200px]"
            data-testid="textarea-input"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Words", value: stats.words },
            { label: "Characters", value: stats.characters },
            { label: "Characters (no spaces)", value: stats.charactersNoSpaces },
            { label: "Sentences", value: stats.sentences },
            { label: "Paragraphs", value: stats.paragraphs },
            { label: "Lines", value: stats.lines },
            { label: "Reading Time", value: `${stats.readingTime} min` },
            { label: "Speaking Time", value: `${stats.speakingTime} min` },
          ].map((stat) => (
            <div key={stat.label} className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}

export function TextCaseConverter() {
  const tool = getToolById("text-case-converter")!;
  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const convert = (type: string) => {
    let converted = "";
    switch (type) {
      case "upper": converted = text.toUpperCase(); break;
      case "lower": converted = text.toLowerCase(); break;
      case "title": converted = text.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase()); break;
      case "sentence": converted = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()); break;
      case "alternate": converted = text.split("").map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(""); break;
      case "inverse": converted = text.split("").map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(""); break;
      default: converted = text;
    }
    setResult(converted);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Enter text to convert</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="min-h-[120px]"
            data-testid="textarea-input"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { type: "upper", label: "UPPERCASE" },
            { type: "lower", label: "lowercase" },
            { type: "title", label: "Title Case" },
            { type: "sentence", label: "Sentence case" },
            { type: "alternate", label: "aLtErNaTe" },
            { type: "inverse", label: "InVeRsE" },
          ].map((btn) => (
            <Button key={btn.type} variant="outline" onClick={() => convert(btn.type)} data-testid={`button-${btn.type}`}>
              {btn.label}
            </Button>
          ))}
        </div>

        {result && (
          <ResultDisplay title="Converted Text">
            <div className="flex items-start gap-2">
              <p className="flex-1 whitespace-pre-wrap" data-testid="text-result">{result}</p>
              <CopyButton text={result} />
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function LoremIpsumGenerator() {
  const tool = getToolById("lorem-ipsum-generator")!;
  const [count, setCount] = useState("3");
  const [type, setType] = useState("paragraphs");
  const [result, setResult] = useState("");

  const loremWords = "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");

  const generate = () => {
    const num = parseInt(count) || 1;
    let output = "";

    if (type === "words") {
      const words = [];
      for (let i = 0; i < num; i++) {
        words.push(loremWords[i % loremWords.length]);
      }
      output = words.join(" ");
    } else if (type === "sentences") {
      const sentences = [];
      for (let i = 0; i < num; i++) {
        const sentenceLength = 8 + Math.floor(Math.random() * 10);
        const words = [];
        for (let j = 0; j < sentenceLength; j++) {
          words.push(loremWords[(i * sentenceLength + j) % loremWords.length]);
        }
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        sentences.push(words.join(" ") + ".");
      }
      output = sentences.join(" ");
    } else {
      const paragraphs = [];
      for (let i = 0; i < num; i++) {
        const sentenceCount = 4 + Math.floor(Math.random() * 4);
        const sentences = [];
        for (let j = 0; j < sentenceCount; j++) {
          const sentenceLength = 8 + Math.floor(Math.random() * 10);
          const words = [];
          for (let k = 0; k < sentenceLength; k++) {
            words.push(loremWords[(i * 100 + j * 20 + k) % loremWords.length]);
          }
          words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
          sentences.push(words.join(" ") + ".");
        }
        paragraphs.push(sentences.join(" "));
      }
      output = paragraphs.join("\n\n");
    }

    setResult(output);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Number</Label>
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
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger data-testid="select-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="words">Words</SelectItem>
                <SelectItem value="sentences">Sentences</SelectItem>
                <SelectItem value="paragraphs">Paragraphs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={generate} className="w-full" data-testid="button-generate">
          Generate Lorem Ipsum
        </Button>

        {result && (
          <ResultDisplay title="Generated Text">
            <div className="flex items-start gap-2">
              <p className="flex-1 whitespace-pre-wrap text-sm" data-testid="text-result">{result}</p>
              <CopyButton text={result} />
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function FindReplace() {
  const tool = getToolById("find-replace")!;
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [result, setResult] = useState("");
  const [matchCount, setMatchCount] = useState(0);

  const handleReplace = () => {
    if (!find) return;
    const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi');
    const matches = text.match(regex);
    setMatchCount(matches ? matches.length : 0);
    setResult(text.replace(regex, replace));
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Enter your text</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here..."
            className="min-h-[150px]"
            data-testid="textarea-input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Find</Label>
            <Input
              value={find}
              onChange={(e) => setFind(e.target.value)}
              placeholder="Text to find"
              data-testid="input-find"
            />
          </div>
          <div className="space-y-2">
            <Label>Replace with</Label>
            <Input
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              placeholder="Replacement text"
              data-testid="input-replace"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Case sensitive</span>
          </label>
        </div>

        <Button onClick={handleReplace} className="w-full" data-testid="button-replace">
          Find & Replace
        </Button>

        {result && (
          <ResultDisplay title={`Result (${matchCount} replacements)`}>
            <div className="flex items-start gap-2">
              <p className="flex-1 whitespace-pre-wrap" data-testid="text-result">{result}</p>
              <CopyButton text={result} />
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function RemoveDuplicates() {
  const tool = getToolById("remove-duplicates")!;
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [stats, setStats] = useState({ original: 0, unique: 0, removed: 0 });

  const removeDuplicates = () => {
    const lines = text.split("\n");
    const unique = [...new Set(lines)];
    setResult(unique.join("\n"));
    setStats({
      original: lines.length,
      unique: unique.length,
      removed: lines.length - unique.length,
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Enter text (one item per line)</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text with one item per line..."
            className="min-h-[150px]"
            data-testid="textarea-input"
          />
        </div>

        <Button onClick={removeDuplicates} className="w-full" data-testid="button-remove">
          Remove Duplicates
        </Button>

        {result && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-xl font-bold">{stats.original}</p>
                <p className="text-xs text-muted-foreground">Original Lines</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-xl font-bold text-primary">{stats.unique}</p>
                <p className="text-xs text-muted-foreground">Unique Lines</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-xl font-bold text-red-500">{stats.removed}</p>
                <p className="text-xs text-muted-foreground">Removed</p>
              </div>
            </div>

            <ResultDisplay title="Result">
              <div className="flex items-start gap-2">
                <pre className="flex-1 whitespace-pre-wrap text-sm" data-testid="text-result">{result}</pre>
                <CopyButton text={result} />
              </div>
            </ResultDisplay>
          </>
        )}
      </div>
    </ToolLayout>
  );
}

export function TextDiff() {
  const tool = getToolById("text-diff")!;
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [diff, setDiff] = useState<{ type: string; value: string }[]>([]);

  const compare = () => {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    const result: { type: string; value: string }[] = [];

    let i = 0, j = 0;
    while (i < words1.length || j < words2.length) {
      if (i >= words1.length) {
        result.push({ type: "added", value: words2[j] });
        j++;
      } else if (j >= words2.length) {
        result.push({ type: "removed", value: words1[i] });
        i++;
      } else if (words1[i] === words2[j]) {
        result.push({ type: "same", value: words1[i] });
        i++; j++;
      } else {
        result.push({ type: "removed", value: words1[i] });
        result.push({ type: "added", value: words2[j] });
        i++; j++;
      }
    }
    setDiff(result);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Original Text</Label>
            <Textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              placeholder="Enter original text..."
              className="min-h-[150px]"
              data-testid="textarea-original"
            />
          </div>
          <div className="space-y-2">
            <Label>Modified Text</Label>
            <Textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              placeholder="Enter modified text..."
              className="min-h-[150px]"
              data-testid="textarea-modified"
            />
          </div>
        </div>

        <Button onClick={compare} className="w-full" data-testid="button-compare">
          Compare Texts
        </Button>

        {diff.length > 0 && (
          <ResultDisplay title="Differences">
            <div className="p-4 bg-background rounded-lg font-mono text-sm leading-relaxed">
              {diff.map((d, i) => (
                <span
                  key={i}
                  className={
                    d.type === "added" ? "bg-green-500/20 text-green-600 dark:text-green-400" :
                    d.type === "removed" ? "bg-red-500/20 text-red-600 dark:text-red-400 line-through" :
                    ""
                  }
                >
                  {d.value}{" "}
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500/20 rounded" /> Added
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500/20 rounded" /> Removed
              </span>
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function MarkdownPreview() {
  const tool = getToolById("markdown-preview")!;
  const [markdown, setMarkdown] = useState("# Hello World\n\nThis is **bold** and this is *italic*.\n\n## Lists\n\n- Item 1\n- Item 2\n- Item 3\n\n## Code\n\n`inline code`\n\n```\ncode block\n```");

  const renderMarkdown = (md: string) => {
    return md
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-muted p-3 rounded-lg my-2 overflow-x-auto"><code>$1</code></pre>')
      .replace(/`(.*?)`/gim, '<code class="bg-muted px-1 rounded text-sm">$1</code>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n/gim, '<br/>');
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
        <div className="space-y-2">
          <Label>Markdown</Label>
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Enter markdown..."
            className="min-h-[350px] font-mono text-sm"
            data-testid="textarea-markdown"
          />
        </div>
        <div className="space-y-2">
          <Label>Preview</Label>
          <div
            className="p-4 bg-muted/50 rounded-lg min-h-[350px] overflow-auto prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
            data-testid="div-preview"
          />
        </div>
      </div>
    </ToolLayout>
  );
}

export function JsonFormatter() {
  const tool = getToolById("json-formatter")!;
  const [input, setInput] = useState('{"name":"John","age":30,"city":"New York"}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState("2");

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, parseInt(indent)));
      setError("");
    } catch (e) {
      setError("Invalid JSON: " + (e as Error).message);
      setOutput("");
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e) {
      setError("Invalid JSON: " + (e as Error).message);
      setOutput("");
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>JSON Input</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            className="min-h-[150px] font-mono text-sm"
            data-testid="textarea-input"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Indent:</Label>
            <Select value={indent} onValueChange={setIndent}>
              <SelectTrigger className="w-20" data-testid="select-indent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="8">8</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={format} data-testid="button-format">Format</Button>
          <Button variant="outline" onClick={minify} data-testid="button-minify">Minify</Button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 text-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}

        {output && (
          <ResultDisplay title="Formatted JSON">
            <div className="flex items-start gap-2">
              <pre className="flex-1 whitespace-pre-wrap font-mono text-sm overflow-x-auto" data-testid="text-result">
                {output}
              </pre>
              <CopyButton text={output} />
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function TextToSlug() {
  const tool = getToolById("text-to-slug")!;
  const [text, setText] = useState("");
  const [separator, setSeparator] = useState("-");

  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, separator)
    .replace(/^-+|-+$/g, "");

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Enter text</Label>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., Hello World! This is a Test"
            data-testid="input-text"
          />
        </div>

        <div className="space-y-2">
          <Label>Separator</Label>
          <Select value={separator} onValueChange={setSeparator}>
            <SelectTrigger className="w-32" data-testid="select-separator">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-">Hyphen (-)</SelectItem>
              <SelectItem value="_">Underscore (_)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {slug && (
          <ResultDisplay title="URL Slug">
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-background rounded font-mono" data-testid="text-result">
                {slug}
              </code>
              <CopyButton text={slug} />
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function TextReverser() {
  const tool = getToolById("text-reverser")!;
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"characters" | "words" | "lines">("characters");

  const getReversed = () => {
    switch (mode) {
      case "characters": return text.split("").reverse().join("");
      case "words": return text.split(" ").reverse().join(" ");
      case "lines": return text.split("\n").reverse().join("\n");
      default: return text;
    }
  };

  const reversed = getReversed();

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Enter text to reverse</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your text here..."
            className="min-h-[100px]"
            data-testid="textarea-input"
          />
        </div>

        <div className="flex gap-2">
          {(["characters", "words", "lines"] as const).map((m) => (
            <Button
              key={m}
              variant={mode === m ? "default" : "outline"}
              onClick={() => setMode(m)}
              data-testid={`button-${m}`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Button>
          ))}
        </div>

        {reversed && text && (
          <ResultDisplay title="Reversed Text">
            <div className="flex items-start gap-2">
              <p className="flex-1 whitespace-pre-wrap" data-testid="text-result">{reversed}</p>
              <CopyButton text={reversed} />
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function TextSorter() {
  const tool = getToolById("text-sorter")!;
  const [text, setText] = useState("");
  const [sortType, setSortType] = useState<"alpha" | "alphaReverse" | "length" | "lengthReverse">("alpha");
  const [result, setResult] = useState("");

  const sort = () => {
    const lines = text.split("\n").filter(l => l.trim());
    let sorted: string[];
    
    switch (sortType) {
      case "alpha":
        sorted = lines.sort((a, b) => a.localeCompare(b));
        break;
      case "alphaReverse":
        sorted = lines.sort((a, b) => b.localeCompare(a));
        break;
      case "length":
        sorted = lines.sort((a, b) => a.length - b.length);
        break;
      case "lengthReverse":
        sorted = lines.sort((a, b) => b.length - a.length);
        break;
      default:
        sorted = lines;
    }
    
    setResult(sorted.join("\n"));
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Enter text (one item per line)</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter lines to sort..."
            className="min-h-[150px]"
            data-testid="textarea-input"
          />
        </div>

        <div className="space-y-2">
          <Label>Sort Type</Label>
          <Select value={sortType} onValueChange={(v) => setSortType(v as typeof sortType)}>
            <SelectTrigger data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alpha">A → Z</SelectItem>
              <SelectItem value="alphaReverse">Z → A</SelectItem>
              <SelectItem value="length">Shortest First</SelectItem>
              <SelectItem value="lengthReverse">Longest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={sort} className="w-full" data-testid="button-sort">
          Sort Lines
        </Button>

        {result && (
          <ResultDisplay title="Sorted Text">
            <div className="flex items-start gap-2">
              <pre className="flex-1 whitespace-pre-wrap" data-testid="text-result">{result}</pre>
              <CopyButton text={result} />
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function TextEncoder() {
  const tool = getToolById("text-encoder")!;
  const [text, setText] = useState("");
  const [encodingType, setEncodingType] = useState("base64");
  const [result, setResult] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const process = () => {
    try {
      if (mode === "encode") {
        switch (encodingType) {
          case "base64":
            setResult(btoa(text));
            break;
          case "url":
            setResult(encodeURIComponent(text));
            break;
          case "html":
            setResult(text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"));
            break;
        }
      } else {
        switch (encodingType) {
          case "base64":
            setResult(atob(text));
            break;
          case "url":
            setResult(decodeURIComponent(text));
            break;
          case "html":
            setResult(text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"'));
            break;
        }
      }
    } catch {
      setResult("Error: Invalid input for decoding");
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Enter text</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to encode/decode..."
            className="min-h-[100px]"
            data-testid="textarea-input"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            <Button
              variant={mode === "encode" ? "default" : "outline"}
              onClick={() => setMode("encode")}
              data-testid="button-encode"
            >
              Encode
            </Button>
            <Button
              variant={mode === "decode" ? "default" : "outline"}
              onClick={() => setMode("decode")}
              data-testid="button-decode"
            >
              Decode
            </Button>
          </div>
          
          <Select value={encodingType} onValueChange={setEncodingType}>
            <SelectTrigger className="w-32" data-testid="select-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="base64">Base64</SelectItem>
              <SelectItem value="url">URL</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={process} data-testid="button-process">
            {mode === "encode" ? "Encode" : "Decode"}
          </Button>
        </div>

        {result && (
          <ResultDisplay title="Result">
            <div className="flex items-start gap-2">
              <pre className="flex-1 whitespace-pre-wrap font-mono text-sm" data-testid="text-result">{result}</pre>
              <CopyButton text={result} />
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}
