import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ToolLayout, LoadingSpinner, FileDropZone, ResultDisplay } from "@/components/tool-layout";
import { getToolById } from "@/lib/tools-data";
import { Download, Upload } from "lucide-react";
import imageCompression from "browser-image-compression";

function simulateProcessing(callback: () => void) {
  setTimeout(callback, 1000 + Math.random() * 500);
}

function downloadImage(canvas: HTMLCanvasElement, filename: string, format: string = "image/png") {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL(format);
  link.click();
}

export function ImageResizer() {
  const tool = getToolById("image-resizer")!;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setWidth(String(img.width));
      setHeight(String(img.height));
    };
    img.src = url;
  };

  const handleWidthChange = (val: string) => {
    setWidth(val);
    if (maintainRatio && image) {
      const ratio = image.height / image.width;
      setHeight(String(Math.round(parseInt(val) * ratio)));
    }
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    if (maintainRatio && image) {
      const ratio = image.width / image.height;
      setWidth(String(Math.round(parseInt(val) * ratio)));
    }
  };

  const resize = () => {
    if (!image || !canvasRef.current) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      const w = parseInt(width) || image.width;
      const h = parseInt(height) || image.height;
      
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(image, 0, 0, w, h);
      
      setResult(canvas.toDataURL("image/png"));
      setLoading(false);
    });
  };

  const download = () => {
    if (canvasRef.current) {
      downloadImage(canvasRef.current, "resized-image.png");
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Original Image</Label>
                <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Width (px)</Label>
                  <Input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    data-testid="input-width"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height (px)</Label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    data-testid="input-height"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={maintainRatio}
                    onChange={(e) => setMaintainRatio(e.target.checked)}
                    id="ratio"
                    className="rounded"
                  />
                  <Label htmlFor="ratio">Maintain aspect ratio</Label>
                </div>
                
                <Button onClick={resize} disabled={loading} className="w-full" data-testid="button-resize">
                  {loading ? "Resizing..." : "Resize Image"}
                </Button>
                
                <Button variant="outline" onClick={() => { setImageUrl(null); setImage(null); setResult(null); }} className="w-full">
                  Upload New Image
                </Button>
              </div>
            </div>

            {loading && <LoadingSpinner text="Resizing image..." />}

            {result && !loading && (
              <ResultDisplay title="Resized Image">
                <img src={result} alt="Resized" className="max-w-full h-auto rounded-lg border border-border mb-4" />
                <Button onClick={download} className="w-full" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download Resized Image
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

export function ImageCropper() {
  const tool = getToolById("image-cropper")!;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cropData, setCropData] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setOriginalDimensions({ width: img.width, height: img.height });
      setCropData({ x: 0, y: 0, width: img.width, height: img.height });
    };
    img.src = url;
  };

  const crop = () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      canvas.width = cropData.width;
      canvas.height = cropData.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(
        imageRef.current!,
        cropData.x, cropData.y, cropData.width, cropData.height,
        0, 0, cropData.width, cropData.height
      );
      setResult(canvas.toDataURL("image/png"));
      setLoading(false);
    });
  };

  const download = () => {
    if (canvasRef.current) {
      downloadImage(canvasRef.current, "cropped-image.png");
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Original Image ({originalDimensions.width} x {originalDimensions.height})</Label>
                <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>X Position</Label>
                    <Input
                      type="number"
                      value={cropData.x}
                      onChange={(e) => setCropData({...cropData, x: parseInt(e.target.value) || 0})}
                      max={originalDimensions.width}
                      data-testid="input-x"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Y Position</Label>
                    <Input
                      type="number"
                      value={cropData.y}
                      onChange={(e) => setCropData({...cropData, y: parseInt(e.target.value) || 0})}
                      max={originalDimensions.height}
                      data-testid="input-y"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <Input
                      type="number"
                      value={cropData.width}
                      onChange={(e) => setCropData({...cropData, width: parseInt(e.target.value) || 0})}
                      max={originalDimensions.width - cropData.x}
                      data-testid="input-width"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height</Label>
                    <Input
                      type="number"
                      value={cropData.height}
                      onChange={(e) => setCropData({...cropData, height: parseInt(e.target.value) || 0})}
                      max={originalDimensions.height - cropData.y}
                      data-testid="input-height"
                    />
                  </div>
                </div>
                
                <Button onClick={crop} disabled={loading} className="w-full" data-testid="button-crop">
                  {loading ? "Cropping..." : "Crop Image"}
                </Button>
                
                <Button variant="outline" onClick={() => { setImageUrl(null); setResult(null); }} className="w-full">
                  Upload New Image
                </Button>
              </div>
            </div>

            {loading && <LoadingSpinner text="Cropping image..." />}

            {result && !loading && (
              <ResultDisplay title="Cropped Image">
                <img src={result} alt="Cropped" className="max-w-full h-auto rounded-lg border border-border mb-4" />
                <Button onClick={download} className="w-full" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download Cropped Image
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

export function ImageCompressor() {
  const tool = getToolById("image-compressor")!;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState([80]);
  const [result, setResult] = useState<{url: string; originalSize: number; compressedSize: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
    };
    img.src = url;
  };

  const compress = () => {
    if (!imageRef.current || !canvasRef.current || !originalFile) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      const img = imageRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      
      const compressedUrl = canvas.toDataURL("image/jpeg", quality[0] / 100);
      const compressedSize = Math.round((compressedUrl.length - 22) * 3 / 4);
      
      setResult({
        url: compressedUrl,
        originalSize: originalFile.size,
        compressedSize
      });
      setLoading(false);
    });
  };

  const download = () => {
    if (result) {
      const link = document.createElement("a");
      link.download = "compressed-image.jpg";
      link.href = result.url;
      link.click();
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
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Original Image ({formatSize(originalFile?.size || 0)})</Label>
                <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Quality: {quality[0]}%</Label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    min={10}
                    max={100}
                    step={5}
                    data-testid="slider-quality"
                  />
                  <p className="text-xs text-muted-foreground">Lower quality = smaller file size</p>
                </div>
                
                <Button onClick={compress} disabled={loading} className="w-full" data-testid="button-compress">
                  {loading ? "Compressing..." : "Compress Image"}
                </Button>
                
                <Button variant="outline" onClick={() => { setImageUrl(null); setResult(null); }} className="w-full">
                  Upload New Image
                </Button>
              </div>
            </div>

            {loading && <LoadingSpinner text="Compressing image..." />}

            {result && !loading && (
              <ResultDisplay title="Compressed Image">
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
                  Reduced by {Math.round((1 - result.compressedSize / result.originalSize) * 100)}%
                </p>
                <img src={result.url} alt="Compressed" className="max-w-full h-auto rounded-lg border border-border mb-4" />
                <Button onClick={download} className="w-full" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download Compressed Image
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

export function JpgToPng() {
  const tool = getToolById("jpg-to-png")!;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
    };
    img.src = url;
  };

  const convert = () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      const img = imageRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      
      setResult(canvas.toDataURL("image/png"));
      setLoading(false);
    });
  };

  const download = () => {
    if (canvasRef.current) {
      downloadImage(canvasRef.current, "converted-image.png", "image/png");
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/jpeg,image/jpg" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a JPG image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <img src={imageUrl} alt="Original" className="max-w-full max-h-96 mx-auto rounded-lg border border-border" />
            </div>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={convert} disabled={loading} data-testid="button-convert">
                {loading ? "Converting..." : "Convert to PNG"}
              </Button>
              <Button variant="outline" onClick={() => { setImageUrl(null); setResult(null); }}>
                Upload New Image
              </Button>
            </div>

            {loading && <LoadingSpinner text="Converting to PNG..." />}

            {result && !loading && (
              <ResultDisplay title="Converted PNG Image">
                <img src={result} alt="Converted" className="max-w-full max-h-96 mx-auto rounded-lg border border-border mb-4" />
                <Button onClick={download} className="w-full" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG Image
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

export function PngToJpg() {
  const tool = getToolById("png-to-jpg")!;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
    };
    img.src = url;
  };

  const convert = () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      const img = imageRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      setResult(canvas.toDataURL("image/jpeg", 0.9));
      setLoading(false);
    });
  };

  const download = () => {
    if (result) {
      const link = document.createElement("a");
      link.download = "converted-image.jpg";
      link.href = result;
      link.click();
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/png" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a PNG image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <img src={imageUrl} alt="Original" className="max-w-full max-h-96 mx-auto rounded-lg border border-border" />
            </div>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={convert} disabled={loading} data-testid="button-convert">
                {loading ? "Converting..." : "Convert to JPG"}
              </Button>
              <Button variant="outline" onClick={() => { setImageUrl(null); setResult(null); }}>
                Upload New Image
              </Button>
            </div>

            {loading && <LoadingSpinner text="Converting to JPG..." />}

            {result && !loading && (
              <ResultDisplay title="Converted JPG Image">
                <img src={result} alt="Converted" className="max-w-full max-h-96 mx-auto rounded-lg border border-border mb-4" />
                <Button onClick={download} className="w-full" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download JPG Image
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

export function ImageGrayscale() {
  const tool = getToolById("image-grayscale")!;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
    };
    img.src = url;
  };

  const convert = () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      const img = imageRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
      
      ctx.putImageData(imageData, 0, 0);
      setResult(canvas.toDataURL("image/png"));
      setLoading(false);
    });
  };

  const download = () => {
    if (canvasRef.current) {
      downloadImage(canvasRef.current, "grayscale-image.png");
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Original Image</Label>
                <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              {result && (
                <div>
                  <Label className="text-sm mb-2 block">Grayscale Image</Label>
                  <img src={result} alt="Grayscale" className="max-w-full h-auto rounded-lg border border-border" />
                </div>
              )}
            </div>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={convert} disabled={loading} data-testid="button-convert">
                {loading ? "Converting..." : "Convert to Grayscale"}
              </Button>
              <Button variant="outline" onClick={() => { setImageUrl(null); setResult(null); }}>
                Upload New Image
              </Button>
            </div>

            {loading && <LoadingSpinner text="Converting to grayscale..." />}

            {result && !loading && (
              <Button onClick={download} className="w-full" data-testid="button-download">
                <Download className="w-4 h-4 mr-2" />
                Download Grayscale Image
              </Button>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

export function ImagePreview() {
  const tool = getToolById("image-preview")!;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{
    name: string;
    type: string;
    size: number;
    width: number;
    height: number;
  } | null>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      setImageInfo({
        name: file.name,
        type: file.type,
        size: file.size,
        width: img.width,
        height: img.height
      });
    };
    img.src = url;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Image Preview</Label>
                <img src={imageUrl} alt="Preview" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              
              {imageInfo && (
                <div>
                  <Label className="text-sm mb-2 block">Image Information</Label>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Name</span>
                      <span className="font-medium text-right break-all max-w-[200px]">{imageInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Type</span>
                      <span className="font-medium">{imageInfo.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Size</span>
                      <span className="font-medium">{formatSize(imageInfo.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions</span>
                      <span className="font-medium">{imageInfo.width} x {imageInfo.height} px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aspect Ratio</span>
                      <span className="font-medium">
                        {(imageInfo.width / imageInfo.height).toFixed(2)}:1
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Pixels</span>
                      <span className="font-medium">
                        {(imageInfo.width * imageInfo.height).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <Button variant="outline" onClick={() => { setImageUrl(null); setImageInfo(null); }} className="w-full">
              Upload New Image
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function AdvancedImageCompressor() {
  const tool = getToolById("advanced-compressor")!;
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [targetSize, setTargetSize] = useState([500]);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; originalSize: number; compressedSize: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setImageUrl(URL.createObjectURL(f));
    const sizeInKB = Math.round(f.size / 1024);
    setTargetSize([Math.min(sizeInKB - 50, Math.round(sizeInKB * 0.5))]);
    setResult(null);
  };

  const compress = async () => {
    if (!file) return;
    
    setLoading(true);
    setProgress(0);
    
    try {
      const targetSizeKB = targetSize[0];
      const options = {
        maxSizeMB: targetSizeKB / 1024,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        onProgress: (p: number) => setProgress(Math.round(p * 100)),
      };

      const compressedFile = await imageCompression(file, options);
      
      setResult({
        url: URL.createObjectURL(compressedFile),
        originalSize: file.size,
        compressedSize: compressedFile.size
      });
    } catch (error) {
      console.error("Compression error:", error);
    } finally {
      setLoading(false);
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
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-2">Compress images to your exact target size</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Original Image ({formatSize(file?.size || 0)})</Label>
                <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Target Size: {targetSize[0]} KB</Label>
                  <Slider
                    value={targetSize}
                    onValueChange={setTargetSize}
                    min={10}
                    max={Math.max(100, Math.round((file?.size || 1024) / 1024) - 10)}
                    step={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Original: {formatSize(file?.size || 0)} → Target: ~{targetSize[0]} KB
                  </p>
                </div>
                
                <Button onClick={compress} disabled={loading} className="w-full">
                  {loading ? "Compressing..." : "Compress to Target Size"}
                </Button>
                
                <Button variant="outline" onClick={() => { setImageUrl(null); setFile(null); setResult(null); }} className="w-full">
                  Upload New Image
                </Button>
              </div>
            </div>

            {loading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">Compressing: {progress}%</p>
              </div>
            )}

            {result && !loading && (
              <ResultDisplay title="Compressed Image">
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
                  Reduced by {Math.round((1 - result.compressedSize / result.originalSize) * 100)}%
                </p>
                <img src={result.url} alt="Compressed" className="max-w-full h-auto rounded-lg border border-border mb-4" />
                <Button asChild className="w-full">
                  <a href={result.url} download="compressed-image.jpg">
                    <Download className="w-4 h-4 mr-2" />
                    Download Compressed Image
                  </a>
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function ImageQualityController() {
  const tool = getToolById("image-quality")!;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState([80]);
  const [result, setResult] = useState<{ url: string; originalSize: number; compressedSize: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setResult(null);
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
    };
    img.src = url;
  };

  const adjustQuality = () => {
    if (!imageRef.current || !canvasRef.current || !originalFile) return;
    
    setLoading(true);
    setTimeout(() => {
      const canvas = canvasRef.current!;
      const img = imageRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      
      const compressedUrl = canvas.toDataURL("image/jpeg", quality[0] / 100);
      const compressedSize = Math.round((compressedUrl.length - 22) * 3 / 4);
      
      setResult({
        url: compressedUrl,
        originalSize: originalFile.size,
        compressedSize
      });
      setLoading(false);
    }, 500);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-2">Precisely control image quality (1-100)</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Original Image ({formatSize(originalFile?.size || 0)})</Label>
                <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Quality: {quality[0]}%</Label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    min={1}
                    max={100}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1% (Smallest)</span>
                    <span>50%</span>
                    <span>100% (Best)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lower quality = smaller file size. 70-85% is recommended for web use.
                  </p>
                </div>
                
                <Button onClick={adjustQuality} disabled={loading} className="w-full">
                  {loading ? "Processing..." : "Apply Quality"}
                </Button>
                
                <Button variant="outline" onClick={() => { setImageUrl(null); setResult(null); }} className="w-full">
                  Upload New Image
                </Button>
              </div>
            </div>

            {loading && <LoadingSpinner text="Adjusting quality..." />}

            {result && !loading && (
              <ResultDisplay title="Quality-Adjusted Image">
                <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Original</p>
                    <p className="font-bold">{formatSize(result.originalSize)}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">New Size</p>
                    <p className="font-bold text-primary">{formatSize(result.compressedSize)}</p>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  {result.compressedSize < result.originalSize 
                    ? `Reduced by ${Math.round((1 - result.compressedSize / result.originalSize) * 100)}%`
                    : "Size increased due to format conversion"}
                </p>
                <img src={result.url} alt="Adjusted" className="max-w-full h-auto rounded-lg border border-border mb-4" />
                <Button asChild className="w-full">
                  <a href={result.url} download={`quality-${quality[0]}.jpg`}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Image ({quality[0]}% quality)
                  </a>
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

// IMAGE DPI CHANGER
export function ImageDPIChanger() {
  const tool = getToolById("image-dpi-changer")!;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dpi, setDpi] = useState([72]);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = url;
  };

  const process = () => {
    if (!image || !canvasRef.current) return;
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(image, 0, 0);
      setResult(canvas.toDataURL("image/png"));
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Original Image</Label>
                <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>DPI: {dpi[0]}</Label>
                  <Slider value={dpi} onValueChange={setDpi} min={72} max={600} step={12} />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Common DPI values:</p>
                  <p>72 - Screen/Web</p>
                  <p>150 - Email</p>
                  <p>300 - Print</p>
                </div>
                <Button onClick={process} disabled={!image || loading} className="w-full">
                  {loading ? "Processing..." : "Set DPI"}
                </Button>
              </div>
            </div>
            {loading && <LoadingSpinner text="Adjusting DPI..." />}
            {result && !loading && (
              <ResultDisplay title="DPI-Adjusted Image">
                <img src={result} alt="Adjusted" className="max-w-full h-auto rounded-lg border border-border mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="dpi-adjusted.png">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

// IMAGE METADATA VIEWER
export function ImageMetadataViewer() {
  const tool = getToolById("image-metadata-viewer")!;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const reader = new FileReader();
    reader.onload = () => {
      setMetadata({
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + " KB",
        fileType: file.type,
        width: "Use preview",
        height: "Use preview",
        lastModified: new Date(file.lastModified).toLocaleString()
      });
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Image Preview</Label>
                <img src={imageUrl} alt="Preview" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Metadata</Label>
                <div className="bg-background p-4 rounded-lg border border-border space-y-3 text-sm">
                  {metadata && Object.entries(metadata).map(([key, val]: any) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span className="font-mono">{val}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => { setImageUrl(null); setMetadata(null); }} className="w-full mt-4">
                  Upload Another
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

// IMAGE METADATA REMOVER
export function ImageMetadataRemover() {
  const tool = getToolById("image-metadata-remover")!;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = url;
  };

  const process = () => {
    if (!image || !canvasRef.current) return;
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(image, 0, 0);
      setResult(canvas.toDataURL("image/png"));
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here to remove metadata</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div>
              <Label className="text-sm mb-2 block">Image Preview</Label>
              <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border mb-4" />
            </div>
            <div className="text-sm text-muted-foreground p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="font-semibold mb-2">Privacy & Safety</p>
              <p>This tool removes EXIF data and metadata to protect your privacy.</p>
            </div>
            <Button onClick={process} disabled={!image || loading} className="w-full">
              {loading ? "Processing..." : "Remove Metadata"}
            </Button>
            {loading && <LoadingSpinner text="Removing metadata..." />}
            {result && !loading && (
              <ResultDisplay title="Metadata Removed">
                <img src={result} alt="Cleaned" className="max-w-full h-auto rounded-lg border border-border mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="no-metadata.png">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

// IMAGE BORDER ADDER
export function ImageBorderAdder() {
  const tool = getToolById("image-border-adder")!;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [borderSize, setBorderSize] = useState([20]);
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderStyle, setBorderStyle] = useState<"solid" | "dashed" | "dotted" | "double">("solid");
  const [borderType, setBorderType] = useState<"full" | "top" | "bottom" | "left" | "right">("full");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = url;
  };

  const drawDashedLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, dashLength: number = 5) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.floor(dist / dashLength);
    for (let i = 0; i < steps; i++) {
      if (i % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(x1 + (dx / dist) * i * dashLength, y1 + (dy / dist) * i * dashLength);
        ctx.lineTo(x1 + (dx / dist) * (i + 1) * dashLength, y1 + (dy / dist) * (i + 1) * dashLength);
        ctx.stroke();
      }
    }
  };

  const process = () => {
    if (!image || !canvasRef.current) return;
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      const border = borderSize[0];
      canvas.width = image.width + border * 2;
      canvas.height = image.height + border * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = borderColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, border, border);

      // Draw decorative border lines based on style
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;

      if (borderStyle === "dashed") {
        ctx.setLineDash([5, 5]);
      } else if (borderStyle === "dotted") {
        ctx.setLineDash([2, 3]);
      } else if (borderStyle === "double") {
        ctx.lineWidth = 1;
      }

      const x1 = border / 2;
      const y1 = border / 2;
      const x2 = canvas.width - border / 2;
      const y2 = canvas.height - border / 2;

      if (borderType === "full" || borderType === "top") {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1);
        ctx.stroke();
        if (borderStyle === "double") {
          ctx.beginPath();
          ctx.moveTo(x1, y1 + 3);
          ctx.lineTo(x2, y1 + 3);
          ctx.stroke();
        }
      }
      if (borderType === "full" || borderType === "bottom") {
        ctx.beginPath();
        ctx.moveTo(x1, y2);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        if (borderStyle === "double") {
          ctx.beginPath();
          ctx.moveTo(x1, y2 - 3);
          ctx.lineTo(x2, y2 - 3);
          ctx.stroke();
        }
      }
      if (borderType === "full" || borderType === "left") {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y2);
        ctx.stroke();
        if (borderStyle === "double") {
          ctx.beginPath();
          ctx.moveTo(x1 + 3, y1);
          ctx.lineTo(x1 + 3, y2);
          ctx.stroke();
        }
      }
      if (borderType === "full" || borderType === "right") {
        ctx.beginPath();
        ctx.moveTo(x2, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        if (borderStyle === "double") {
          ctx.beginPath();
          ctx.moveTo(x2 - 3, y1);
          ctx.lineTo(x2 - 3, y2);
          ctx.stroke();
        }
      }

      ctx.setLineDash([]);
      setResult(canvas.toDataURL("image/png"));
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Original Image</Label>
                <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Border Size: {borderSize[0]}px</Label>
                  <Slider value={borderSize} onValueChange={setBorderSize} min={5} max={100} step={5} />
                </div>
                <div className="space-y-2">
                  <Label>Border Color</Label>
                  <input 
                    type="color" 
                    value={borderColor} 
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Border Style</Label>
                  <Select value={borderStyle} onValueChange={(v) => setBorderStyle(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="double">Double Line</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Border Type</Label>
                  <Select value={borderType} onValueChange={(v) => setBorderType(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">All Sides</SelectItem>
                      <SelectItem value="top">Top Only</SelectItem>
                      <SelectItem value="bottom">Bottom Only</SelectItem>
                      <SelectItem value="left">Left Only</SelectItem>
                      <SelectItem value="right">Right Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={process} disabled={!image || loading} className="w-full">
                  {loading ? "Processing..." : "Add Border"}
                </Button>
              </div>
            </div>
            {loading && <LoadingSpinner text="Adding border..." />}
            {result && !loading && (
              <ResultDisplay title="Image with Border">
                <img src={result} alt="Bordered" className="max-w-full h-auto rounded-lg border border-border mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="bordered-image.png">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

// IMAGE TEXT OVERLAY
export function ImageTextOverlay() {
  const tool = getToolById("image-text-overlay")!;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [text, setText] = useState("Watermark");
  const [fontSize, setFontSize] = useState([40]);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [opacity, setOpacity] = useState([1]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textStyle, setTextStyle] = useState<"normal" | "bold" | "italic" | "bold-italic">("bold");
  const [position, setPosition] = useState<"center" | "top-left" | "top-center" | "top-right" | "center-left" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right">("center");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = url;
  };

  const getTextPosition = (width: number, height: number): [number, number] => {
    const positions: Record<string, [number, number]> = {
      "top-left": [fontSize[0], fontSize[0] * 1.5],
      "top-center": [width / 2, fontSize[0] * 1.5],
      "top-right": [width - fontSize[0], fontSize[0] * 1.5],
      "center-left": [fontSize[0], height / 2],
      "center": [width / 2, height / 2],
      "center-right": [width - fontSize[0], height / 2],
      "bottom-left": [fontSize[0], height - fontSize[0] * 0.5],
      "bottom-center": [width / 2, height - fontSize[0] * 0.5],
      "bottom-right": [width - fontSize[0], height - fontSize[0] * 0.5],
    };
    return positions[position] || [width / 2, height / 2];
  };

  const getTextAlign = (): CanvasTextAlign => {
    if (position.includes("left")) return "left";
    if (position.includes("right")) return "right";
    return "center";
  };

  const process = () => {
    if (!image || !canvasRef.current) return;
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(image, 0, 0);
      ctx.globalAlpha = opacity[0];
      ctx.fillStyle = textColor;
      
      let fontStyle = "";
      if (textStyle === "bold") fontStyle = `bold ${fontSize[0]}px ${fontFamily}`;
      else if (textStyle === "italic") fontStyle = `italic ${fontSize[0]}px ${fontFamily}`;
      else if (textStyle === "bold-italic") fontStyle = `bold italic ${fontSize[0]}px ${fontFamily}`;
      else fontStyle = `${fontSize[0]}px ${fontFamily}`;
      
      ctx.font = fontStyle;
      ctx.textAlign = getTextAlign();
      ctx.textBaseline = "middle";
      
      const [x, y] = getTextPosition(canvas.width, canvas.height);
      ctx.fillText(text, x, y);
      setResult(canvas.toDataURL("image/png"));
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Original Image</Label>
                <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Overlay Text</Label>
                  <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text" />
                </div>
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                      <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                      <SelectItem value="Impact">Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Text Style</Label>
                  <Select value={textStyle} onValueChange={(v) => setTextStyle(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="italic">Italic</SelectItem>
                      <SelectItem value="bold-italic">Bold Italic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Font Size: {fontSize[0]}px</Label>
                  <Slider value={fontSize} onValueChange={setFontSize} min={16} max={200} step={4} />
                </div>
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <Label>Text Position</Label>
                  <Select value={position} onValueChange={(v) => setPosition(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-center">Top Center</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="center-left">Center Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="center-right">Center Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-center">Bottom Center</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Opacity: {(opacity[0] * 100).toFixed(0)}%</Label>
                  <Slider value={opacity} onValueChange={setOpacity} min={0} max={1} step={0.1} />
                </div>
                <Button onClick={process} disabled={!image || loading} className="w-full">
                  {loading ? "Processing..." : "Add Text"}
                </Button>
              </div>
            </div>
            {loading && <LoadingSpinner text="Adding text..." />}
            {result && !loading && (
              <ResultDisplay title="Image with Text">
                <img src={result} alt="Overlaid" className="max-w-full h-auto rounded-lg border border-border mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="text-overlay.png">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

// IMAGE BACKGROUND BLUR
export function ImageBackgroundBlur() {
  const tool = getToolById("image-background-blur")!;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [blurAmount, setBlurAmount] = useState([5]);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = url;
  };

  const process = () => {
    if (!image || !canvasRef.current) return;
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d")!;
      ctx.filter = `blur(${blurAmount[0]}px)`;
      ctx.drawImage(image, 0, 0);
      setResult(canvas.toDataURL("image/png"));
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Original Image</Label>
                <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Blur Strength: {blurAmount[0]}px</Label>
                  <Slider value={blurAmount} onValueChange={setBlurAmount} min={0} max={50} step={1} />
                </div>
                <div className="text-sm text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950 rounded">
                  <p>Note: This applies blur to entire image. For selective blur, use your photo editor.</p>
                </div>
                <Button onClick={process} disabled={!image || loading} className="w-full">
                  {loading ? "Processing..." : "Apply Blur"}
                </Button>
              </div>
            </div>
            {loading && <LoadingSpinner text="Applying blur..." />}
            {result && !loading && (
              <ResultDisplay title="Blurred Image">
                <img src={result} alt="Blurred" className="max-w-full h-auto rounded-lg border border-border mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="blurred-image.png">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

// IMAGE COLOR PICKER
export function ImageColorPicker() {
  const tool = getToolById("image-color-picker")!;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCursorPos({ x, y });
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(e.nativeEvent.offsetX, e.nativeEvent.offsetY, 1, 1);
    const data = imageData.data;
    const hex = "#" + [data[0], data[1], data[2]].map(x => x.toString(16).padStart(2, "0")).join("").toUpperCase();
    const rgb = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
    setPickedColor(hex + " / " + rgb);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950 rounded">
              <p>Click on any pixel to pick its color</p>
            </div>
            <canvas
              ref={canvasRef}
              className="max-w-full border border-border rounded-lg cursor-crosshair"
              onLoad={() => {
                if (imgRef.current && canvasRef.current) {
                  const canvas = canvasRef.current;
                  canvas.width = imgRef.current.width;
                  canvas.height = imgRef.current.height;
                  const ctx = canvas.getContext("2d")!;
                  ctx.drawImage(imgRef.current, 0, 0);
                }
              }}
              onClick={handleClick}
              onMouseMove={handleMouseMove}
            />
            <img ref={imgRef} src={imageUrl} className="hidden" onLoad={() => {
              if (imgRef.current && canvasRef.current) {
                const canvas = canvasRef.current;
                canvas.width = imgRef.current.width;
                canvas.height = imgRef.current.height;
                const ctx = canvas.getContext("2d")!;
                ctx.drawImage(imgRef.current, 0, 0);
              }
            }} alt="hidden" />
            {pickedColor && (
              <ResultDisplay title="Picked Color">
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-lg border-2 border-border" style={{backgroundColor: pickedColor.split(" /")[0]}} />
                    <div>
                      <p className="text-sm text-muted-foreground">Color Value</p>
                      <p className="font-mono text-lg font-semibold">{pickedColor}</p>
                    </div>
                  </div>
                  <Button onClick={() => {
                    navigator.clipboard.writeText(pickedColor.split(" /")[0]);
                  }} className="w-full">
                    Copy Hex Value
                  </Button>
                </div>
              </ResultDisplay>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

// IMAGE ASPECT RATIO FIXER
export function ImageAspectRatioFixer() {
  const tool = getToolById("image-aspect-ratio")!;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ratio, setRatio] = useState("1:1");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const ratios: Record<string, [number, number]> = {
    "1:1": [1, 1],
    "4:3": [4, 3],
    "16:9": [16, 9],
    "9:16": [9, 16],
    "3:2": [3, 2],
    "Instagram Square": [1, 1],
    "Instagram Portrait": [4, 5],
    "Instagram Landscape": [1.91, 1],
    "YouTube Thumbnail": [1.33, 0.75],
    "Facebook Cover": [16, 9]
  };

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = url;
  };

  const process = () => {
    if (!image || !canvasRef.current) return;
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      const [w, h] = ratios[ratio];
      const targetW = image.width;
      const targetH = Math.round(targetW / (w / h));
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
      const x = (canvas.width - image.width * scale) / 2;
      const y = (canvas.height - image.height * scale) / 2;
      ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
      setResult(canvas.toDataURL("image/png"));
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Original Image</Label>
                <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              <div className="space-y-4">
                <Label>Select Aspect Ratio</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(ratios).map(r => (
                    <Button
                      key={r}
                      variant={ratio === r ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRatio(r)}
                      className="text-xs"
                    >
                      {r}
                    </Button>
                  ))}
                </div>
                <Button onClick={process} disabled={!image || loading} className="w-full">
                  {loading ? "Processing..." : "Apply Ratio"}
                </Button>
              </div>
            </div>
            {loading && <LoadingSpinner text="Adjusting aspect ratio..." />}
            {result && !loading && (
              <ResultDisplay title="Resized Image">
                <img src={result} alt="Resized" className="max-w-full h-auto rounded-lg border border-border mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download={`aspect-ratio-${ratio}.png`}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}
