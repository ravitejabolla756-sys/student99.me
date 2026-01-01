import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import AllTools from "@/pages/all-tools";
import { About, Privacy, Terms, Help, Settings } from "@/pages/static-pages";

import {
  BasicCalculator,
  ScientificCalculator,
  PercentageCalculator,
  EMICalculator,
  GPACalculator,
  CGPACalculator,
  AgeCalculator,
  UnitConverter,
  TimeDurationCalculator
} from "@/pages/tools/calculators";

import {
  ImageResizer,
  ImageCropper,
  ImageCompressor,
  JpgToPng,
  PngToJpg,
  ImageGrayscale,
  ImagePreview,
  AdvancedImageCompressor,
  ImageQualityController,
  ImageDPIChanger,
  ImageMetadataViewer,
  ImageMetadataRemover,
  ImageBorderAdder,
  ImageTextOverlay,
  ImageBackgroundBlur,
  ImageColorPicker,
  ImageAspectRatioFixer
} from "@/pages/tools/image-tools";

import {
  PDFMerge,
  PDFSplit,
  PDFReorder,
  ImagesToPDF,
  PDFViewer,
  PDFExtract,
  PDFRotate,
  PDFMetadata,
  PDFCompressor,
  PDFPageExtractor,
  PDFPageReorderTool
} from "@/pages/tools/pdf-tools";

import {
  NotesManager,
  TodoList,
  PomodoroTimer,
  StudyPlanner,
  HomeworkTracker,
  TimetableGenerator,
  ExamCountdownTimer
} from "@/pages/tools/student-tools";

import {
  UniversalFileConverter
} from "@/pages/tools/universal-file-converter";


import {
  AudioCompressor,
  AudioTrimmer,
  AudioSpeedChanger,
  AudioConverter,
  VideoCompressor,
  VideoTrimmer,
  VideoToAudio,
  VideoFrameExtractor,
  VideoResolutionChanger,
  VideoMetadataViewer,
  VideoThumbnailGenerator,
  AudioSilenceRemover,
  AudioFadeInOut,
  AudioMetadataEditor,
  AudioChannelConverter
} from "@/pages/tools/media-tools";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/tools" component={AllTools} />
      
      <Route path="/about" component={About} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/help" component={Help} />
      <Route path="/settings" component={Settings} />

      <Route path="/tools/basic-calculator" component={BasicCalculator} />
      <Route path="/tools/scientific-calculator" component={ScientificCalculator} />
      <Route path="/tools/percentage-calculator" component={PercentageCalculator} />
      <Route path="/tools/emi-calculator" component={EMICalculator} />
      <Route path="/tools/gpa-calculator" component={GPACalculator} />
      <Route path="/tools/cgpa-calculator" component={CGPACalculator} />
      <Route path="/tools/age-calculator" component={AgeCalculator} />
      <Route path="/tools/unit-converter" component={UnitConverter} />
      <Route path="/tools/time-duration" component={TimeDurationCalculator} />

      <Route path="/tools/image-resizer" component={ImageResizer} />
      <Route path="/tools/image-cropper" component={ImageCropper} />
      <Route path="/tools/image-compressor" component={ImageCompressor} />
      <Route path="/tools/advanced-compressor" component={AdvancedImageCompressor} />
      <Route path="/tools/image-quality" component={ImageQualityController} />
      <Route path="/tools/jpg-to-png" component={JpgToPng} />
      <Route path="/tools/png-to-jpg" component={PngToJpg} />
      <Route path="/tools/image-grayscale" component={ImageGrayscale} />
      <Route path="/tools/image-preview" component={ImagePreview} />
      <Route path="/tools/image-dpi-changer" component={ImageDPIChanger} />
      <Route path="/tools/image-metadata-viewer" component={ImageMetadataViewer} />
      <Route path="/tools/image-metadata-remover" component={ImageMetadataRemover} />
      <Route path="/tools/image-border-adder" component={ImageBorderAdder} />
      <Route path="/tools/image-text-overlay" component={ImageTextOverlay} />
      <Route path="/tools/image-background-blur" component={ImageBackgroundBlur} />
      <Route path="/tools/image-color-picker" component={ImageColorPicker} />
      <Route path="/tools/image-aspect-ratio" component={ImageAspectRatioFixer} />

      <Route path="/tools/pdf-merge" component={PDFMerge} />
      <Route path="/tools/pdf-split" component={PDFSplit} />
      <Route path="/tools/pdf-reorder" component={PDFReorder} />
      <Route path="/tools/images-to-pdf" component={ImagesToPDF} />
      <Route path="/tools/pdf-viewer" component={PDFViewer} />
      <Route path="/tools/pdf-extract" component={PDFExtract} />
      <Route path="/tools/pdf-rotate" component={PDFRotate} />
      <Route path="/tools/pdf-metadata" component={PDFMetadata} />
      <Route path="/tools/pdf-compressor" component={PDFCompressor} />
      <Route path="/tools/pdf-page-extractor" component={PDFPageExtractor} />
      <Route path="/tools/pdf-page-reorder" component={PDFPageReorderTool} />

      <Route path="/tools/audio-compressor" component={AudioCompressor} />
      <Route path="/tools/audio-trim" component={AudioTrimmer} />
      <Route path="/tools/audio-speed" component={AudioSpeedChanger} />
      <Route path="/tools/audio-converter" component={AudioConverter} />
      <Route path="/tools/video-compressor" component={VideoCompressor} />
      <Route path="/tools/video-trim" component={VideoTrimmer} />
      <Route path="/tools/video-to-audio" component={VideoToAudio} />
      <Route path="/tools/video-frame-extractor" component={VideoFrameExtractor} />
      <Route path="/tools/video-resolution-changer" component={VideoResolutionChanger} />
      <Route path="/tools/video-metadata-viewer" component={VideoMetadataViewer} />
      <Route path="/tools/video-thumbnail-generator" component={VideoThumbnailGenerator} />
      <Route path="/tools/audio-silence-remover" component={AudioSilenceRemover} />
      <Route path="/tools/audio-fade" component={AudioFadeInOut} />
      <Route path="/tools/audio-metadata-editor" component={AudioMetadataEditor} />
      <Route path="/tools/audio-channel-converter" component={AudioChannelConverter} />

      <Route path="/tools/notes-manager" component={NotesManager} />
      <Route path="/tools/todo-list" component={TodoList} />
      <Route path="/tools/pomodoro-timer" component={PomodoroTimer} />
      <Route path="/tools/study-planner" component={StudyPlanner} />
      <Route path="/tools/homework-tracker" component={HomeworkTracker} />
      <Route path="/tools/timetable-generator" component={TimetableGenerator} />
      <Route path="/tools/exam-countdown" component={ExamCountdownTimer} />

      <Route path="/tools/universal-file-converter" component={UniversalFileConverter} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
