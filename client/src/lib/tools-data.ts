import {
  Calculator,
  Percent,
  Wallet,
  GraduationCap,
  Calendar,
  Clock,
  Ruler,
  Image,
  Crop,
  Minimize2,
  FileImage,
  Palette,
  Eye,
  FileText,
  FilePlus,
  Scissors,
  ArrowUpDown,
  FileOutput,
  RotateCw,
  Info,
  StickyNote,
  CheckSquare,
  Timer,
  BookOpen,
  ClipboardList,
  CalendarDays,
  Hourglass,
  Sparkles,
  FileEdit,
  AlignLeft,
  Wand2,
  SpellCheck,
  FileQuestion,
  ListChecks,
  Lightbulb,
  LucideIcon,
  Music,
  Video,
  Mic,
  Play,
  Volume2,
  Film,
  FileArchive,
  Settings2,
  Droplets,
  Layers,
  Grid3x3,
  Focus,
  Type,
  Hash,
  CreditCard,
  TrendingUp,
  Receipt,
  PiggyBank,
  Coins,
  DollarSign,
  Key,
  QrCode,
  Shuffle,
  Fingerprint,
  Binary,
  Scale,
  Globe,
  BookMarked,
  Brain,
  FlaskConical,
  BarChart,
  Link,
  Copy,
  RefreshCw,
  Languages,
  Quote,
  FileCheck,
  UserCheck,
  Target,
  Zap,
  Award,
  HelpCircle,
  MessageSquare,
  Search,
  Replace,
  AlertTriangle,
  Heart
} from "lucide-react";

export type ToolCategory = "calculators" | "image" | "pdf" | "student" | "media" | "text" | "finance" | "utility";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  keywords: string[];
  path: string;
}

export const categoryInfo: Record<ToolCategory, { name: string; icon: LucideIcon; color: string }> = {
  calculators: { name: "Calculators", icon: Calculator, color: "bg-blue-500" },
  image: { name: "Image Tools", icon: Image, color: "bg-purple-500" },
  pdf: { name: "PDF Tools", icon: FileText, color: "bg-red-500" },
  student: { name: "Student Tools", icon: GraduationCap, color: "bg-green-500" },
  media: { name: "Media Tools", icon: Film, color: "bg-pink-500" },
  text: { name: "Text & Writing", icon: Type, color: "bg-orange-500" },
  finance: { name: "Finance", icon: Wallet, color: "bg-emerald-500" },
  utility: { name: "Utilities", icon: Wand2, color: "bg-cyan-500" },
};

