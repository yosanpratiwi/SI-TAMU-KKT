
import React, { useState } from 'react';
import { GuestEntry, GuestStatus, Notification, VisitType } from '../types';
import { Check, Ban, MessageSquare, Clock, User, Building, MapPin, Search, LayoutDashboard, Target, Camera, CreditCard, Eye, X } from 'lucide-react';

interface StaffDashboardProps {
  guests: GuestEntry[];
  notifications: Notification[];
  onAction: (guestId: string, status: GuestStatus, catatan: string, notifId: string) => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ guests, notifications, onAction }) => {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const pendingRequests = guests.filter(g => g.status === GuestStatus.PENDING);
  const processedRequests = guests.filter(g => g.status !== GuestStatus.PENDING);

  const getNotifId = (guestId: string) => {
    return notifications.find(n => n.guestId === guestId)?.id || '';
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {selectedImage && (
        <div className="fixed inset-0 bg-slate-900/90 z-[300] flex items-center justify-center p-10 backdrop-blur-md animate-in zoom-in duration-300">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-10 right-10 bg-white text-slate-900 p-4 rounded-full shadow-2xl hover:bg-red-500 hover:text-white transition-all"
          >
            <X size={32} />
          </button>
          <img src={selectedImage} className="max-w-full max-h-full rounded-3xl shadow-2xl object-contain border-4 border-white/10" alt="Preview" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-100 ring-4 ring-indigo-500/10">
          <LayoutDashboard className="mb-6 opacity-40" size={40} />
          <h3 className="text-5xl font-black tracking-tighter">{pendingRequests.length}</h3>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] mt-3 opacity-80">Permintaan Pending</p>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
          <Check className="mb-6 text-emerald-500" size={40} />
          <h3 className="text-5xl font-black tracking-tighter text-slate-900">{guests.filter(g => g.status === GuestStatus.DIIZINKAN).length}</h3>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] mt-3 text-slate-400">Tamu Diizinkan</p>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
          <Clock className="mb-6 text-amber-500" size={40} />
          <h3 className="text-5xl font-black tracking-tighter text-slate-900">{guests.filter(g => !g.jamKeluar && g.status === GuestStatus.DIIZINKAN).length}</h3>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] mt-3 text-slate-400">Masih Di Area Kantor</p>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="bg-slate-50/50 backdrop-blur-sm px-12 py-10 border-b border-slate-100">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
             Antrean Persetujuan
             <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-2xl text-xs font-black shadow-lg shadow-indigo-100">{pendingRequests.length}</span>
          </h2>
        </div>

        <div className="p-12">
          {pendingRequests.length === 0 ? (
            <div className="py-28 text-center">
               <div className="bg-slate-50 inline-block p-10 rounded-[2.5rem] mb-8 border border-slate-100">
                 <Check size={64} className="text-slate-200" />
               </div>
               <h4 className="text-2xl font-black text-slate-900">Semua Terproses!</h4>
               <p className="text-sm text-slate-400 font-bold mt-3">Tidak ada antrean tamu yang perlu tindakan sekarang.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {pendingRequests.map((guest) => (
                <div key={guest.id} className="group bg-white border border-slate-200 p-10 rounded-[3rem] hover:border-indigo-400 hover:shadow-2xl transition-all duration-300 ring-8 ring-transparent hover:ring-indigo-50">
                   <div className="flex flex-col lg:flex-row justify-between gap-10">
                      <div className="flex-grow space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-6">
                            <div className="h-20 w-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center font-black text-3xl shadow-2xl shadow-slate-200 border-4 border-white overflow-hidden">
                                {guest.fotoTamu ? (
                                  <img src={guest.fotoTamu} className="w-full h-full object-cover" alt="Avatar" />
                                ) : guest.namaLengkap.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{guest.namaLengkap}</h3>
                                <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-2 flex items-center gap-2.5">
                                  <Building size={16} /> {guest.asalInstansi || 'Kunjungan Pribadi'}
                                </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-4">
                            {guest.fotoTamu && (
                              <button 
                                onClick={() => setSelectedImage(guest.fotoTamu!)}
                                className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 transition-all group/btn"
                              >
                                <Camera size={20} className="text-slate-400 group-hover/btn:text-indigo-500" />
                                <span className="text-[8px] font-black uppercase text-slate-400 group-hover/btn:text-indigo-500">Lihat Foto</span>
                              </button>
                            )}
                            {guest.fotoKTP && (
                              <button 
                                onClick={() => setSelectedImage(guest.fotoKTP!)}
                                className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 transition-all group/btn"
                              >
                                <CreditCard size={20} className="text-slate-400 group-hover/btn:text-indigo-500" />
                                <span className="text-[8px] font-black uppercase text-slate-400 group-hover/btn:text-indigo-500">Lihat KTP</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Tujuan Kunjungan</p>
                              <p className="text-sm font-bold text-slate-800 flex items-center gap-3">
                                <Target size={18} className="text-indigo-500" /> {guest.tujuan || guest.deskripsiPekerjaan}
                              </p>
                           </div>
                           <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Waktu Kedatangan</p>
                              <p className="text-sm font-bold text-slate-800 flex items-center gap-3">
                                <Clock size={18} className="text-amber-500" /> {guest.jamMasuk} WIB
                              </p>
                           </div>
                        </div>

                        <div className="bg-slate-900 px-6 py-5 rounded-3xl flex items-center gap-4 shadow-xl shadow-slate-900/10">
                           <MessageSquare size={20} className="text-slate-500" />
                           <input 
                              type="text" 
                              placeholder="Ketik instruksi untuk Sekuriti (Contoh: Tunggu di Lobby, Bawa ke Lantai 2)..."
                              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-600 w-full font-bold"
                              value={notes[guest.id] || ''}
                              onChange={(e) => setNotes({...notes, [guest.id]: e.target.value})}
                           />
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 justify-center shrink-0 w-full lg:w-56">
                         <button 
                            onClick={() => onAction(guest.id, GuestStatus.DIIZINKAN, notes[guest.id] || '', getNotifId(guest.id))}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-4"
                         >
                           <Check size={22} /> IZINKAN
                         </button>
                         <button 
                            onClick={() => onAction(guest.id, GuestStatus.DITOLAK, notes[guest.id] || '', getNotifId(guest.id))}
                            className="bg-white border-2 border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-4"
                         >
                           <Ban size={22} /> TOLAK
                         </button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
