import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, CheckCircle2 } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  label: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, label }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isCapturing && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error("Error playing video:", err));
    }
  }, [isCapturing, stream]);

  const startCamera = async () => {
    setIsSaved(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: label.toLowerCase().includes('ktp') ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setStream(mediaStream);
      setIsCapturing(true);
      setCapturedImage(null);
    } catch (err) {
      console.error(err);
      alert("Gagal mengakses kamera. Pastikan Anda telah memberikan izin kamera di browser.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        
        context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setIsSaved(true);
    }
  };

  const resetPhoto = () => {
    setCapturedImage(null);
    setIsSaved(false);
    startCamera();
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <p className="text-[11px] font-[900] text-slate-900 uppercase tracking-[0.2em]">{label}</p>
        {isSaved && (
          <span className="flex items-center gap-1 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
            <CheckCircle2 size={12} /> Tersimpan
          </span>
        )}
      </div>
      
      {!isCapturing && !capturedImage && (
        <button 
          type="button"
          onClick={startCamera}
          className="w-full h-44 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-brand-navy hover:border-brand-navy hover:bg-brand-navy/5 transition-all group shadow-sm bg-white"
        >
          <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-white transition-all ring-1 ring-slate-100">
            <Camera size={32} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Klik untuk Ambil {label}</span>
        </button>
      )}

      {isCapturing && (
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-video shadow-2xl ring-4 ring-slate-200">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover"
            style={{ transform: label.toLowerCase().includes('ktp') ? 'none' : 'scaleX(-1)' }}
          />
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
            <button 
              type="button"
              onClick={takePhoto}
              className="bg-white text-slate-900 p-5 rounded-full shadow-2xl active:scale-90 transition-transform border-4 border-slate-900/10 hover:bg-slate-50"
            >
              <Camera size={24} />
            </button>
            <button 
              type="button"
              onClick={stopCamera}
              className="bg-red-500 text-white p-5 rounded-full shadow-2xl active:scale-90 transition-transform hover:bg-red-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className={`relative rounded-3xl overflow-hidden aspect-video shadow-xl border-4 transition-all group ${isSaved ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-slate-100'}`}>
          <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
          
          <div className={`absolute inset-0 bg-slate-900/70 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm ${isSaved ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
            {!isSaved ? (
              <>
                <button 
                  type="button"
                  onClick={confirmPhoto}
                  className="bg-emerald-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-400 transition-all shadow-xl active:scale-95"
                >
                  <Check size={18} /> Simpan Foto
                </button>
                <button 
                  type="button"
                  onClick={resetPhoto}
                  className="bg-white text-slate-900 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all shadow-xl active:scale-95"
                >
                  <RefreshCw size={18} /> Ambil Ulang
                </button>
              </>
            ) : (
              <button 
                type="button"
                onClick={resetPhoto}
                className="bg-white text-brand-navy px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all shadow-2xl active:scale-95 border-b-4 border-slate-200"
              >
                <RefreshCw size={20} /> Ambil Ulang Foto
              </button>
            )}
          </div>
          
          {isSaved && (
            <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
              <Check size={20} />
            </div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
