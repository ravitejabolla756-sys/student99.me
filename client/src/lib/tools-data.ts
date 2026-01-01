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
  Focus
} from "lucide-react";

export type ToolCategory = "calculators" | "image" | "pdf" | "student" | "media";

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
};

export const tools: Tool[] = [
  // UNIVERSAL CONVERTER
  { id: "universal-file-converter", name: "Universal File Converter", description: "Convert between PDF, DOCX, PPTX, TXT, and images", category: "pdf", icon: FileEdit, keywords: ["convert", "file", "format", "universal"], path: "/tools/universal-file-converter" },

  // CALCULATORS (9)
  { id: "basic-calculator", name: "Basic Calculator", description: "Perform basic arithmetic operations", category: "calculators", icon: Calculator, keywords: ["math", "add", "subtract", "multiply", "divide"], path: "/tools/basic-calculator" },
  { id: "scientific-calculator", name: "Scientific Calculator", description: "Advanced mathematical calculations", category: "calculators", icon: Calculator, keywords: ["math", "sin", "cos", "tan", "log", "power", "scientific"], path: "/tools/scientific-calculator" },
  { id: "percentage-calculator", name: "Percentage Calculator", description: "Calculate percentages easily", category: "calculators", icon: Percent, keywords: ["percent", "ratio", "discount"], path: "/tools/percentage-calculator" },
  { id: "emi-calculator", name: "EMI Calculator", description: "Calculate loan EMI payments", category: "calculators", icon: Wallet, keywords: ["loan", "interest", "monthly", "payment", "finance"], path: "/tools/emi-calculator" },
  { id: "gpa-calculator", name: "GPA Calculator", description: "Calculate your Grade Point Average", category: "calculators", icon: GraduationCap, keywords: ["grades", "score", "academic", "semester"], path: "/tools/gpa-calculator" },
  { id: "cgpa-calculator", name: "CGPA Calculator", description: "Calculate Cumulative GPA", category: "calculators", icon: GraduationCap, keywords: ["grades", "cumulative", "overall", "academic"], path: "/tools/cgpa-calculator" },
  { id: "age-calculator", name: "Age Calculator", description: "Calculate age from date of birth", category: "calculators", icon: Calendar, keywords: ["birthday", "years", "months", "days"], path: "/tools/age-calculator" },
  { id: "unit-converter", name: "Unit Converter", description: "Convert between different units", category: "calculators", icon: Ruler, keywords: ["length", "weight", "temperature", "convert"], path: "/tools/unit-converter" },
  { id: "time-duration", name: "Time Duration Calculator", description: "Calculate time between dates", category: "calculators", icon: Clock, keywords: ["hours", "minutes", "difference", "duration"], path: "/tools/time-duration" },

  // IMAGE TOOLS (17)
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
  { id: "image-metadata-viewer", name: "Image Metadata Viewer", description: "View EXIF and image metadata", category: "image", icon: Info, keywords: ["exif", "metadata", "info", "properties"], path: "/tools/image-metadata-viewer" },
  { id: "image-metadata-remover", name: "Image Metadata Remover", description: "Remove EXIF and metadata from images", category: "image", icon: Sparkles, keywords: ["remove", "exif", "clean", "metadata", "privacy"], path: "/tools/image-metadata-remover" },
  { id: "image-border-adder", name: "Image Border Adder", description: "Add borders and frames to images", category: "image", icon: Layers, keywords: ["border", "frame", "add", "style"], path: "/tools/image-border-adder" },
  { id: "image-text-overlay", name: "Image Text Overlay", description: "Add text overlays to images", category: "image", icon: FileEdit, keywords: ["text", "overlay", "watermark", "add"], path: "/tools/image-text-overlay" },
  { id: "image-background-blur", name: "Image Background Blur", description: "Blur image background intelligently", category: "image", icon: Focus, keywords: ["blur", "background", "focus", "effect"], path: "/tools/image-background-blur" },
  { id: "image-color-picker", name: "Image Color Picker", description: "Pick colors from images", category: "image", icon: Droplets, keywords: ["color", "picker", "extract", "hex", "rgb"], path: "/tools/image-color-picker" },
  { id: "image-aspect-ratio", name: "Image Aspect Ratio Fixer", description: "Fix image aspect ratios (Instagram, YouTube, etc)", category: "image", icon: Crop, keywords: ["aspect", "ratio", "resize", "instagram", "youtube"], path: "/tools/image-aspect-ratio" },

  // PDF TOOLS (11)
  { id: "pdf-merge", name: "PDF Merge", description: "Combine multiple PDFs into one", category: "pdf", icon: FilePlus, keywords: ["combine", "join", "merge", "document"], path: "/tools/pdf-merge" },
  { id: "pdf-split", name: "PDF Split", description: "Split PDF into multiple files", category: "pdf", icon: Scissors, keywords: ["separate", "divide", "extract"], path: "/tools/pdf-split" },
  { id: "pdf-reorder", name: "PDF Page Reorder", description: "Rearrange pages in a PDF", category: "pdf", icon: ArrowUpDown, keywords: ["arrange", "order", "pages", "sort"], path: "/tools/pdf-reorder" },
  { id: "images-to-pdf", name: "Images to PDF", description: "Convert images to PDF document", category: "pdf", icon: FileImage, keywords: ["convert", "create", "photos"], path: "/tools/images-to-pdf" },
  { id: "pdf-viewer", name: "PDF Viewer", description: "View PDF documents online", category: "pdf", icon: Eye, keywords: ["view", "read", "open"], path: "/tools/pdf-viewer" },
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

  // STUDENT TOOLS (7)
  { id: "notes-manager", name: "Notes Manager", description: "Create and organize your notes", category: "student", icon: StickyNote, keywords: ["notes", "write", "organize", "study"], path: "/tools/notes-manager" },
  { id: "todo-list", name: "To-Do List", description: "Manage your tasks and to-dos", category: "student", icon: CheckSquare, keywords: ["tasks", "checklist", "organize", "productivity"], path: "/tools/todo-list" },
  { id: "pomodoro-timer", name: "Pomodoro Timer", description: "Focus with timed work sessions", category: "student", icon: Timer, keywords: ["focus", "productivity", "break", "study"], path: "/tools/pomodoro-timer" },
  { id: "study-planner", name: "Study Planner", description: "Plan your study schedule", category: "student", icon: BookOpen, keywords: ["schedule", "plan", "organize", "calendar"], path: "/tools/study-planner" },
  { id: "homework-tracker", name: "Homework Tracker", description: "Track assignments and deadlines", category: "student", icon: ClipboardList, keywords: ["assignments", "deadline", "track", "homework"], path: "/tools/homework-tracker" },
  { id: "timetable-generator", name: "Timetable Generator", description: "Create your class timetable", category: "student", icon: CalendarDays, keywords: ["schedule", "classes", "weekly", "timetable"], path: "/tools/timetable-generator" },
  { id: "exam-countdown", name: "Exam Countdown Timer", description: "Count down to your exams", category: "student", icon: Hourglass, keywords: ["exam", "countdown", "deadline", "timer"], path: "/tools/exam-countdown" },
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
