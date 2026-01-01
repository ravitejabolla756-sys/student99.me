import { useState, useRef } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToolLayout, LoadingSpinner, FileDropZone, ResultDisplay } from "@/components/tool-layout";
import { getToolById } from "@/lib/tools-data";
import { Download, Upload, FileText, RotateCw, Trash2, GripVertical } from "lucide-react";

function simulateProcessing(callback: () => void) {
  setTimeout(callback, 1200 + Math.random() * 600);
}

export function PDFMerge() {
  const tool = getToolById("pdf-merge")!;
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = (newFiles: File[]) => {
    const pdfFiles = newFiles.filter(f => f.type === "application/pdf");
    setFiles(prev => [...prev, ...pdfFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const merge = async () => {
    if (files.length < 2) return;
    
    setLoading(true);
    simulateProcessing(async () => {
      try {
        const mergedPdf = await PDFDocument.create();
        
        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach(page => mergedPdf.addPage(page));
        }
        
        const pdfBytes = await mergedPdf.save();
        setResult(new Blob([pdfBytes], { type: "application/pdf" }));
      } catch (error) {
        console.error("Error merging PDFs:", error);
      }
      setLoading(false);
    });
  };

  const download = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const link = document.createElement("a");
      link.download = "merged.pdf";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropZone accept=".pdf" multiple onFiles={handleFiles}>
          <Upload className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Drop PDF files here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-2">Select multiple PDFs to merge</p>
        </FileDropZone>

        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Files to merge ({files.length})</Label>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <FileText className="w-5 h-5 text-red-500" />
                  <span className="flex-1 truncate text-sm">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    data-testid={`button-remove-${index}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={merge} 
          disabled={loading || files.length < 2} 
          className="w-full"
          data-testid="button-merge"
        >
          {loading ? "Merging..." : `Merge ${files.length} PDFs`}
        </Button>

        {loading && <LoadingSpinner text="Merging PDF files..." />}

        {result && !loading && (
          <ResultDisplay title="Merged PDF Ready">
            <Button onClick={download} className="w-full" data-testid="button-download">
              <Download className="w-4 h-4 mr-2" />
              Download Merged PDF
            </Button>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function PDFSplit() {
  const tool = getToolById("pdf-split")!;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitPage, setSplitPage] = useState("");
  const [results, setResults] = useState<Blob[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (files: File[]) => {
    const pdfFile = files[0];
    if (!pdfFile || pdfFile.type !== "application/pdf") return;
    
    setFile(pdfFile);
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    setPageCount(pdf.getPageCount());
    setSplitPage(String(Math.ceil(pdf.getPageCount() / 2)));
  };

  const split = async () => {
    if (!file) return;
    
    setLoading(true);
    simulateProcessing(async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const splitAt = parseInt(splitPage) || Math.ceil(pageCount / 2);
        
        const pdf1 = await PDFDocument.create();
        const pdf2 = await PDFDocument.create();
        
        const pages1 = await pdf1.copyPages(pdf, Array.from({ length: splitAt }, (_, i) => i));
        pages1.forEach(page => pdf1.addPage(page));
        
        const pages2 = await pdf2.copyPages(pdf, Array.from({ length: pageCount - splitAt }, (_, i) => i + splitAt));
        pages2.forEach(page => pdf2.addPage(page));
        
        const bytes1 = await pdf1.save();
        const bytes2 = await pdf2.save();
        
        setResults([
          new Blob([bytes1], { type: "application/pdf" }),
          new Blob([bytes2], { type: "application/pdf" })
        ]);
      } catch (error) {
        console.error("Error splitting PDF:", error);
      }
      setLoading(false);
    });
  };

  const downloadPart = (index: number) => {
    const result = results[index];
    if (result) {
      const url = URL.createObjectURL(result);
      const link = document.createElement("a");
      link.download = `split-part-${index + 1}.pdf`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <FileDropZone accept=".pdf" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a PDF file here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
              <FileText className="w-8 h-8 text-red-500" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{pageCount} pages</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Split after page</Label>
              <Input
                type="number"
                value={splitPage}
                onChange={(e) => setSplitPage(e.target.value)}
                min={1}
                max={pageCount - 1}
                data-testid="input-split-page"
              />
              <p className="text-xs text-muted-foreground">
                Part 1: Pages 1-{splitPage || 1} | Part 2: Pages {(parseInt(splitPage) || 1) + 1}-{pageCount}
              </p>
            </div>

            <Button onClick={split} disabled={loading} className="w-full" data-testid="button-split">
              {loading ? "Splitting..." : "Split PDF"}
            </Button>

            <Button variant="outline" onClick={() => { setFile(null); setResults([]); }} className="w-full">
              Upload New PDF
            </Button>

            {loading && <LoadingSpinner text="Splitting PDF..." />}

            {results.length > 0 && !loading && (
              <ResultDisplay title="Split Complete">
                <div className="space-y-2">
                  {results.map((_, index) => (
                    <Button
                      key={index}
                      onClick={() => downloadPart(index)}
                      variant="outline"
                      className="w-full"
                      data-testid={`button-download-${index}`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Part {index + 1}
                    </Button>
                  ))}
                </div>
              </ResultDisplay>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function PDFReorder() {
  const tool = getToolById("pdf-reorder")!;
  const [file, setFile] = useState<File | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (files: File[]) => {
    const pdfFile = files[0];
    if (!pdfFile || pdfFile.type !== "application/pdf") return;
    
    setFile(pdfFile);
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    setPageOrder(Array.from({ length: pdf.getPageCount() }, (_, i) => i));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...pageOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setPageOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === pageOrder.length - 1) return;
    const newOrder = [...pageOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setPageOrder(newOrder);
  };

  const reorder = async () => {
    if (!file) return;
    
    setLoading(true);
    simulateProcessing(async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const newPdf = await PDFDocument.create();
        
        const copiedPages = await newPdf.copyPages(pdf, pageOrder);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        setResult(new Blob([pdfBytes], { type: "application/pdf" }));
      } catch (error) {
        console.error("Error reordering PDF:", error);
      }
      setLoading(false);
    });
  };

  const download = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const link = document.createElement("a");
      link.download = "reordered.pdf";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <FileDropZone accept=".pdf" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a PDF file here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <Label>Drag pages to reorder ({pageOrder.length} pages)</Label>
            <div className="space-y-2 max-h-96 overflow-auto">
              {pageOrder.map((page, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="font-mono text-sm w-8">{index + 1}.</span>
                  <FileText className="w-5 h-5 text-red-500" />
                  <span className="flex-1 text-sm">Page {page + 1}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => moveUp(index)} disabled={index === 0}>
                      Up
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => moveDown(index)} disabled={index === pageOrder.length - 1}>
                      Down
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={reorder} disabled={loading} className="w-full" data-testid="button-reorder">
              {loading ? "Reordering..." : "Apply New Order"}
            </Button>

            <Button variant="outline" onClick={() => { setFile(null); setResult(null); }} className="w-full">
              Upload New PDF
            </Button>

            {loading && <LoadingSpinner text="Reordering pages..." />}

            {result && !loading && (
              <ResultDisplay title="Reordered PDF Ready">
                <Button onClick={download} className="w-full" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download Reordered PDF
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function ImagesToPDF() {
  const tool = getToolById("images-to-pdf")!;
  const [images, setImages] = useState<{file: File; url: string}[]>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    const newImages = imageFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index].url);
    setImages(images.filter((_, i) => i !== index));
  };

  const convert = async () => {
    if (images.length === 0) return;
    
    setLoading(true);
    simulateProcessing(async () => {
      try {
        const pdfDoc = await PDFDocument.create();
        
        for (const { file } of images) {
          const arrayBuffer = await file.arrayBuffer();
          let image;
          
          if (file.type === "image/jpeg" || file.type === "image/jpg") {
            image = await pdfDoc.embedJpg(arrayBuffer);
          } else if (file.type === "image/png") {
            image = await pdfDoc.embedPng(arrayBuffer);
          } else {
            continue;
          }
          
          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height
          });
        }
        
        const pdfBytes = await pdfDoc.save();
        setResult(new Blob([pdfBytes], { type: "application/pdf" }));
      } catch (error) {
        console.error("Error creating PDF:", error);
      }
      setLoading(false);
    });
  };

  const download = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const link = document.createElement("a");
      link.download = "images.pdf";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropZone accept="image/jpeg,image/png" multiple onFiles={handleFiles}>
          <Upload className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Drop images here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-2">Supports JPG and PNG</p>
        </FileDropZone>

        {images.length > 0 && (
          <div className="space-y-2">
            <Label>Images to convert ({images.length})</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img.url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={convert} 
          disabled={loading || images.length === 0} 
          className="w-full"
          data-testid="button-convert"
        >
          {loading ? "Converting..." : "Create PDF"}
        </Button>

        {loading && <LoadingSpinner text="Creating PDF from images..." />}

        {result && !loading && (
          <ResultDisplay title="PDF Created">
            <Button onClick={download} className="w-full" data-testid="button-download">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function PDFViewer() {
  const tool = getToolById("pdf-viewer")!;
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || file.type !== "application/pdf") return;
    
    setFileName(file.name);
    setFileUrl(URL.createObjectURL(file));
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!fileUrl ? (
          <FileDropZone accept=".pdf" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a PDF file here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-red-500" />
                <span className="font-medium">{fileName}</span>
              </div>
              <Button variant="outline" onClick={() => setFileUrl(null)}>
                Upload New PDF
              </Button>
            </div>
            
            <div className="border border-border rounded-lg overflow-hidden" style={{ height: "70vh" }}>
              <iframe
                src={fileUrl}
                title="PDF Viewer"
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function PDFExtract() {
  const tool = getToolById("pdf-extract")!;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageRange, setPageRange] = useState("");
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (files: File[]) => {
    const pdfFile = files[0];
    if (!pdfFile || pdfFile.type !== "application/pdf") return;
    
    setFile(pdfFile);
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    setPageCount(pdf.getPageCount());
    setPageRange("1");
  };

  const extract = async () => {
    if (!file || !pageRange) return;
    
    setLoading(true);
    simulateProcessing(async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const newPdf = await PDFDocument.create();
        
        const pages = pageRange.split(",").flatMap(part => {
          const range = part.trim().split("-");
          if (range.length === 2) {
            const start = parseInt(range[0]) - 1;
            const end = parseInt(range[1]) - 1;
            return Array.from({ length: end - start + 1 }, (_, i) => i + start);
          }
          return [parseInt(part) - 1];
        }).filter(p => p >= 0 && p < pageCount);
        
        const copiedPages = await newPdf.copyPages(pdf, pages);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        setResult(new Blob([pdfBytes], { type: "application/pdf" }));
      } catch (error) {
        console.error("Error extracting pages:", error);
      }
      setLoading(false);
    });
  };

  const download = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const link = document.createElement("a");
      link.download = "extracted-pages.pdf";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <FileDropZone accept=".pdf" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a PDF file here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
              <FileText className="w-8 h-8 text-red-500" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{pageCount} pages</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pages to extract</Label>
              <Input
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="e.g., 1, 3, 5-7"
                data-testid="input-pages"
              />
              <p className="text-xs text-muted-foreground">
                Enter page numbers separated by commas. Use "-" for ranges.
              </p>
            </div>

            <Button onClick={extract} disabled={loading} className="w-full" data-testid="button-extract">
              {loading ? "Extracting..." : "Extract Pages"}
            </Button>

            <Button variant="outline" onClick={() => { setFile(null); setResult(null); }} className="w-full">
              Upload New PDF
            </Button>

            {loading && <LoadingSpinner text="Extracting pages..." />}

            {result && !loading && (
              <ResultDisplay title="Extracted Pages Ready">
                <Button onClick={download} className="w-full" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download Extracted PDF
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function PDFRotate() {
  const tool = getToolById("pdf-rotate")!;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotation, setRotation] = useState(90);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (files: File[]) => {
    const pdfFile = files[0];
    if (!pdfFile || pdfFile.type !== "application/pdf") return;
    
    setFile(pdfFile);
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    setPageCount(pdf.getPageCount());
  };

  const rotate = async () => {
    if (!file) return;
    
    setLoading(true);
    simulateProcessing(async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        
        const pages = pdf.getPages();
        pages.forEach(page => {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + rotation));
        });
        
        const pdfBytes = await pdf.save();
        setResult(new Blob([pdfBytes], { type: "application/pdf" }));
      } catch (error) {
        console.error("Error rotating PDF:", error);
      }
      setLoading(false);
    });
  };

  const download = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const link = document.createElement("a");
      link.download = "rotated.pdf";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <FileDropZone accept=".pdf" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a PDF file here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
              <FileText className="w-8 h-8 text-red-500" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{pageCount} pages</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rotation</Label>
              <div className="flex gap-2">
                {[90, 180, 270].map((deg) => (
                  <Button
                    key={deg}
                    variant={rotation === deg ? "default" : "outline"}
                    onClick={() => setRotation(deg)}
                    className="flex-1"
                    data-testid={`button-rotate-${deg}`}
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    {deg}°
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={rotate} disabled={loading} className="w-full" data-testid="button-rotate">
              {loading ? "Rotating..." : "Rotate All Pages"}
            </Button>

            <Button variant="outline" onClick={() => { setFile(null); setResult(null); }} className="w-full">
              Upload New PDF
            </Button>

            {loading && <LoadingSpinner text="Rotating pages..." />}

            {result && !loading && (
              <ResultDisplay title="Rotated PDF Ready">
                <Button onClick={download} className="w-full" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download Rotated PDF
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function PDFMetadata() {
  const tool = getToolById("pdf-metadata")!;
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<{
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
    pageCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (files: File[]) => {
    const pdfFile = files[0];
    if (!pdfFile || pdfFile.type !== "application/pdf") return;
    
    setFile(pdfFile);
    setLoading(true);
    
    simulateProcessing(async () => {
      try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        
        setMetadata({
          title: pdf.getTitle(),
          author: pdf.getAuthor(),
          subject: pdf.getSubject(),
          creator: pdf.getCreator(),
          producer: pdf.getProducer(),
          creationDate: pdf.getCreationDate(),
          modificationDate: pdf.getModificationDate(),
          pageCount: pdf.getPageCount()
        });
      } catch (error) {
        console.error("Error reading metadata:", error);
      }
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <FileDropZone accept=".pdf" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a PDF file here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
              <FileText className="w-8 h-8 text-red-500" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>

            {loading && <LoadingSpinner text="Reading metadata..." />}

            {metadata && !loading && (
              <ResultDisplay title="PDF Metadata">
                <div className="space-y-3">
                  <MetadataRow label="Title" value={metadata.title} />
                  <MetadataRow label="Author" value={metadata.author} />
                  <MetadataRow label="Subject" value={metadata.subject} />
                  <MetadataRow label="Creator" value={metadata.creator} />
                  <MetadataRow label="Producer" value={metadata.producer} />
                  <MetadataRow 
                    label="Created" 
                    value={metadata.creationDate?.toLocaleDateString()} 
                  />
                  <MetadataRow 
                    label="Modified" 
                    value={metadata.modificationDate?.toLocaleDateString()} 
                  />
                  <MetadataRow label="Pages" value={String(metadata.pageCount)} />
                </div>
              </ResultDisplay>
            )}

            <Button variant="outline" onClick={() => { setFile(null); setMetadata(null); }} className="w-full">
              Upload New PDF
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

function MetadataRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "Not specified"}</span>
    </div>
  );
}

export function PDFCompressor() {
  const tool = getToolById("pdf-compressor")!;
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ blob: Blob; originalSize: number; compressedSize: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = (files: File[]) => {
    const pdfFile = files[0];
    if (!pdfFile || pdfFile.type !== "application/pdf") return;
    setFile(pdfFile);
    setResult(null);
  };

  const compress = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pdfBytes = await pdf.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      
      setResult({
        blob,
        originalSize: file.size,
        compressedSize: blob.size
      });
    } catch (error) {
      console.error("Error compressing PDF:", error);
    }
    setLoading(false);
  };

  const download = () => {
    if (result) {
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.download = "compressed.pdf";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <FileDropZone accept=".pdf" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a PDF file here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
              <FileText className="w-8 h-8 text-red-500" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">Original size: {formatSize(file.size)}</p>
              </div>
            </div>

            <Button onClick={compress} disabled={loading} className="w-full">
              {loading ? "Compressing..." : "Compress PDF"}
            </Button>

            {loading && <LoadingSpinner text="Compressing PDF..." />}

            {result && !loading && (
              <ResultDisplay title="Compressed PDF">
                <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Original</p>
                    <p className="font-bold">{formatSize(result.originalSize)}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Compressed</p>
                    <p className="font-bold text-primary">{formatSize(result.compressedSize)}</p>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  {result.compressedSize < result.originalSize 
                    ? `Reduced by ${Math.round((1 - result.compressedSize / result.originalSize) * 100)}%`
                    : "PDF is already optimized"}
                </p>
                <Button onClick={download} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Compressed PDF
                </Button>
              </ResultDisplay>
            )}

            <Button variant="outline" onClick={() => { setFile(null); setResult(null); }} className="w-full">
              Upload New PDF
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function PDFPageExtractor() {
  const tool = getToolById("pdf-page-extractor")!;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (files: File[]) => {
    const pdfFile = files[0];
    if (!pdfFile || pdfFile.type !== "application/pdf") return;
    
    setFile(pdfFile);
    setResult(null);
    
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const count = pdf.getPageCount();
      setPageCount(count);
      setStartPage("1");
      setEndPage(String(count));
    } catch (error) {
      console.error("Error loading PDF:", error);
    }
  };

  const extract = async () => {
    if (!file) return;
    
    const start = parseInt(startPage) - 1;
    const end = parseInt(endPage);
    
    if (start < 0 || end > pageCount || start >= end) return;
    
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      const pageIndices = Array.from({ length: end - start }, (_, i) => start + i);
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      setResult(new Blob([pdfBytes], { type: "application/pdf" }));
    } catch (error) {
      console.error("Error extracting pages:", error);
    }
    setLoading(false);
  };

  const download = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const link = document.createElement("a");
      link.download = `pages-${startPage}-${endPage}.pdf`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <FileDropZone accept=".pdf" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a PDF file here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
              <FileText className="w-8 h-8 text-red-500" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{pageCount} pages</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Page</Label>
                <Input
                  type="number"
                  min="1"
                  max={pageCount}
                  value={startPage}
                  onChange={(e) => setStartPage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Page</Label>
                <Input
                  type="number"
                  min="1"
                  max={pageCount}
                  value={endPage}
                  onChange={(e) => setEndPage(e.target.value)}
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Extracting pages {startPage} to {endPage} ({Math.max(0, parseInt(endPage || "0") - parseInt(startPage || "0") + 1)} pages)
            </p>

            <Button onClick={extract} disabled={loading} className="w-full">
              {loading ? "Extracting..." : "Extract Pages"}
            </Button>

            {loading && <LoadingSpinner text="Extracting pages..." />}

            {result && !loading && (
              <ResultDisplay title="Extracted Pages">
                <Button onClick={download} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Extracted PDF
                </Button>
              </ResultDisplay>
            )}

            <Button variant="outline" onClick={() => { setFile(null); setResult(null); }} className="w-full">
              Upload New PDF
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function PDFPageReorderTool() {
  const tool = getToolById("pdf-page-reorder")!;
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<number[]>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (files: File[]) => {
    const pdfFile = files[0];
    if (!pdfFile || pdfFile.type !== "application/pdf") return;
    
    setFile(pdfFile);
    setResult(null);
    
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const count = pdf.getPageCount();
      setPages(Array.from({ length: count }, (_, i) => i));
    } catch (error) {
      console.error("Error loading PDF:", error);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newPages = [...pages];
    [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
    setPages(newPages);
  };

  const moveDown = (index: number) => {
    if (index === pages.length - 1) return;
    const newPages = [...pages];
    [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
    setPages(newPages);
  };

  const reorder = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      const copiedPages = await newPdf.copyPages(sourcePdf, pages);
      copiedPages.forEach(page => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      setResult(new Blob([pdfBytes], { type: "application/pdf" }));
    } catch (error) {
      console.error("Error reordering PDF:", error);
    }
    setLoading(false);
  };

  const download = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const link = document.createElement("a");
      link.download = "reordered.pdf";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <FileDropZone accept=".pdf" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a PDF file here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
              <FileText className="w-8 h-8 text-red-500" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{pages.length} pages</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Page Order (use arrows to reorder)</Label>
              <div className="space-y-2 max-h-64 overflow-auto">
                {pages.map((pageNum, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">Page {pageNum + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                    >
                      <RotateCw className="w-4 h-4 rotate-90" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveDown(index)}
                      disabled={index === pages.length - 1}
                    >
                      <RotateCw className="w-4 h-4 -rotate-90" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={reorder} disabled={loading} className="w-full">
              {loading ? "Reordering..." : "Apply New Order"}
            </Button>

            {loading && <LoadingSpinner text="Reordering pages..." />}

            {result && !loading && (
              <ResultDisplay title="Reordered PDF">
                <Button onClick={download} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Reordered PDF
                </Button>
              </ResultDisplay>
            )}

            <Button variant="outline" onClick={() => { setFile(null); setResult(null); setPages([]); }} className="w-full">
              Upload New PDF
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
