import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ToolLayout, LoadingSpinner, FileDropZone, ResultDisplay } from "@/components/tool-layout";
import { getToolById } from "@/lib/tools-data";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const MAX_AUDIO_SIZE = 50 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

const ffmpegInstance: { ffmpeg: FFmpeg | null; loadPromise: Promise<FFmpeg> | null } = {
  ffmpeg: null,
  loadPromise: null
};

function useFFmpeg() {
  const [loaded, setLoaded] = useState(!!ffmpegInstance.ffmpeg);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const load = async (): Promise<FFmpeg> => {
    if (ffmpegInstance.ffmpeg) {
      return ffmpegInstance.ffmpeg;
    }
    
    if (ffmpegInstance.loadPromise) {
      return ffmpegInstance.loadPromise;
    }
    
    setLoading(true);
    
    ffmpegInstance.loadPromise = (async () => {
      const ffmpeg = new FFmpeg();
      
      let lastProgress = -1;
      ffmpeg.on("progress", ({ progress: p }) => {
        const pct = Math.round(p * 100);
        if (pct !== lastProgress) {
          lastProgress = pct;
          setProgress(pct);
        }
      });

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      ffmpegInstance.ffmpeg = ffmpeg;
      setLoaded(true);
      setLoading(false);
      return ffmpeg;
    })();
    
    return ffmpegInstance.loadPromise;
  };

  return { ffmpeg: ffmpegInstance.ffmpeg, loaded, loading, load, progress, setProgress };
}

function FileSizeWarning({ maxSize, type }: { maxSize: number; type: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-600 dark:text-amber-400">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>Maximum {type} file size: {formatSize(maxSize)}. Larger files may cause browser issues.</span>
    </div>
  );
}