export const tools: Tool[] = [
  // UNIVERSAL CONVERTER
  { id: "universal-file-converter", name: "Universal File Converter", description: "Convert between PDF, DOCX, PPTX, TXT, and images", category: "pdf", icon: FileEdit, keywords: ["convert", "file", "format", "universal"], path: "/tools/universal-file-converter" },

  // CALCULATORS (14)
  { id: "scientific-calculator", name: "Scientific Calculator", description: "Advanced mathematical calculations", category: "calculators", icon: Calculator, keywords: ["math", "sin", "cos", "tan", "log", "power", "scientific"], path: "/tools/scientific-calculator" },
  { id: "percentage-calculator", name: "Percentage Calculator", description: "Calculate percentages easily", category: "calculators", icon: Percent, keywords: ["percent", "ratio", "discount"], path: "/tools/percentage-calculator" },
  { id: "emi-calculator", name: "EMI Calculator", description: "Calculate loan EMI payments", category: "calculators", icon: Wallet, keywords: ["loan", "interest", "monthly", "payment", "finance"], path: "/tools/emi-calculator" },
  { id: "gpa-calculator", name: "GPA Calculator", description: "Calculate your Grade Point Average", category: "calculators", icon: GraduationCap, keywords: ["grades", "score", "academic", "semester"], path: "/tools/gpa-calculator" },
  { id: "cgpa-calculator", name: "CGPA Calculator", description: "Calculate Cumulative GPA", category: "calculators", icon: GraduationCap, keywords: ["grades", "cumulative", "overall", "academic"], path: "/tools/cgpa-calculator" },
  { id: "age-calculator", name: "Age Calculator", description: "Calculate age from date of birth", category: "calculators", icon: Calendar, keywords: ["birthday", "years", "months", "days"], path: "/tools/age-calculator" },
  { id: "unit-converter", name: "Unit Converter", description: "Convert between different units", category: "calculators", icon: Ruler, keywords: ["length", "weight", "temperature", "convert"], path: "/tools/unit-converter" },
  { id: "time-duration", name: "Time Duration Calculator", description: "Calculate time between dates", category: "calculators", icon: Clock, keywords: ["hours", "minutes", "difference", "duration"], path: "/tools/time-duration" },
  { id: "bmi-calculator", name: "BMI Calculator", description: "Calculate Body Mass Index", category: "calculators", icon: Scale, keywords: ["body", "mass", "index", "health", "weight"], path: "/tools/bmi-calculator" },
  { id: "grade-needed", name: "Grade Needed Calculator", description: "Calculate grade needed for target GPA", category: "calculators", icon: Target, keywords: ["grade", "target", "gpa", "exam", "score"], path: "/tools/grade-needed" },
  { id: "quadratic-solver", name: "Quadratic Equation Solver", description: "Solve quadratic equations ax² + bx + c = 0", category: "calculators", icon: FlaskConical, keywords: ["quadratic", "equation", "solve", "math", "roots"], path: "/tools/quadratic-solver" },
  { id: "statistics-calculator", name: "Statistics Calculator", description: "Calculate mean, median, mode, std deviation", category: "calculators", icon: BarChart, keywords: ["statistics", "mean", "median", "mode", "std"], path: "/tools/statistics-calculator" },
  { id: "binary-converter", name: "Binary/Decimal Converter", description: "Convert between binary, decimal, hex, octal", category: "calculators", icon: Binary, keywords: ["binary", "decimal", "hex", "octal", "convert"], path: "/tools/binary-converter" },
  { id: "fraction-calculator", name: "Fraction Calculator", description: "Add, subtract, multiply, divide fractions", category: "calculators", icon: Percent, keywords: ["fraction", "math", "add", "divide"], path: "/tools/fraction-calculator" },

  // IMAGE TOOLS (15)
  { id: "image-resizer", name: "Image Resizer", description: "Resize images to any dimension", category: "image", icon: Image, keywords: ["resize", "scale", "dimension", "photo"], path: "/tools/image-resizer" },
  { id: "image-cropper", name: "Image Cropper", description: "Crop images to your needs", category: "image", icon: Crop, keywords: ["crop", "trim", "cut", "photo"], path: "/tools/image-cropper" },
  { id: "image-compressor", name: "Image Compressor", description: "Compress images to reduce size", category: "image", icon: Minimize2, keywords: ["compress", "optimize", "reduce", "size"], path: "/tools/image-compressor" },
  { id: "advanced-compressor", name: "Advanced Image Compressor", description: "Compress to exact target size in KB", category: "image", icon: FileArchive, keywords: ["compress", "target", "kb", "size", "optimize"], path: "/tools/advanced-compressor" },
  { id: "image-quality", name: "Image Quality Controller", description: "Adjust image quality with precision", category: "image", icon: Settings2, keywords: ["quality", "adjust", "slider", "control"], path: "/tools/image-quality" },
  { id: "jpg-to-png", name: "JPG to PNG", description: "Convert JPG images to PNG format", category: "image", icon: FileImage, keywords: ["convert", "format", "transparent"], path: "/tools/jpg-to-png" },
  { id: "png-to-jpg", name: "PNG to JPG", description: "Convert PNG images to JPG format", category: "image", icon: FileImage, keywords: ["convert", "format", "jpeg"], path: "/tools/png-to-jpg" },
  { id: "image-grayscale", name: "Image Grayscale", description: "Convert images to black and white", category: "image", icon: Palette, keywords: ["black", "white", "monochrome", "filter"], path: "/tools/image-grayscale" },
  { id: "image-preview", name: "Image Preview Tool", description: "Preview and analyze images", category: "image", icon: Eye, keywords: ["view", "analyze", "info", "metadata"], path: "/tools/image-preview" },
  { id: "image-dpi-changer", name: "Image DPI Changer", description: "Adjust image DPI/resolution", category: "image", icon: Grid3x3, keywords: ["dpi", "resolution", "ppi", "density"], path: "/tools/image-dpi-changer" },
  { id: "image-metadata-remover", name: "Image Metadata Remover", description: "Remove EXIF and metadata from images", category: "image", icon: Sparkles, keywords: ["remove", "exif", "clean", "metadata", "privacy"], path: "/tools/image-metadata-remover" },
  { id: "image-border-adder", name: "Image Border Adder", description: "Add borders and frames to images", category: "image", icon: Layers, keywords: ["border", "frame", "add", "style"], path: "/tools/image-border-adder" },
  { id: "image-text-overlay", name: "Image Text Overlay", description: "Add text overlays to images", category: "image", icon: FileEdit, keywords: ["text", "overlay", "watermark", "add"], path: "/tools/image-text-overlay" },
  { id: "image-background-blur", name: "Image Background Blur", description: "Blur image background intelligently", category: "image", icon: Focus, keywords: ["blur", "background", "focus", "effect"], path: "/tools/image-background-blur" },
  { id: "image-aspect-ratio", name: "Image Aspect Ratio Fixer", description: "Fix image aspect ratios (Instagram, YouTube, etc)", category: "image", icon: Crop, keywords: ["aspect", "ratio", "resize", "instagram", "youtube"], path: "/tools/image-aspect-ratio" },

  // PDF TOOLS (10)
  { id: "pdf-merge", name: "PDF Merge", description: "Combine multiple PDFs into one", category: "pdf", icon: FilePlus, keywords: ["combine", "join", "merge", "document"], path: "/tools/pdf-merge" },
  { id: "pdf-split", name: "PDF Split", description: "Split PDF into multiple files", category: "pdf", icon: Scissors, keywords: ["separate", "divide", "extract"], path: "/tools/pdf-split" },
  { id: "pdf-reorder", name: "PDF Page Reorder", description: "Rearrange pages in a PDF", category: "pdf", icon: ArrowUpDown, keywords: ["arrange", "order", "pages", "sort"], path: "/tools/pdf-reorder" },
  { id: "images-to-pdf", name: "Images to PDF", description: "Convert images to PDF document", category: "pdf", icon: FileImage, keywords: ["convert", "create", "photos"], path: "/tools/images-to-pdf" },
  { id: "pdf-extract", name: "PDF Page Extract", description: "Extract specific pages from PDF", category: "pdf", icon: FileOutput, keywords: ["extract", "pages", "select"], path: "/tools/pdf-extract" },
  { id: "pdf-rotate", name: "PDF Rotate", description: "Rotate PDF pages", category: "pdf", icon: RotateCw, keywords: ["rotate", "orientation", "turn"], path: "/tools/pdf-rotate" },
  { id: "pdf-metadata", name: "PDF Metadata Viewer", description: "View PDF document information", category: "pdf", icon: Info, keywords: ["info", "properties", "details"], path: "/tools/pdf-metadata" },
  { id: "pdf-compressor", name: "PDF Compressor", description: "Reduce PDF file size", category: "pdf", icon: Minimize2, keywords: ["compress", "reduce", "size", "optimize"], path: "/tools/pdf-compressor" },
  { id: "pdf-page-extractor", name: "PDF Page Extractor", description: "Extract specific page ranges from PDF", category: "pdf", icon: FileOutput, keywords: ["extract", "pages", "range", "select"], path: "/tools/pdf-page-extractor" },
  { id: "pdf-page-reorder", name: "PDF Page Reorder Tool", description: "Drag and drop to reorder PDF pages", category: "pdf", icon: ArrowUpDown, keywords: ["reorder", "arrange", "drag", "drop", "sort"], path: "/tools/pdf-page-reorder" },

  // MEDIA TOOLS (15)
  { id: "audio-compressor", name: "Audio Compressor", description: "Compress audio files to reduce size", category: "media", icon: Volume2, keywords: ["audio", "compress", "mp3", "reduce", "size"], path: "/tools/audio-compressor" },
  { id: "audio-trim", name: "Audio Trimmer", description: "Trim audio files to specific duration", category: "media", icon: Music, keywords: ["audio", "trim", "cut", "clip"], path: "/tools/audio-trim" },
  { id: "audio-speed", name: "Audio Speed Changer", description: "Change audio playback speed", category: "media", icon: Play, keywords: ["audio", "speed", "tempo", "fast", "slow"], path: "/tools/audio-speed" },
  { id: "audio-converter", name: "Audio Converter", description: "Convert between audio formats", category: "media", icon: Mic, keywords: ["audio", "convert", "mp3", "wav", "aac"], path: "/tools/audio-converter" },
  { id: "video-compressor", name: "Video Compressor", description: "Compress video files to reduce size", category: "media", icon: Film, keywords: ["video", "compress", "reduce", "size"], path: "/tools/video-compressor" },
  { id: "video-trim", name: "Video Trimmer", description: "Trim video files to specific duration", category: "media", icon: Video, keywords: ["video", "trim", "cut", "clip"], path: "/tools/video-trim" },
  { id: "video-to-audio", name: "Video to Audio Extractor", description: "Extract audio from video files", category: "media", icon: Music, keywords: ["video", "audio", "extract", "mp3"], path: "/tools/video-to-audio" },
  { id: "video-frame-extractor", name: "Video Frame Extractor", description: "Extract frames from video files", category: "media", icon: Scissors, keywords: ["video", "frame", "extract", "image"], path: "/tools/video-frame-extractor" },
  { id: "video-resolution-changer", name: "Video Resolution Changer", description: "Change video resolution and dimensions", category: "media", icon: Settings2, keywords: ["video", "resolution", "dimension", "quality"], path: "/tools/video-resolution-changer" },
  { id: "video-metadata-viewer", name: "Video Metadata Viewer", description: "View video file information and metadata", category: "media", icon: Info, keywords: ["video", "metadata", "info", "properties"], path: "/tools/video-metadata-viewer" },
  { id: "video-thumbnail-generator", name: "Video Thumbnail Generator", description: "Generate thumbnails from video files", category: "media", icon: FileImage, keywords: ["video", "thumbnail", "preview", "image"], path: "/tools/video-thumbnail-generator" },
  { id: "audio-silence-remover", name: "Audio Silence Remover", description: "Remove silence from audio files", category: "media", icon: Volume2, keywords: ["audio", "silence", "remove", "trim"], path: "/tools/audio-silence-remover" },
  { id: "audio-fade", name: "Audio Fade In/Out", description: "Add fade in and fade out effects to audio", category: "media", icon: Music, keywords: ["audio", "fade", "effect", "crossfade"], path: "/tools/audio-fade" },
  { id: "audio-metadata-editor", name: "Audio Metadata Editor", description: "Edit audio file metadata and tags", category: "media", icon: Settings2, keywords: ["audio", "metadata", "tags", "edit"], path: "/tools/audio-metadata-editor" },
  { id: "audio-channel-converter", name: "Audio Channel Converter", description: "Convert audio between mono and stereo", category: "media", icon: Mic, keywords: ["audio", "mono", "stereo", "channel"], path: "/tools/audio-channel-converter" },

  // STUDENT TOOLS (10)
  { id: "notes-manager", name: "Notes Manager", description: "Create and organize your notes", category: "student", icon: StickyNote, keywords: ["notes", "write", "organize", "study"], path: "/tools/notes-manager" },
  { id: "todo-list", name: "To-Do List", description: "Manage your tasks and to-dos", category: "student", icon: CheckSquare, keywords: ["tasks", "checklist", "organize", "productivity"], path: "/tools/todo-list" },
  { id: "timetable-generator", name: "Timetable Generator", description: "Create your class timetable", category: "student", icon: CalendarDays, keywords: ["schedule", "classes", "weekly", "timetable"], path: "/tools/timetable-generator" },
  { id: "flashcard-maker", name: "Flashcard Maker", description: "Create and study flashcards", category: "student", icon: Lightbulb, keywords: ["flashcard", "memory", "study", "learn"], path: "/tools/flashcard-maker" },
  { id: "attendance-calculator", name: "Attendance Calculator", description: "Calculate your attendance percentage", category: "student", icon: UserCheck, keywords: ["attendance", "class", "percentage", "present"], path: "/tools/attendance-calculator" },
  { id: "marks-predictor", name: "Internal Marks Predictor", description: "Predict your internal marks", category: "student", icon: Award, keywords: ["marks", "predict", "internal", "score"], path: "/tools/marks-predictor" },
  { id: "study-hours-tracker", name: "Study Hours Tracker", description: "Track your daily study hours", category: "student", icon: Clock, keywords: ["study", "hours", "track", "time"], path: "/tools/study-hours-tracker" },
  { id: "bibliography-generator", name: "Bibliography Generator", description: "Generate citations in various formats", category: "student", icon: BookMarked, keywords: ["citation", "reference", "apa", "mla", "bibliography"], path: "/tools/bibliography-generator" },
  { id: "reading-time-calculator", name: "Reading Time Calculator", description: "Estimate reading time for texts", category: "student", icon: BookOpen, keywords: ["reading", "time", "estimate", "words"], path: "/tools/reading-time-calculator" },
  { id: "grade-tracker", name: "Grade Tracker", description: "Track all your grades across subjects", category: "student", icon: BarChart, keywords: ["grade", "track", "subject", "academic"], path: "/tools/grade-tracker" },

  // TEXT & WRITING TOOLS (12)
  { id: "word-counter", name: "Word Counter", description: "Count words, characters, sentences, paragraphs", category: "text", icon: Hash, keywords: ["word", "count", "character", "sentence"], path: "/tools/word-counter" },
  { id: "text-case-converter", name: "Text Case Converter", description: "Convert text between different cases", category: "text", icon: Type, keywords: ["uppercase", "lowercase", "title", "case"], path: "/tools/text-case-converter" },
  { id: "lorem-ipsum-generator", name: "Lorem Ipsum Generator", description: "Generate placeholder text", category: "text", icon: AlignLeft, keywords: ["lorem", "ipsum", "placeholder", "dummy"], path: "/tools/lorem-ipsum-generator" },
  { id: "find-replace", name: "Find & Replace Tool", description: "Find and replace text in documents", category: "text", icon: Replace, keywords: ["find", "replace", "search", "text"], path: "/tools/find-replace" },
  { id: "remove-duplicates", name: "Remove Duplicate Lines", description: "Remove duplicate lines from text", category: "text", icon: Copy, keywords: ["duplicate", "remove", "unique", "lines"], path: "/tools/remove-duplicates" },
  { id: "text-diff", name: "Text Diff Tool", description: "Compare two texts and find differences", category: "text", icon: FileCheck, keywords: ["diff", "compare", "difference", "text"], path: "/tools/text-diff" },
  { id: "markdown-preview", name: "Markdown Preview", description: "Preview markdown text as HTML", category: "text", icon: FileText, keywords: ["markdown", "preview", "html", "render"], path: "/tools/markdown-preview" },
  { id: "json-formatter", name: "JSON Formatter", description: "Format and validate JSON data", category: "text", icon: FileText, keywords: ["json", "format", "validate", "pretty"], path: "/tools/json-formatter" },
  { id: "text-to-slug", name: "Text to Slug Converter", description: "Convert text to URL-friendly slugs", category: "text", icon: Link, keywords: ["slug", "url", "convert", "friendly"], path: "/tools/text-to-slug" },
  { id: "text-reverser", name: "Text Reverser", description: "Reverse text or words", category: "text", icon: RefreshCw, keywords: ["reverse", "text", "flip", "backward"], path: "/tools/text-reverser" },
  { id: "text-sorter", name: "Text Line Sorter", description: "Sort lines alphabetically or by length", category: "text", icon: ArrowUpDown, keywords: ["sort", "lines", "alphabetical", "order"], path: "/tools/text-sorter" },
  { id: "text-encoder", name: "Text Encoder/Decoder", description: "Encode/decode Base64, URL, HTML entities", category: "text", icon: Binary, keywords: ["encode", "decode", "base64", "url"], path: "/tools/text-encoder" },

  // FINANCE TOOLS (10)
  { id: "sip-calculator", name: "SIP Calculator", description: "Calculate SIP returns and investment growth", category: "finance", icon: TrendingUp, keywords: ["sip", "investment", "mutual", "fund", "returns"], path: "/tools/sip-calculator" },
  { id: "tip-calculator", name: "Tip Calculator", description: "Calculate tip and split bills", category: "finance", icon: Receipt, keywords: ["tip", "bill", "split", "restaurant"], path: "/tools/tip-calculator" },
  { id: "loan-calculator", name: "Loan Calculator", description: "Calculate loan payments and interest", category: "finance", icon: CreditCard, keywords: ["loan", "payment", "interest", "amortization"], path: "/tools/loan-calculator" },
  { id: "simple-interest", name: "Simple Interest Calculator", description: "Calculate simple interest", category: "finance", icon: Percent, keywords: ["simple", "interest", "principal", "rate"], path: "/tools/simple-interest" },
  { id: "compound-interest", name: "Compound Interest Calculator", description: "Calculate compound interest", category: "finance", icon: TrendingUp, keywords: ["compound", "interest", "growth", "investment"], path: "/tools/compound-interest" },
  { id: "savings-goal", name: "Savings Goal Calculator", description: "Plan your savings goals", category: "finance", icon: PiggyBank, keywords: ["savings", "goal", "target", "plan"], path: "/tools/savings-goal" },
  { id: "discount-calculator", name: "Discount Calculator", description: "Calculate discounts and final prices", category: "finance", icon: Coins, keywords: ["discount", "sale", "price", "percent"], path: "/tools/discount-calculator" },
  { id: "currency-converter", name: "Currency Converter", description: "Convert between world currencies", category: "finance", icon: DollarSign, keywords: ["currency", "convert", "exchange", "rate"], path: "/tools/currency-converter" },
  { id: "tax-calculator", name: "Tax Calculator", description: "Calculate income tax estimates", category: "finance", icon: Receipt, keywords: ["tax", "income", "calculate", "estimate"], path: "/tools/tax-calculator" },
  { id: "budget-planner", name: "Budget Planner", description: "Plan and track your monthly budget", category: "finance", icon: Wallet, keywords: ["budget", "plan", "expense", "income"], path: "/tools/budget-planner" },

  // UTILITY TOOLS (13)
  { id: "password-generator", name: "Password Generator", description: "Generate secure random passwords", category: "utility", icon: Key, keywords: ["password", "generate", "secure", "random"], path: "/tools/password-generator" },
  { id: "qr-generator", name: "QR Code Generator", description: "Generate QR codes from text or URLs", category: "utility", icon: QrCode, keywords: ["qr", "code", "generate", "scan"], path: "/tools/qr-generator" },
  { id: "random-number", name: "Random Number Generator", description: "Generate random numbers in range", category: "utility", icon: Shuffle, keywords: ["random", "number", "generate", "range"], path: "/tools/random-number" },
  { id: "uuid-generator", name: "UUID Generator", description: "Generate unique UUIDs", category: "utility", icon: Fingerprint, keywords: ["uuid", "guid", "unique", "identifier"], path: "/tools/uuid-generator" },
  { id: "color-picker", name: "Color Picker & Converter", description: "Pick colors and convert formats", category: "utility", icon: Palette, keywords: ["color", "picker", "hex", "rgb", "hsl"], path: "/tools/color-picker" },
  { id: "hash-generator", name: "Hash Generator", description: "Generate MD5, SHA hashes", category: "utility", icon: Hash, keywords: ["hash", "md5", "sha", "encrypt"], path: "/tools/hash-generator" },
  { id: "timezone-converter", name: "Timezone Converter", description: "Convert between timezones", category: "utility", icon: Globe, keywords: ["timezone", "convert", "time", "world"], path: "/tools/timezone-converter" },
  { id: "roman-numeral", name: "Roman Numeral Converter", description: "Convert to/from Roman numerals", category: "utility", icon: Languages, keywords: ["roman", "numeral", "convert", "number"], path: "/tools/roman-numeral" },
  { id: "morse-code", name: "Morse Code Translator", description: "Translate text to/from Morse code", category: "utility", icon: MessageSquare, keywords: ["morse", "code", "translate", "dots"], path: "/tools/morse-code" },
  { id: "stopwatch", name: "Stopwatch", description: "Simple stopwatch with lap times", category: "utility", icon: Clock, keywords: ["stopwatch", "timer", "lap", "time"], path: "/tools/stopwatch" },
  { id: "countdown-timer", name: "Countdown Timer", description: "Set countdown timers with alerts", category: "utility", icon: Timer, keywords: ["countdown", "timer", "alert", "alarm"], path: "/tools/countdown-timer" },
  { id: "habit-tracker", name: "Habit Tracker", description: "Track daily habits and streaks", category: "utility", icon: Target, keywords: ["habit", "track", "streak", "daily"], path: "/tools/habit-tracker" },
  { id: "bookmark-manager", name: "Bookmark Manager", description: "Save and organize bookmarks", category: "utility", icon: BookMarked, keywords: ["bookmark", "save", "organize", "links"], path: "/tools/bookmark-manager" },
];

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter(tool => tool.category === category);
}

export function searchTools(query: string): Tool[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return tools;

  return tools.filter(tool =>
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  );
}

export function getToolById(id: string): Tool | undefined {
  return tools.find(tool => tool.id === id);
}

export function getAllCategories(): ToolCategory[] {
  return Object.keys(categoryInfo) as ToolCategory[];
}

export function getTotalToolCount(): number {
  return tools.length;
}
