import React, { useState } from 'react';
import { GuestEntry, GuestStatus, Notification, VisitType } from '../types';
import { Check, Ban, MessageSquare, Clock, User, Building, MapPin, Search, LayoutDashboard, Target, Camera, CreditCard, Eye, X, FileText, AlertCircle } from 'lucide-react';

interface StaffDashboardProps {
  guests: GuestEntry[];
  notifications: Notification[];
  onAction: (guestId: string, status: GuestStatus, catatan: string, notifId: string) => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ guests, notifications, onAction }) => {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedDoc, setSelectedDoc] = useState<{url: string, isPdf: boolean} | null>(null);
  
  const pendingRequests = guests.filter(g => g.status === GuestStatus.PENDING);

  const getNotifId = (guestId: string) => {
    return notifications.find(n => n.guestId === guestId)?.id || '';
  };

  const handleActionClick = (guestId: string, status: GuestStatus, notifId: string) => {
    const note = notes[guestId]?.trim() || '';
    if (status === GuestStatus.DITOLAK && !note) {
      alert("Catatan/Alasan wajib diisi jika menolak tamu!");
      return;
    }
    onAction(guestId, status, note, notifId);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/90 z-[300] flex items-center justify-center p-10 backdrop-blur-md" onClick={() => setSelectedDoc(null)}>
          <div className="relative w-full max-w-5xl h-[85vh] bg-white p-2 rounded-3xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedDoc(null)} className="absolute -top-12 right-0 text-white"><X size={32} /></button>
            {selectedDoc.isPdf ? (
              <iframe src={selectedDoc.url} className="w-full h-full rounded-2xl border-none" />
            ) : (
              <img src={selectedDoc.url} className="w-full h-full object-contain rounded-2xl" />
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl ring-4 ring-indigo-500/10">
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

      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-slate-50/50 backdrop-blur-sm px-12 py-10 border-b border-slate-100">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
             Antrean Persetujuan Pegawai
             <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-2xl text-xs font-black">{pendingRequests.length}</span>
          </h2>
        </div>

        <div className="p-12">
          {pendingRequests.length === 0 ? (
            <div className="py-28 text-center text-slate-300 font-black uppercase tracking-widest">Semua Terproses!</div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {pendingRequests.map((guest) => (
                <div key={guest.id} className="bg-white border border-slate-200 p-10 rounded-[3rem] hover:border-indigo-400 hover:shadow-2xl transition-all ring-8 ring-transparent hover:ring-indigo-50">
                   <div className="flex flex-col lg:flex-row justify-between gap-10">
                      <div className="flex-grow space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-6">
                            <div className="h-20 w-20 bg-slate-900 text-white rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                                {guest.fotoTamu ? <img src={guest.fotoTamu} className="w-full h-full object-cover" /> : guest.namaLengkap.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">{guest.namaLengkap}</h3>
                                <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mt-2">{guest.asalInstansi || 'Pribadi'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                             {guest.fotoKTP && (
                               <button onClick={() => setSelectedDoc({url: guest.fotoKTP!, isPdf: false})} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-all"><CreditCard size={20} /></button>
                             )}
                             {guest.k3Pdf && (
                               <button onClick={() => setSelectedDoc({url: guest.k3Pdf!, isPdf: guest.k3Pdf!.startsWith('data:application/pdf')})} className="p-3 bg-red-50 text-brand-red rounded-xl hover:bg-red-100 transition-all"><FileText size={20} /></button>
                             )}
                          </div>
                        </div>

                        <div className="bg-slate-900 px-6 py-5 rounded-3xl flex items-center gap-4 shadow-xl shadow-slate-900/10">
                           <MessageSquare size={20} className="text-slate-500" />
                           <input 
                              type="text" 
                              placeholder="Ketik alasan atau instruksi (Wajib jika menolak)..."
                              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-600 w-full font-bold"
                              value={notes[guest.id] || ''}
                              onChange={(e) => setNotes({...notes, [guest.id]: e.target.value})}
                           />
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 justify-center shrink-0 w-full lg:w-56">
                         <button onClick={() => handleActionClick(guest.id, GuestStatus.DIIZINKAN, getNotifId(guest.id))} className="bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.2em] transition-all">
                           IZINKAN
                         </button>
                         <button onClick={() => handleActionClick(guest.id, GuestStatus.DITOLAK, getNotifId(guest.id))} className="bg-white border-2 border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.2em] transition-all">
                           TOLAK
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