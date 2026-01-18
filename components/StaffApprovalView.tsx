import React, { useState, useEffect } from 'react';
import { GuestEntry, GuestStatus, VisitType } from '../types';
import { Check, Ban, MessageSquare, Clock, User, Building, MapPin, Target, Users, HardHat, X, Info, AlertTriangle } from 'lucide-react';

interface StaffApprovalViewProps {
  guest: GuestEntry | undefined;
  onAction: (guestId: string, status: GuestStatus, catatan: string) => void;
}

const StaffApprovalView: React.FC<StaffApprovalViewProps> = ({ guest, onAction }) => {
  const [note, setNote] = useState('');
  const [localGuest, setLocalGuest] = useState<GuestEntry | undefined>(guest);

  // Fallback: Jika guest tidak ditemukan di state (karena beda perangkat/browser), 
  // coba cari di localStorage atau tampilkan instruksi.
  useEffect(() => {
    if (!guest) {
      const saved = localStorage.getItem('kkt_guests_v4');
      if (saved) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('approval');
        const allGuests = JSON.parse(saved) as GuestEntry[];
        const found = allGuests.find(g => g.id === id);
        if (found) setLocalGuest(found);
      }
    } else {
      setLocalGuest(guest);
    }
  }, [guest]);
  
  if (!localGuest) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-2xl text-center border-t-[12px] border-brand-red">
           <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-red">
              <AlertTriangle size={48} />
           </div>
           <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">Data Tidak Ditemukan</h2>
           <div className="mt-8 space-y-4 text-slate-500 font-bold leading-relaxed text-sm">
              <p>Hal ini terjadi karena link dibuka di perangkat yang berbeda dengan perangkat pendaftaran (Laptop Sekuriti).</p>
              <div className="bg-slate-50 p-6 rounded-2xl text-left border border-slate-200">
                <p className="text-brand-navy mb-2">💡 Solusi untuk Percobaan:</p>
                <ul className="list-disc ml-5 space-y-1 text-xs">
                  <li>Buka link ini di browser yang sama dengan saat Anda mendaftarkan tamu tadi.</li>
                  <li>Atau, gunakan fitur <b>Dashboard Staf</b> untuk simulasi persetujuan.</li>
                </ul>
              </div>
           </div>
           <button 
             onClick={() => window.location.href = window.location.origin + window.location.pathname}
             className="mt-10 w-full py-5 bg-slate-100 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-200 transition-all"
           >
             KEMBALI KE BERANDA
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden max-w-3xl mx-auto border border-slate-200 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="bg-brand-navy p-12 text-white text-center">
         <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
            <Target size={40} className="text-white" />
         </div>
         <h2 className="text-3xl font-black tracking-tighter italic">Persetujuan Kedatangan Tamu</h2>
         <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em] mt-3">SI-TAMU KKT INTERNAL CONFIRMATION</p>
      </div>

      <div className="p-12 space-y-10">
         <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
            <div className="h-40 w-40 rounded-[2.5rem] bg-slate-100 border-4 border-slate-100 overflow-hidden shadow-2xl">
               {localGuest.fotoTamu ? <img src={localGuest.fotoTamu} className="w-full h-full object-cover" /> : <User size={64} className="m-auto mt-10 text-slate-300" />}
            </div>
            <div className="flex-grow space-y-4 pt-2">
               <div>
                  <h3 className="text-3xl font-black text-brand-navy tracking-tight">{localGuest.namaLengkap}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                     <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${localGuest.visitType === VisitType.VENDOR ? 'bg-red-50 text-brand-red border border-red-100' : 'bg-blue-50 text-brand-navy border border-blue-100'}`}>
                        {localGuest.visitType === VisitType.VENDOR ? <HardHat size={12} /> : <User size={12} />} {localGuest.visitType}
                     </span>
                     {localGuest.isGroup && (
                        <span className="bg-emerald-50 text-brand-green border border-emerald-100 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Users size={12} /> ROMBONGAN (+{localGuest.groupMembers.length})
                        </span>
                     )}
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-600 flex items-center justify-center md:justify-start gap-3"><Building size={18} className="text-slate-400" /> {localGuest.asalInstansi || 'Perorangan'}</p>
                  <p className="text-sm font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3"><Info size={18} className="text-indigo-500" /> {localGuest.keperluan}</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
               <Clock size={24} className="text-amber-500" />
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jam Kedatangan</p>
                  <p className="text-base font-black text-slate-900">{localGuest.jamMasuk} WITA</p>
               </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
               <Target size={24} className="text-brand-navy" />
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tujuan Bertemu</p>
                  <p className="text-base font-black text-slate-900">{localGuest.penanggungJawab}</p>
               </div>
            </div>
         </div>

         <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2"><MessageSquare size={16} /> Pesan / Instruksi Untuk Sekuriti</label>
            <textarea 
               className="w-full p-6 rounded-3xl border-2 border-slate-100 bg-slate-50 focus:border-brand-navy focus:bg-white transition-all outline-none font-bold text-sm" 
               rows={3}
               placeholder="Contoh: Silakan tunggu di Lobby / Langsung arahkan ke Ruang Rapat"
               value={note}
               onChange={(e) => setNote(e.target.value)}
            />
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
            <button 
               onClick={() => onAction(localGuest.id, GuestStatus.DIIZINKAN, note)}
               className="bg-brand-green text-white py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
            >
               <Check size={24} /> SETUJUI TAMU
            </button>
            <button 
               onClick={() => onAction(localGuest.id, GuestStatus.DITOLAK, note)}
               className="bg-white border-4 border-slate-100 text-slate-300 hover:text-brand-red hover:border-brand-red/10 py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-xl"
            >
               <Ban size={24} /> TOLAK KUNJUNGAN
            </button>
         </div>
      </div>
    </div>
  );
};

export default StaffApprovalView;