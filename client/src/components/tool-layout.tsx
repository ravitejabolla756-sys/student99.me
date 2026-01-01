import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tool, categoryInfo } from "@/lib/tools-data";
import { AdInContent } from "@/components/ads/AdSlot";

interface ToolLayoutProps {
  tool: Tool;
  children: React.ReactNode;
}

export function ToolLayout({ tool, children }: ToolLayoutProps) {
  const category = categoryInfo[tool.category];
  const Icon = tool.icon;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <span>/</span>
              <span>{category.name}</span>
              <span>/</span>
              <span className="text-foreground font-medium">{tool.name}</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4 mb-4">
            <motion.div 
              className={`w-16 h-16 rounded-xl ${category.color} flex items-center justify-center text-white shrink-0`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            >
              <Icon className="w-8 h-8" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-tool-title">
                  {tool.name}
                </h1>
                <Badge variant="secondary" data-testid="badge-tool-category">
                  {category.name}
                </Badge>
                <Badge variant="outline" className="text-xs" data-testid="badge-ai-version">
                  V1
                </Badge>
              </div>
              <p className="text-muted-foreground" data-testid="text-tool-description">
                {tool.description}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mb-6">
          <AdInContent />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-4 sm:p-8"
        >
          {children}
        </motion.div>

        <div className="mt-6">
          <AdInContent />
        </div>
      </main>
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${sizeClasses[size]} border-2 border-primary border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-muted-foreground text-sm">{text}</p>}
    </div>
  );
}

interface ResultDisplayProps {
  title: string;
  children: React.ReactNode;
}

export function ResultDisplay({ title, children }: ResultDisplayProps) {
  return (
    <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

interface FileDropZoneProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  children?: React.ReactNode;
}

export function FileDropZone({ accept, multiple = false, onFiles, children }: FileDropZoneProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    onFiles(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    onFiles(files);
  };

  return (
    <label
      className="flex flex-col items-center justify-center w-full p-12 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      data-testid="dropzone-file"
    >
      {children || (
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
          <p className="text-xs text-muted-foreground">Accepts: {accept}</p>
        </div>
      )}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        data-testid="input-file"
      />
    </label>
  );
}
