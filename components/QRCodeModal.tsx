import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Building2, Smartphone, ShieldCheck, Download } from 'lucide-react';

interface QRCodeModalProps {
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const registrationUrl = window.location.origin + window.location.pathname;

  useEffect(() => {
    QRCode.toDataURL(registrationUrl, {
      width: 800,
      margin: 2,
      color: {
        dark: '#00339a',
        light: '#ffffff'
      }
    }, (err, url) => {
      if (!err) setQrUrl(url);
    });
  }, [registrationUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    // ini ntar diganti
    link.download = 'QR_CODE_TAMU_KKT.png';  
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[300] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in duration-300">
        
        {/* HEADER MODAL */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Smartphone className="text-brand-navy" size={20} />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">QR Code Registrasi</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-brand-red transition-colors"><X size={24} /></button>
        </div>

        {/* PRINTABLE AREA (This is what guests see and you print) */}
        <div id="qr-poster-print" className="p-10 text-center flex flex-col items-center">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
               <Building2 size={32} className="text-brand-navy" />
               <h2 className="text-2xl font-black text-brand-navy tracking-tighter uppercase italic">KALTIM KARIANGAU TERMINAL</h2>
            </div>
            <div className="h-1 w-24 bg-brand-red mx-auto rounded-full"></div>
          </div>

          <div className="relative mb-10 group">
             <div className="absolute -inset-4 bg-brand-navy/5 rounded-[3rem] blur-xl opacity-0 transition-opacity"></div>
             <div className="relative bg-white p-6 rounded-[2.5rem] border-4 border-brand-navy shadow-2xl">
                {qrUrl ? (
                  <img src={qrUrl} alt="Registration QR Code" className="w-64 h-64 md:w-80 md:h-80 mx-auto" />
                ) : (
                  <div className="w-64 h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
                )}
             </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">SCAN UNTUK DAFTAR</h3>
             <p className="text-slate-500 font-bold max-w-xs mx-auto leading-relaxed">
                Silakan gunakan kamera handphone Anda untuk melakukan registrasi tamu secara digital.
             </p>
          </div>

          <div className="mt-12 flex items-center gap-3 text-[10px] font-black text-brand-navy uppercase tracking-[0.3em]">
             <ShieldCheck size={16} /> SAFE & SECURE GUEST SYSTEM
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-8 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-4 print:hidden">
          <button 
            onClick={handleDownload}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-brand-navy hover:text-brand-navy transition-all"
          >
            <Download size={18} /> Simpan Gambar
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-brand-navy text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-brand-red transition-all shadow-xl shadow-brand-navy/20"
          >
            <Printer size={18} /> Cetak Poster
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;