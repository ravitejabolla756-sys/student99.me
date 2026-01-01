import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ToolLayout, FileDropZone, ResultDisplay } from "@/components/tool-layout";
import { getToolById } from "@/lib/tools-data";
import { Download, Upload, RotateCcw, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FileTypeInfo {
  category: string;
  mimeTypes: string[];
  extensions: string[];
}

export function UniversalFileConverter() {
  const tool = getToolById("universal-file-converter")!;
  const [file, setFile] = useState<File | null>(null);
  const [inputType, setInputType] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>("");
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Comprehensive file type mapping
  const FILE_TYPES: Record<string, FileTypeInfo> = {
    // Images
    jpeg: { category: "image", mimeTypes: ["image/jpeg"], extensions: ["jpg", "jpeg"] },
    png: { category: "image", mimeTypes: ["image/png"], extensions: ["png"] },
    gif: { category: "image", mimeTypes: ["image/gif"], extensions: ["gif"] },
    webp: { category: "image", mimeTypes: ["image/webp"], extensions: ["webp"] },
    bmp: { category: "image", mimeTypes: ["image/bmp"], extensions: ["bmp"] },
    tiff: { category: "image", mimeTypes: ["image/tiff"], extensions: ["tiff", "tif"] },
    svg: { category: "image", mimeTypes: ["image/svg+xml"], extensions: ["svg"] },
    
    // Documents
    pdf: { category: "document", mimeTypes: ["application/pdf"], extensions: ["pdf"] },
    txt: { category: "document", mimeTypes: ["text/plain"], extensions: ["txt"] },
    docx: { category: "document", mimeTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"], extensions: ["docx"] },
    doc: { category: "document", mimeTypes: ["application/msword"], extensions: ["doc"] },
    xlsx: { category: "document", mimeTypes: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"], extensions: ["xlsx"] },
    xls: { category: "document", mimeTypes: ["application/vnd.ms-excel"], extensions: ["xls"] },
    pptx: { category: "document", mimeTypes: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"], extensions: ["pptx"] },
    ppt: { category: "document", mimeTypes: ["application/vnd.ms-powerpoint"], extensions: ["ppt"] },
    
    // Archives
    zip: { category: "archive", mimeTypes: ["application/zip"], extensions: ["zip"] },
    rar: { category: "archive", mimeTypes: ["application/x-rar-compressed"], extensions: ["rar"] },
    "7z": { category: "archive", mimeTypes: ["application/x-7z-compressed"], extensions: ["7z"] },
    
    // Audio
    mp3: { category: "audio", mimeTypes: ["audio/mpeg"], extensions: ["mp3"] },
    wav: { category: "audio", mimeTypes: ["audio/wav"], extensions: ["wav"] },
    aac: { category: "audio", mimeTypes: ["audio/aac"], extensions: ["aac"] },
    m4a: { category: "audio", mimeTypes: ["audio/mp4"], extensions: ["m4a"] },
    
    // Video
    mp4: { category: "video", mimeTypes: ["video/mp4"], extensions: ["mp4"] },
    webm: { category: "video", mimeTypes: ["video/webm"], extensions: ["webm"] },
    mov: { category: "video", mimeTypes: ["video/quicktime"], extensions: ["mov"] },
    avi: { category: "video", mimeTypes: ["video/x-msvideo"], extensions: ["avi"] },
  };

  const getFileTypeFromExtension = (fileName: string): string | null => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (!ext) return null;

    for (const [type, info] of Object.entries(FILE_TYPES)) {
      if (info.extensions.includes(ext)) {
        return type;
      }
    }
    return null;
  };

  const getFileTypeFromMime = (mimeType: string): string | null => {
    for (const [type, info] of Object.entries(FILE_TYPES)) {
      if (info.mimeTypes.includes(mimeType)) {
        return type;
      }
    }
    return null;
  };

  // Get conversion options based on input type
  const getConversionOptions = (input: string | null): { format: string; supported: boolean; requiresOnline: boolean }[] => {
    if (!input) return [];

    const conversions: Record<string, { format: string; supported: boolean; requiresOnline: boolean }[]> = {
      jpeg: [
        { format: "png", supported: true, requiresOnline: false },
        { format: "webp", supported: true, requiresOnline: false },
        { format: "bmp", supported: true, requiresOnline: false },
        { format: "gif", supported: true, requiresOnline: false },
        { format: "pdf", supported: true, requiresOnline: false },
        { format: "jpg", supported: true, requiresOnline: false },
      ],
      png: [
        { format: "jpeg", supported: true, requiresOnline: false },
        { format: "webp", supported: true, requiresOnline: false },
        { format: "bmp", supported: true, requiresOnline: false },
        { format: "gif", supported: true, requiresOnline: false },
        { format: "pdf", supported: true, requiresOnline: false },
      ],
      gif: [
        { format: "png", supported: true, requiresOnline: false },
        { format: "jpeg", supported: true, requiresOnline: false },
        { format: "webp", supported: true, requiresOnline: false },
        { format: "bmp", supported: true, requiresOnline: false },
        { format: "pdf", supported: true, requiresOnline: false },
      ],
      webp: [
        { format: "png", supported: true, requiresOnline: false },
        { format: "jpeg", supported: true, requiresOnline: false },
        { format: "gif", supported: true, requiresOnline: false },
        { format: "bmp", supported: true, requiresOnline: false },
        { format: "pdf", supported: true, requiresOnline: false },
      ],
      bmp: [
        { format: "png", supported: true, requiresOnline: false },
        { format: "jpeg", supported: true, requiresOnline: false },
        { format: "gif", supported: true, requiresOnline: false },
        { format: "webp", supported: true, requiresOnline: false },
        { format: "pdf", supported: true, requiresOnline: false },
      ],
      tiff: [
        { format: "png", supported: true, requiresOnline: false },
        { format: "jpeg", supported: true, requiresOnline: false },
        { format: "webp", supported: true, requiresOnline: false },
        { format: "pdf", supported: true, requiresOnline: false },
      ],
      pdf: [
        { format: "png", supported: true, requiresOnline: false },
        { format: "jpeg", supported: true, requiresOnline: false },
        { format: "docx", supported: false, requiresOnline: true },
        { format: "txt", supported: false, requiresOnline: true },
        { format: "pptx", supported: false, requiresOnline: true },
      ],
      txt: [
        { format: "pdf", supported: false, requiresOnline: true },
        { format: "docx", supported: false, requiresOnline: true },
        { format: "xlsx", supported: false, requiresOnline: true },
      ],
      docx: [
        { format: "pdf", supported: false, requiresOnline: true },
        { format: "txt", supported: false, requiresOnline: true },
        { format: "pptx", supported: false, requiresOnline: true },
      ],
      doc: [
        { format: "pdf", supported: false, requiresOnline: true },
        { format: "txt", supported: false, requiresOnline: true },
        { format: "docx", supported: false, requiresOnline: true },
      ],
      xlsx: [
        { format: "pdf", supported: false, requiresOnline: true },
        { format: "csv", supported: false, requiresOnline: true },
      ],
      pptx: [
        { format: "pdf", supported: false, requiresOnline: true },
        { format: "docx", supported: false, requiresOnline: true },
      ],
      ppt: [
        { format: "pdf", supported: false, requiresOnline: true },
        { format: "pptx", supported: false, requiresOnline: true },
      ],
    };

    return conversions[input] || [];
  };

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    
    let detectedType: string | null = null;
    
    // Try to detect from extension first
    detectedType = getFileTypeFromExtension(f.name);
    
    // If no extension match, try MIME type
    if (!detectedType) {
      detectedType = getFileTypeFromMime(f.type);
    }
    
    // If still unknown, show error
    if (!detectedType) {
      setError(`File type not recognized for ${f.name}. Please upload a supported file type.`);
      setFile(null);
      setInputType(null);
      return;
    }

    setFile(f);
    setInputType(detectedType);
    setOutputFormat("");
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const pdfToImage = async (file: File): Promise<{ blob: Blob; filename: string }> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = pdf.getPages();
    const firstPage = pages[0];
    
    const { width, height } = firstPage.getSize();
    
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");
    
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve({
            blob,
            filename: file.name.replace(/\.pdf$/i, ".png"),
          });
        }
      }, "image/png");
    });
  };

  const imageToPdf = async (file: File): Promise<{ blob: Blob; filename: string }> => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          const pdf = await PDFDocument.create();
          const { width, height } = img;

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const imageBytes = await blob.arrayBuffer();
              const image = await pdf.embedPng(imageBytes);
              const page = pdf.addPage([width, height]);
              page.drawImage(image, { x: 0, y: 0, width, height });

              const pdfBytes = await pdf.save();
              URL.revokeObjectURL(url);
              resolve({
                blob: new Blob([pdfBytes], { type: "application/pdf" }),
                filename: file.name.split(".").slice(0, -1).join(".") + ".pdf",
              });
            }
          });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };
      img.src = url;
    });
  };

  const imageToImage = async (
    file: File,
    format: string
  ): Promise<{ blob: Blob; filename: string }> => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0);
        
        // Determine MIME type and quality
        let mimeType = "image/png";
        let quality = 0.95;
        
        if (format === "jpeg" || format === "jpg") {
          mimeType = "image/jpeg";
        } else if (format === "webp") {
          mimeType = "image/webp";
        } else if (format === "bmp") {
          mimeType = "image/bmp";
        } else if (format === "gif") {
          mimeType = "image/gif";
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              URL.revokeObjectURL(url);
              const ext = format === "jpg" ? "jpg" : format;
              resolve({
                blob,
                filename: file.name.split(".").slice(0, -1).join(".") + "." + ext,
              });
            }
          },
          mimeType,
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };
      img.src = url;
    });
  };

  const convert = async () => {
    if (!file || !inputType || !outputFormat) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      let converted: { blob: Blob; filename: string } | null = null;

      // Check if conversion requires online service
      const options = getConversionOptions(inputType);
      const selectedOption = options.find(opt => opt.format === outputFormat);
      
      if (selectedOption?.requiresOnline) {
        setError(`Converting from ${inputType.toUpperCase()} to ${outputFormat.toUpperCase()} requires an online service. Please use an online file converter.`);
        setLoading(false);
        return;
      }

      // PDF to Image
      if (inputType === "pdf" && ["png", "jpeg", "jpg"].includes(outputFormat)) {
        setProgress(50);
        converted = await pdfToImage(file);
      }
      // Image to PDF
      else if (["jpeg", "png", "gif", "webp", "bmp", "tiff"].includes(inputType) && outputFormat === "pdf") {
        setProgress(50);
        converted = await imageToPdf(file);
      }
      // Image to Image
      else if (["jpeg", "png", "gif", "webp", "bmp", "tiff"].includes(inputType) && 
               ["jpeg", "jpg", "png", "gif", "webp", "bmp"].includes(outputFormat)) {
        setProgress(50);
        converted = await imageToImage(file, outputFormat);
      }
      // Unsupported
      else {
        setError("This conversion is not supported offline.");
        setLoading(false);
        return;
      }

      setProgress(100);
      setResult(converted);
    } catch (err) {
      console.error("Conversion error:", err);
      setError(
        err instanceof Error ? err.message : "Conversion failed. Please try another format."
      );
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (result) {
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.download = result.filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const reset = () => {
    setFile(null);
    setInputType(null);
    setOutputFormat("");
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const outputOptions = getConversionOptions(inputType);
  const supportedExtensions = Object.values(FILE_TYPES)
    .flatMap(info => info.extensions)
    .map(ext => `.${ext}`)
    .join(",");

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Upload Section */}
        <FileDropZone accept={supportedExtensions} onFiles={handleFiles}>
          <Upload className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Drop your file here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports: Images (JPG, PNG, GIF, WebP, BMP, TIFF, SVG), Documents (PDF, DOCX, TXT, XLSX, PPTX), Audio, Video, Archives
          </p>
        </FileDropZone>

        {/* File Info */}
        {file && inputType && (
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  Format: <span className="font-semibold">{inputType.toUpperCase()}</span> • Size: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setInputType(null);
                  setOutputFormat("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {/* Format Selection */}
        {file && inputType && (
          <div className="space-y-3">
            <Label>Convert to:</Label>
            {outputOptions.length > 0 ? (
              <>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select output format..." />
                  </SelectTrigger>
                  <SelectContent>
                    {outputOptions.map((opt) => (
                      <SelectItem key={opt.format} value={opt.format}>
                        <span className="flex items-center gap-2">
                          {opt.format.toUpperCase()}
                          {opt.requiresOnline && <span className="text-xs text-amber-600">(Online)</span>}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {outputOptions.some(o => o.requiresOnline) && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Some conversions require an online service
                  </p>
                )}
              </>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-amber-600">
                  ⚠️ No offline conversions available for {inputType.toUpperCase()} files. This file type may require an online converter service.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Progress */}
        {loading && progress > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Converting...</p>
            <Progress value={progress} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <ResultDisplay title="✓ Conversion Complete">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Output: <span className="font-semibold">{result.filename}</span>
              </p>
              <div className="flex gap-2">
                <Button onClick={download} className="flex-1">
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
                <Button variant="outline" onClick={reset}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Convert Another
                </Button>
              </div>
            </div>
          </ResultDisplay>
        )}

        {/* Convert Button */}
        {file && outputFormat && !result && (
          <div className="flex gap-2">
            <Button
              onClick={convert}
              disabled={loading}
              className="flex-1"
              size="lg"
            >
              {loading ? "Converting..." : "Convert"}
            </Button>
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
