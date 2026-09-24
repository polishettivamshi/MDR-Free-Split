import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, 
  FlipHorizontal, 
  Zap, 
  ZapOff, 
  X, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Upload, 
  FileImage,
  Store,
  QrCode
} from 'lucide-react';
import { parseUPIUri, formatINR } from '../lib/upi';
import { ParsedUPI } from '../types';

interface CameraQRScannerProps {
  onScan: (scannedText: string, parsed: ParsedUPI) => void;
  onClose?: () => void;
  className?: string;
  allowManualSample?: boolean;
}

export const CameraQRScanner: React.FC<CameraQRScannerProps> = ({
  onScan,
  onClose,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<{ raw: string; parsed: ParsedUPI } | null>(null);
  const [scanFeedbackAnimation, setScanFeedbackAnimation] = useState<boolean>(false);

  // Play pleasant sound chime on successful QR scan
  const playScanChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      }
    } catch {
      // Audio playback non-critical
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 50, 40]);
      } catch {
        // Vibration non-critical
      }
    }
  };

  // Safe stream stop
  const stopStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Process and notify of successful scan
  const handleSuccess = useCallback((raw: string) => {
    const parsed = parseUPIUri(raw);
    playScanChime();
    setScanFeedbackAnimation(true);
    setScannedResult({ raw, parsed });
    stopStream();

    setTimeout(() => {
      onScan(raw, parsed);
    }, 600);
  }, [onScan, stopStream]);

  // Scan frame implementation: Hardware BarcodeDetector if available, falling back to jsQR
  const scanLoop = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;

    // Check if video is playing with valid frames
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
      const now = performance.now();
      // Throttle scanning to ~12 FPS for smooth mobile UI and low CPU usage
      if (now - lastScanTimeRef.current > 80) {
        lastScanTimeRef.current = now;

        let detectedCode: string | null = null;

        // 1. Try native BarcodeDetector API (fast hardware accelerated in Chrome/Android)
        if ('BarcodeDetector' in window) {
          try {
            const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              detectedCode = barcodes[0].rawValue;
            }
          } catch {
            // fallback to jsQR below
          }
        }

        // 2. Fallback to jsQR with canvas
        if (!detectedCode && canvasRef.current) {
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            try {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              // attemptBoth enables scanning both standard and inverted QR codes
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'attemptBoth'
              });
              if (code && code.data) {
                detectedCode = code.data;
              }
            } catch {
              // Canvas read error
            }
          }
        }

        if (detectedCode) {
          handleSuccess(detectedCode);
          return;
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanLoop);
  }, [handleSuccess]);

  // Start camera stream
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    stopStream();
    setIsInitializing(true);
    setCameraError(null);

    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setCameraError('Camera access is not supported by your current browser. Please upload a QR code image or enter merchant details manually.');
      setIsInitializing(false);
      return;
    }

    try {
      // First try with facingMode
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check torch capability on active video track
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities: any = typeof videoTrack.getCapabilities === 'function' ? videoTrack.getCapabilities() : {};
        setHasTorch(Boolean(capabilities?.torch));
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;

        await videoRef.current.play();
        setCameraActive(true);
        setIsInitializing(false);

        // Start scanning loop
        animFrameRef.current = requestAnimationFrame(scanLoop);
      }
    } catch (err: any) {
      console.warn('Camera access getUserMedia error:', err);
      setIsInitializing(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings to scan merchant QR codes.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No video camera was found on your device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is already in use by another application or tab.');
      } else {
        setCameraError(`Camera error: ${err.message || 'Unable to start camera stream'}.`);
      }
    }
  }, [scanLoop, stopStream]);

  // Flip between front and rear cameras
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Toggle torch / flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextTorch = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }]
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.warn('Torch constraint error:', e);
    }
  };

  // Start on mount and cleanup on unmount
  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopStream();
    };
  }, []);

  // Handle uploaded image fallback directly inside scanner
  const handleUploadedFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });
          if (code && code.data) {
            handleSuccess(code.data);
          } else {
            setCameraError('Could not decode a readable UPI QR code from the selected image. Please try another image.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-slate-950 text-white border border-slate-800 shadow-xl ${className}`}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-xs border-b border-slate-800/80 z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              UPI Merchant Scanner
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-400">Point at counter QR or UPI soundbox QR</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {hasTorch && cameraActive && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                torchOn ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={torchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
            >
              {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
            </button>
          )}

          {cameraActive && (
            <button
              type="button"
              onClick={toggleFacingMode}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Flip Camera (Front/Rear)"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
              title="Close Scanner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Viewfinder Frame */}
      <div className="relative aspect-square sm:aspect-[4/3] max-h-[380px] w-full bg-black flex items-center justify-center overflow-hidden">
        {/* HTML5 Video Stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            cameraActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Hidden Canvas for Frame Processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Initializing Spinner */}
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-10 p-4">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-200">Starting Camera Access...</p>
            <p className="text-xs text-slate-500 mt-1">Please approve camera permission in your browser prompt</p>
          </div>
        )}

        {/* Camera Error / Permission Fallback */}
        {cameraError && !isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-10 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Camera Notice</h4>
            <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">{cameraError}</p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Camera
              </button>

              <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-700">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                Upload QR Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadedFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Viewfinder Target Overlay (Active when camera is running) */}
        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
            {/* Viewfinder Box */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl border-2 border-indigo-400/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />

              {/* Animated laser scanning bar */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-[scanLaser_2.2s_ease-in-out_infinite]" />

              {/* Center crosshair dot */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>
            </div>

            {/* Instruction Badge */}
            <div className="mt-4 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-[11px] font-semibold text-slate-300 border border-slate-700/80 flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              Align merchant QR code within brackets
            </div>
          </div>
        )}

        {/* Successful Scan Feedback Overlay */}
        {scanFeedbackAnimation && scannedResult && (
          <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-30 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Merchant Recognized!
            </span>
            <h4 className="text-lg font-black text-white text-center mt-1">
              {scannedResult.parsed.pn || 'Verified Merchant'}
            </h4>
            <p className="text-xs font-mono text-emerald-200/90 mt-0.5">
              {scannedResult.parsed.pa}
            </p>
            {scannedResult.parsed.am && scannedResult.parsed.am > 0 && (
              <span className="mt-2 text-base font-extrabold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
                {formatINR(scannedResult.parsed.am)}
              </span>
            )}
            <p className="text-[11px] text-emerald-300/80 mt-2">
              Pre-filling installment breakdown...
            </p>
          </div>
        )}
      </div>

      {/* Bottom Bar: Quick Upload QR Image */}
      <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-400 flex items-center gap-1.5">
          <QrCode className="w-3.5 h-3.5 text-indigo-400" />
          <span>Point camera at any merchant counter QR</span>
        </span>
        <label className="text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1.5 cursor-pointer bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors shrink-0">
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span>Upload QR Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadedFile}
            className="hidden"
          />
        </label>
      </div>

      {/* Laser Scanning Animation Style */}
      <style>{`
        @keyframes scanLaser {
          0% {
            top: 5%;
            opacity: 0.2;
          }
          50% {
            top: 92%;
            opacity: 1;
          }
          100% {
            top: 5%;
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};
