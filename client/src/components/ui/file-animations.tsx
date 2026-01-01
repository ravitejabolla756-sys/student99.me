import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Upload, Loader2, Download, FileCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  progress: number;
  fileName?: string;
}

export function UploadProgress({ progress, fileName }: UploadProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 bg-muted/50 rounded-lg border border-border"
    >
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Upload className="w-5 h-5 text-primary" />
        </motion.div>
        <span className="text-sm font-medium">
          {fileName ? `Uploading ${fileName}...` : "Uploading..."}
        </span>
        <span className="text-sm text-muted-foreground ml-auto">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </motion.div>
  );
}

interface ProcessingSpinnerProps {
  text?: string;
  progress?: number;
}

export function ProcessingSpinner({ text = "Processing...", progress }: ProcessingSpinnerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-6 bg-muted/50 rounded-lg border border-border text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 mx-auto mb-4"
      >
        <Loader2 className="w-12 h-12 text-primary" />
      </motion.div>
      <p className="text-sm font-medium mb-2">{text}</p>
      {progress !== undefined && (
        <div className="max-w-xs mx-auto">
          <Progress value={progress} className="h-2 mb-1" />
          <p className="text-xs text-muted-foreground">{progress}%</p>
        </div>
      )}
    </motion.div>
  );
}

interface SuccessAnimationProps {
  message?: string;
  onComplete?: () => void;
}

export function SuccessAnimation({ message = "Complete!", onComplete }: SuccessAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onAnimationComplete={onComplete}
      className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5, times: [0, 0.6, 1] }}
        className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center"
      >
        <CheckCircle className="w-10 h-10 text-white" />
      </motion.div>
      <p className="text-green-600 dark:text-green-400 font-medium">{message}</p>
    </motion.div>
  );
}

interface DownloadButtonAnimatedProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function DownloadButtonAnimated({ onClick, disabled, children }: DownloadButtonAnimatedProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium
        transition-colors duration-200
        ${disabled 
          ? "bg-muted text-muted-foreground cursor-not-allowed" 
          : "bg-primary text-primary-foreground hover:bg-primary/90"
        }
      `}
      data-testid="button-download-animated"
    >
      <motion.div
        animate={!disabled ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
      >
        <Download className="w-5 h-5" />
      </motion.div>
      {children}
    </motion.button>
  );
}

interface FilePreviewAnimationProps {
  fileName: string;
  fileSize?: string;
  onRemove?: () => void;
}

export function FilePreviewAnimation({ fileName, fileSize, onRemove }: FilePreviewAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <FileCheck className="w-8 h-8 text-primary" />
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fileName}</p>
        {fileSize && <p className="text-xs text-muted-foreground">{fileSize}</p>}
      </div>
      {onRemove && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          ×
        </motion.button>
      )}
    </motion.div>
  );
}

interface ResultRevealProps {
  children: React.ReactNode;
  show: boolean;
}

export function ResultReveal({ children, show }: ResultRevealProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
