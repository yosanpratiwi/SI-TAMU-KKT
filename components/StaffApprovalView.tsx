
import React, { useState } from 'react';
import { GuestEntry, GuestStatus, VisitType } from '../types';
// Added Info to imports
import { Check, Ban, MessageSquare, Clock, User, Building, MapPin, Target, Users, HardHat, FileText, X, Info } from 'lucide-react';

interface StaffApprovalViewProps {
  guest: GuestEntry | undefined;
  onAction: (guestId: string, status: GuestStatus, catatan: string) => void;
}

const StaffApprovalView: React.FC<StaffApprovalViewProps> = ({ guest, onAction }) => {
  const [note, setNote] = useState('');
  
  if (!guest) {
    return (
      <div className="bg-white p-20 rounded-[3rem] shadow-2xl text-center max-w-2xl mx-auto border-t-8 border-brand-red">
         <X size={64} className="text-brand-red mx-auto mb-8" />
         <h2 className="text-3xl font-black text-brand-navy">Data Tidak Ditemukan</h2>
         <p className="text-slate-500 mt-4 font-bold italic">Link mungkin sudah kedaluwarsa atau tamu tidak terdaftar.</p>
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
               {guest.fotoTamu ? <img src={guest.fotoTamu} className="w-full h-full object-cover" /> : <User size={64} className="m-auto mt-10 text-slate-300" />}
            </div>
            <div className="flex-grow space-y-4 pt-2">
               <div>
                  <h3 className="text-3xl font-black text-brand-navy tracking-tight">{guest.namaLengkap}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                     <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${guest.visitType === VisitType.VENDOR ? 'bg-red-50 text-brand-red border border-red-100' : 'bg-blue-50 text-brand-navy border border-blue-100'}`}>
                        {guest.visitType === VisitType.VENDOR ? <HardHat size={12} /> : <User size={12} />} {guest.visitType}
                     </span>
                     {guest.isGroup && (
                        <span className="bg-emerald-50 text-brand-green border border-emerald-100 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Users size={12} /> ROMBONGAN (+{guest.groupMembers.length})
                        </span>
                     )}
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-600 flex items-center justify-center md:justify-start gap-3"><Building size={18} className="text-slate-400" /> {guest.asalInstansi || 'Perorangan'}</p>
                  <p className="text-sm font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3"><Info size={18} className="text-indigo-500" /> {guest.keperluan}</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
               <Clock size={24} className="text-amber-500" />
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jam Kedatangan</p>
                  <p className="text-base font-black text-slate-900">{guest.jamMasuk} WIB</p>
               </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
               <Target size={24} className="text-brand-navy" />
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tujuan Bertemu</p>
                  <p className="text-base font-black text-slate-900">{guest.penanggungJawab}</p>
               </div>
            </div>
         </div>

         {guest.isGroup && (
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
               <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><Users size={16} /> Daftar Anggota Rombongan</h4>
               <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {guest.groupMembers.map((m, i) => (
                    <div key={i} className="text-xs font-bold text-slate-700">{i+1}. {m}</div>
                  ))}
               </div>
            </div>
         )}

         <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2"><MessageSquare size={16} /> Pesan / Instruksi Untuk Sekuriti</label>
            <textarea 
               className="w-full p-6 rounded-3xl border-2 border-slate-100 bg-slate-50 focus:border-brand-navy focus:bg-white transition-all outline-none font-bold text-sm" 
               rows={3}
               placeholder="Contoh: Silakan tunggu di Lobby / Langsung arahkan ke Ruang Rapat ICT"
               value={note}
               onChange={(e) => setNote(e.target.value)}
            />
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
            <button 
               onClick={() => onAction(guest.id, GuestStatus.DIIZINKAN, note)}
               className="bg-brand-green text-white py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl shadow-emerald-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
            >
               <Check size={24} /> SETUJUI TAMU
            </button>
            <button 
               onClick={() => onAction(guest.id, GuestStatus.DITOLAK, note)}
               className="bg-white border-4 border-slate-100 text-slate-300 hover:text-brand-red hover:border-brand-red/10 py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-xl shadow-slate-200/50"
            >
               <Ban size={24} /> TOLAK KUNJUNGAN
            </button>
         </div>
      </div>
    </div>
  );
};

export default StaffApprovalView;