export function AudioCompressor() {
  const tool = getToolById("audio-compressor")!;
  const [file, setFile] = useState<File | null>(null);
  const [bitrate, setBitrate] = useState("128");
  const [result, setResult] = useState<{ url: string; originalSize: number; compressedSize: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ffmpeg, loaded, loading, load, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_AUDIO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_AUDIO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const compress = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp3";

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec(["-i", inputName, "-b:a", `${bitrate}k`, "-y", outputName]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      
      setResult({
        url,
        originalSize: file.size,
        compressedSize: blob.size
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compression failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_AUDIO_SIZE} type="audio" />
        
        {!file ? (
          <FileDropZone accept="audio/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an audio file here to compress</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <audio controls src={URL.createObjectURL(file)} className="w-full" />

            <div className="space-y-4">
              <div>
                <Label className="text-sm">Bitrate (kbps)</Label>
                <Select value={bitrate} onValueChange={setBitrate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="64">64 kbps (Lowest)</SelectItem>
                    <SelectItem value="96">96 kbps</SelectItem>
                    <SelectItem value="128">128 kbps (Default)</SelectItem>
                    <SelectItem value="192">192 kbps (High)</SelectItem>
                    <SelectItem value="320">320 kbps (Highest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={compress} disabled={processing || loading} className="w-full">
                {processing ? "Compressing..." : "Compress Audio"}
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Compressed Audio">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Original</p>
                    <p className="font-bold text-primary">{formatSize(result.originalSize)}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Compressed</p>
                    <p className="font-bold text-primary">{formatSize(result.compressedSize)}</p>
                  </div>
                </div>
                <audio controls src={result.url} className="w-full mb-4" />
                <Button asChild className="w-full">
                  <a href={result.url} download="compressed-audio.mp3">
                    <Download className="w-4 h-4 mr-2" />
                    Download MP3
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

export function AudioTrimmer() {
  const tool = getToolById("audio-trim")!;
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { ffmpeg, loaded, loading, load, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_AUDIO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_AUDIO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const trim = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp3";

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec([
        "-i", inputName,
        "-ss", startTime.toString(),
        "-to", endTime.toString(),
        "-y", outputName
      ]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mp3" });
      setResult(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trim failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_AUDIO_SIZE} type="audio" />
        
        {!file ? (
          <FileDropZone accept="audio/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an audio file here to trim</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <audio 
              ref={audioRef}
              controls 
              src={URL.createObjectURL(file)} 
              className="w-full"
              onLoadedMetadata={(e) => {
                const dur = (e.target as HTMLAudioElement).duration;
                setDuration(dur);
                setEndTime(dur);
              }}
            />

            <div className="space-y-4">
              <div>
                <Label>Start: {formatTime(startTime)}</Label>
                <Slider
                  value={[startTime]}
                  onValueChange={([v]) => setStartTime(Math.min(v, endTime))}
                  min={0}
                  max={duration}
                  step={0.1}
                />
              </div>

              <div>
                <Label>End: {formatTime(endTime)}</Label>
                <Slider
                  value={[endTime]}
                  onValueChange={([v]) => setEndTime(Math.max(v, startTime))}
                  min={0}
                  max={duration}
                  step={0.1}
                />
              </div>

              <Button onClick={trim} disabled={processing || loading} className="w-full">
                {processing ? "Trimming..." : "Trim Audio"}
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Trimmed Audio">
                <audio controls src={result} className="w-full mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="trimmed-audio.mp3">
                    <Download className="w-4 h-4 mr-2" />
                    Download MP3
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

export function AudioSpeedChanger() {
  const tool = getToolById("audio-speed")!;
  const [file, setFile] = useState<File | null>(null);
  const [speed, setSpeed] = useState([1.0]);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ffmpeg, loaded, loading, load, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_AUDIO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_AUDIO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const changeSpeed = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp3";
      const speedVal = speed[0];

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec([
        "-i", inputName,
        "-filter:a", `atempo=${speedVal}`,
        "-y", outputName
      ]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mp3" });
      setResult(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speed change failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_AUDIO_SIZE} type="audio" />
        
        {!file ? (
          <FileDropZone accept="audio/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an audio file here to change speed</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <audio controls src={URL.createObjectURL(file)} className="w-full" />

            <div className="space-y-4">
              <div>
                <Label>Speed: {speed[0].toFixed(2)}x</Label>
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>

              <Button onClick={changeSpeed} disabled={processing || loading} className="w-full">
                {processing ? "Processing..." : "Apply Speed"}
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Speed-Adjusted Audio">
                <audio controls src={result} className="w-full mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="speed-adjusted-audio.mp3">
                    <Download className="w-4 h-4 mr-2" />
                    Download MP3
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

export function AudioConverter() {
  const tool = getToolById("audio-converter")!;
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState("mp3");
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ffmpeg, loaded, loading, load, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_AUDIO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_AUDIO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const convert = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = `output.${format}`;

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec(["-i", inputName, "-y", outputName]);
      
      const data = await ff.readFile(outputName);
      const mimeTypes: Record<string, string> = {
        mp3: "audio/mpeg",
        wav: "audio/wav",
        aac: "audio/aac",
        ogg: "audio/ogg"
      };
      const blob = new Blob([data], { type: mimeTypes[format] || "audio/mpeg" });
      setResult(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_AUDIO_SIZE} type="audio" />
        
        {!file ? (
          <FileDropZone accept="audio/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an audio file here to convert</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <audio controls src={URL.createObjectURL(file)} className="w-full" />

            <div className="space-y-4">
              <div>
                <Label>Output Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3">MP3</SelectItem>
                    <SelectItem value="wav">WAV</SelectItem>
                    <SelectItem value="aac">AAC</SelectItem>
                    <SelectItem value="ogg">OGG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={convert} disabled={processing || loading} className="w-full">
                {processing ? "Converting..." : "Convert Audio"}
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Converted Audio">
                <audio controls src={result} className="w-full mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download={`converted-audio.${format}`}>
                    <Download className="w-4 h-4 mr-2" />
                    Download {format.toUpperCase()}
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

export function VideoCompressor() {
  const tool = getToolById("video-compressor")!;
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState("medium");
  const [result, setResult] = useState<{ url: string; originalSize: number; compressedSize: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ffmpeg, loaded, loading, load, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_VIDEO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_VIDEO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const compress = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp4";
      
      const crf = quality === "high" ? 18 : quality === "medium" ? 23 : 28;

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec([
        "-i", inputName,
        "-c:v", "libx264",
        "-crf", crf.toString(),
        "-preset", "fast",
        "-y", outputName
      ]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "video/mp4" });
      
      setResult({
        url: URL.createObjectURL(blob),
        originalSize: file.size,
        compressedSize: blob.size
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compression failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_VIDEO_SIZE} type="video" />
        
        {!file ? (
          <FileDropZone accept="video/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a video file here to compress</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <video controls src={URL.createObjectURL(file)} className="w-full max-h-64 rounded-lg" />

            <div className="space-y-4">
              <div>
                <Label>Quality</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (larger file)</SelectItem>
                    <SelectItem value="medium">Medium (balanced)</SelectItem>
                    <SelectItem value="low">Low (smallest file)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={compress} disabled={processing || loading} className="w-full">
                {processing ? "Compressing..." : "Compress Video"}
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Compressed Video">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Original</p>
                    <p className="font-bold text-primary">{formatSize(result.originalSize)}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Compressed</p>
                    <p className="font-bold text-primary">{formatSize(result.compressedSize)}</p>
                  </div>
                </div>
                <video controls src={result.url} className="w-full max-h-64 rounded-lg mb-4" />
                <Button asChild className="w-full">
                  <a href={result.url} download="compressed-video.mp4">
                    <Download className="w-4 h-4 mr-2" />
                    Download MP4
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

export function VideoTrimmer() {
  const tool = getToolById("video-trim")!;
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ffmpeg, loaded, loading, load, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_VIDEO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_VIDEO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const trim = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp4";

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec([
        "-i", inputName,
        "-ss", startTime.toString(),
        "-to", endTime.toString(),
        "-c:v", "libx264",
        "-preset", "fast",
        "-y", outputName
      ]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "video/mp4" });
      setResult(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trim failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_VIDEO_SIZE} type="video" />
        
        {!file ? (
          <FileDropZone accept="video/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a video file here to trim</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <video
              ref={videoRef}
              controls
              src={URL.createObjectURL(file)}
              className="w-full max-h-64 rounded-lg"
              onLoadedMetadata={(e) => {
                const dur = (e.target as HTMLVideoElement).duration;
                setDuration(dur);
                setEndTime(dur);
              }}
            />

            <div className="space-y-4">
              <div>
                <Label>Start: {formatTime(startTime)}</Label>
                <Slider
                  value={[startTime]}
                  onValueChange={([v]) => setStartTime(Math.min(v, endTime))}
                  min={0}
                  max={duration}
                  step={0.1}
                />
              </div>

              <div>
                <Label>End: {formatTime(endTime)}</Label>
                <Slider
                  value={[endTime]}
                  onValueChange={([v]) => setEndTime(Math.max(v, startTime))}
                  min={0}
                  max={duration}
                  step={0.1}
                />
              </div>

              <Button onClick={trim} disabled={processing || loading} className="w-full">
                {processing ? "Trimming..." : "Trim Video"}
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Trimmed Video">
                <video controls src={result} className="w-full max-h-64 rounded-lg mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="trimmed-video.mp4">
                    <Download className="w-4 h-4 mr-2" />
                    Download MP4
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

export function VideoToAudio() {
  const tool = getToolById("video-to-audio")!;
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ffmpeg, loaded, loading, load, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_VIDEO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_VIDEO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const extract = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp3";

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec([
        "-i", inputName,
        "-vn",
        "-acodec", "libmp3lame",
        "-b:a", "192k",
        "-y", outputName
      ]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mp3" });
      setResult(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_VIDEO_SIZE} type="video" />
        
        {!file ? (
          <FileDropZone accept="video/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a video file here to extract audio</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <video controls src={URL.createObjectURL(file)} className="w-full max-h-64 rounded-lg" />

            <div className="flex gap-4">
              <Button onClick={extract} disabled={processing || loading}>
                {processing ? "Extracting..." : "Extract Audio (MP3)"}
              </Button>
              <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>
                Upload New File
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Extracted Audio">
                <audio controls src={result} className="w-full mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="extracted-audio.mp3">
                    <Download className="w-4 h-4 mr-2" />
                    Download MP3 Audio
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

export function VideoFrameExtractor() {
  const tool = getToolById("video-frame-extractor")!;
  const [file, setFile] = useState<File | null>(null);
  const [timestamp, setTimestamp] = useState(0);
  const [duration, setDuration] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_VIDEO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_VIDEO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const extract = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      setProcessing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      video.currentTime = timestamp;
      
      setTimeout(() => {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          setResult(canvas.toDataURL("image/png"));
        }
        setProcessing(false);
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Frame extraction failed");
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_VIDEO_SIZE} type="video" />
        
        {!file ? (
          <FileDropZone accept="video/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a video file here to extract frames</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <video
              ref={videoRef}
              controls
              src={URL.createObjectURL(file)}
              className="w-full max-h-64 rounded-lg"
              onLoadedMetadata={(e) => {
                const dur = (e.target as HTMLVideoElement).duration;
                setDuration(dur);
              }}
            />

            <div className="space-y-4">
              <div>
                <Label>Timestamp: {formatTime(timestamp)}</Label>
                <Slider
                  value={[timestamp]}
                  onValueChange={([v]) => setTimestamp(v)}
                  min={0}
                  max={duration}
                  step={0.1}
                />
              </div>

              <Button onClick={extract} disabled={processing} className="w-full">
                {processing ? "Extracting..." : "Extract Frame"}
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Extracted Frame">
                <img src={result} alt="Extracted frame" className="w-full rounded-lg mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="frame.png">
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </a>
                </Button>
              </ResultDisplay>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function VideoResolutionChanger() {
  const tool = getToolById("video-resolution-changer")!;
  const [file, setFile] = useState<File | null>(null);
  const [resolution, setResolution] = useState("720p");
  const [result, setResult] = useState<{ url: string; originalSize: number; compressedSize: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ffmpeg, loaded, loading, load, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_VIDEO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_VIDEO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const change = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp4";
      
      const resolutions: Record<string, string> = {
        "480p": "854:480",
        "720p": "1280:720",
        "1080p": "1920:1080"
      };

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec([
        "-i", inputName,
        "-vf", `scale=${resolutions[resolution]}`,
        "-c:v", "libx264",
        "-crf", "23",
        "-preset", "fast",
        "-y", outputName
      ]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "video/mp4" });
      
      setResult({
        url: URL.createObjectURL(blob),
        originalSize: file.size,
        compressedSize: blob.size
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resolution change failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_VIDEO_SIZE} type="video" />
        
        {!file ? (
          <FileDropZone accept="video/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a video file here to change resolution</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <video controls src={URL.createObjectURL(file)} className="w-full max-h-64 rounded-lg" />

            <div className="space-y-4">
              <div>
                <Label>Resolution</Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="480p">480p (854x480)</SelectItem>
                    <SelectItem value="720p">720p (1280x720)</SelectItem>
                    <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={change} disabled={processing || loading} className="w-full">
                {processing ? "Changing..." : "Change Resolution"}
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Resolution Changed">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Original</p>
                    <p className="font-bold text-primary">{formatSize(result.originalSize)}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">New Size</p>
                    <p className="font-bold text-primary">{formatSize(result.compressedSize)}</p>
                  </div>
                </div>
                <video controls src={result.url} className="w-full max-h-64 rounded-lg mb-4" />
                <Button asChild className="w-full">
                  <a href={result.url} download="resized-video.mp4">
                    <Download className="w-4 h-4 mr-2" />
                    Download MP4
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

export function VideoMetadataViewer() {
  const tool = getToolById("video-metadata-viewer")!;
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_VIDEO_SIZE) {
      return;
    }
    setFile(f);
    setMetadata(null);
  };

  const getMetadata = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const meta = {
      filename: file?.name || "Unknown",
      size: formatSize(file?.size || 0),
      duration: formatTime(video.duration),
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      currentTime: formatTime(video.currentTime)
    };
    
    setMetadata(meta);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <FileDropZone accept="video/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a video file here to view metadata</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <video
              ref={videoRef}
              controls
              src={URL.createObjectURL(file)}
              className="w-full max-h-64 rounded-lg"
              onLoadedMetadata={getMetadata}
            />

            {metadata && (
              <ResultDisplay title="Video Metadata">
                <div className="space-y-3">
                  {Object.entries(metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-background rounded">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="font-mono text-sm">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </ResultDisplay>
            )}

            <Button onClick={() => { setFile(null); setMetadata(null); }} variant="outline" className="w-full">
              Upload Another File
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function VideoThumbnailGenerator() {
  const tool = getToolById("video-thumbnail-generator")!;
  const [file, setFile] = useState<File | null>(null);
  const [timestamp, setTimestamp] = useState(0);
  const [duration, setDuration] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_VIDEO_SIZE) {
      return;
    }
    setFile(f);
    setResult(null);
  };

  const generate = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    video.currentTime = timestamp;
    
    setTimeout(() => {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        setResult(canvas.toDataURL("image/png"));
      }
    }, 100);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_VIDEO_SIZE} type="video" />
        
        {!file ? (
          <FileDropZone accept="video/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a video file here to generate thumbnails</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <video
              ref={videoRef}
              controls
              src={URL.createObjectURL(file)}
              className="w-full max-h-64 rounded-lg"
              onLoadedMetadata={(e) => {
                const dur = (e.target as HTMLVideoElement).duration;
                setDuration(dur);
              }}
            />

            <div className="space-y-4">
              <div>
                <Label>Timestamp: {formatTime(timestamp)}</Label>
                <Slider
                  value={[timestamp]}
                  onValueChange={([v]) => setTimestamp(v)}
                  min={0}
                  max={duration}
                  step={0.1}
                />
              </div>

              <Button onClick={generate} className="w-full">
                Generate Thumbnail
              </Button>
            </div>

            {result && (
              <ResultDisplay title="Generated Thumbnail">
                <img src={result} alt="Thumbnail" className="w-full rounded-lg mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="thumbnail.png">
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </a>
                </Button>
              </ResultDisplay>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function AudioSilenceRemover() {
  const tool = getToolById("audio-silence-remover")!;
  const [file, setFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(0.1);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ffmpeg, loaded, loading, load, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_AUDIO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_AUDIO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const remove = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp3";

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec([
        "-i", inputName,
        "-af", `silenceremove=start_periods=1:start_duration=1:start_threshold=${threshold}dB:detection=peak,aformat=dblp,areverse,silenceremove=start_periods=1:start_duration=1:start_threshold=${threshold}dB:detection=peak,aformat=dblp,areverse`,
        "-y", outputName
      ]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mp3" });
      setResult(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Silence removal failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_AUDIO_SIZE} type="audio" />
        
        {!file ? (
          <FileDropZone accept="audio/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an audio file here to remove silence</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <audio controls src={URL.createObjectURL(file)} className="w-full" />

            <div className="space-y-4">
              <div>
                <Label>Silence Threshold: {threshold.toFixed(2)}dB</Label>
                <Slider
                  value={[threshold]}
                  onValueChange={([v]) => setThreshold(v)}
                  min={-80}
                  max={0}
                  step={5}
                />
              </div>

              <Button onClick={remove} disabled={processing || loading} className="w-full">
                {processing ? "Removing..." : "Remove Silence"}
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Silence Removed">
                <audio controls src={result} className="w-full mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="silence-removed.mp3">
                    <Download className="w-4 h-4 mr-2" />
                    Download MP3
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

export function AudioFadeInOut() {
  const tool = getToolById("audio-fade")!;
  const [file, setFile] = useState<File | null>(null);
  const [fadeIn, setFadeIn] = useState(1);
  const [fadeOut, setFadeOut] = useState(1);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ffmpeg, loaded, loading, load, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_AUDIO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_AUDIO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const apply = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp3";

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec([
        "-i", inputName,
        "-af", `afade=t=in:st=0:d=${fadeIn},afade=t=out:st=-${fadeOut}:d=${fadeOut}`,
        "-y", outputName
      ]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mp3" });
      setResult(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fade effect failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_AUDIO_SIZE} type="audio" />
        
        {!file ? (
          <FileDropZone accept="audio/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an audio file here to add fade effects</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <audio controls src={URL.createObjectURL(file)} className="w-full" />

            <div className="space-y-4">
              <div>
                <Label>Fade In (seconds): {fadeIn.toFixed(1)}</Label>
                <Slider
                  value={[fadeIn]}
                  onValueChange={([v]) => setFadeIn(v)}
                  min={0.1}
                  max={5}
                  step={0.1}
                />
              </div>

              <div>
                <Label>Fade Out (seconds): {fadeOut.toFixed(1)}</Label>
                <Slider
                  value={[fadeOut]}
                  onValueChange={([v]) => setFadeOut(v)}
                  min={0.1}
                  max={5}
                  step={0.1}
                />
              </div>

              <Button onClick={apply} disabled={processing || loading} className="w-full">
                {processing ? "Applying..." : "Apply Fade"}
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Fade Applied">
                <audio controls src={result} className="w-full mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="fade-audio.mp3">
                    <Download className="w-4 h-4 mr-2" />
                    Download MP3
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

export function AudioMetadataEditor() {
  const tool = getToolById("audio-metadata-editor")!;
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ffmpeg, loaded, loading, load, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_AUDIO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_AUDIO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const edit = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp3";

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec([
        "-i", inputName,
        "-c", "copy",
        "-metadata", `title=${title}`,
        "-metadata", `artist=${artist}`,
        "-y", outputName
      ]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mp3" });
      setResult(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Metadata edit failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_AUDIO_SIZE} type="audio" />
        
        {!file ? (
          <FileDropZone accept="audio/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an audio file here to edit metadata</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <audio controls src={URL.createObjectURL(file)} className="w-full" />

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                />
              </div>

              <div>
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Enter artist name"
                />
              </div>

              <Button onClick={edit} disabled={processing || loading || !title || !artist} className="w-full">
                {processing ? "Editing..." : "Save Metadata"}
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Metadata Updated">
                <div className="space-y-2 mb-4">
                  <p><span className="text-muted-foreground">Title:</span> {title}</p>
                  <p><span className="text-muted-foreground">Artist:</span> {artist}</p>
                </div>
                <audio controls src={result} className="w-full mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="tagged-audio.mp3">
                    <Download className="w-4 h-4 mr-2" />
                    Download MP3
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

export function AudioChannelConverter() {
  const tool = getToolById("audio-channel-converter")!;
  const [file, setFile] = useState<File | null>(null);
  const [channels, setChannels] = useState("stereo");
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ffmpeg, loaded, loading, load, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_AUDIO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_AUDIO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const convert = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp3";
      const channelCount = channels === "mono" ? 1 : 2;

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec([
        "-i", inputName,
        "-ac", channelCount.toString(),
        "-y", outputName
      ]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mp3" });
      setResult(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Channel conversion failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_AUDIO_SIZE} type="audio" />
        
        {!file ? (
          <FileDropZone accept="audio/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an audio file here to convert channels</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <audio controls src={URL.createObjectURL(file)} className="w-full" />

            <div className="space-y-4">
              <div>
                <Label>Output Channels</Label>
                <Select value={channels} onValueChange={setChannels}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mono">Mono (1 channel)</SelectItem>
                    <SelectItem value="stereo">Stereo (2 channels)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={convert} disabled={processing || loading} className="w-full">
                {processing ? "Converting..." : "Convert Channels"}
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Channels Converted">
                <audio controls src={result} className="w-full mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download={`${channels}-audio.mp3`}>
                    <Download className="w-4 h-4 mr-2" />
                    Download MP3
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
