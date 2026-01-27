
import React, { useState, useMemo } from 'react';
import { GuestEntry, GuestStatus, UserRole } from '../types';
import { Search, X, User, Users, ArrowUpRight, ArrowDownRight, Calendar, Trash2, FileText, Download, CheckCircle, Clock } from 'lucide-react';

interface GuestListProps {
  guests: GuestEntry[];
  onCheckout: (id: string) => void;
  onDelete?: (id: string) => void;
  onResendNotification?: (id: string) => void;
  role?: UserRole;
}

const GuestList: React.FC<GuestListProps> = ({ guests, onCheckout, onDelete, role }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string, isPdf?: boolean} | null>(null);

  const filteredGuests = useMemo(() => {
    return guests.filter(g => {
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        g.namaLengkap.toLowerCase().includes(term) || 
        (g.asalInstansi || '').toLowerCase().includes(term) || 
        (g.nomorKtp || '').includes(term);
      const guestDate = g.tanggal; 
      const matchDate = (!startDate || guestDate >= startDate) && (!endDate || guestDate <= endDate);
      return matchSearch && matchDate;
    });
  }, [guests, searchTerm, startDate, endDate]);

  const stats = useMemo(() => {
    return {
      total: filteredGuests.length,
      inArea: filteredGuests.filter(g => !g.jamKeluar).length,
      out: filteredGuests.filter(g => g.jamKeluar).length
    };
  }, [filteredGuests]);

  return (
    <div className="flex flex-col bg-white min-h-[800px] w-full">
      
      {/* STATS - GRID FULL WIDTH */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10 p-6 md:p-12 print:hidden bg-slate-50/50">
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border-b-8 border-brand-navy flex items-center justify-between group">
            <div>
                <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-4">TOTAL TAMU</p>
                <h4 className="text-4xl md:text-7xl font-black text-brand-navy tracking-tighter">{stats.total}</h4>
            </div>
            <div className="bg-slate-50 p-4 md:p-8 rounded-[2rem] text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-all">
                <Users size={32} className="md:w-12 md:h-12" />
            </div>
        </div>
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border-b-8 border-brand-green flex items-center justify-between group">
            <div>
                <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-4">MASIH DI AREA</p>
                <h4 className="text-4xl md:text-7xl font-black text-brand-green tracking-tighter">{stats.inArea}</h4>
            </div>
            <div className="bg-emerald-50 p-4 md:p-8 rounded-[2rem] text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all">
                <ArrowUpRight size={32} className="md:w-12 md:h-12" />
            </div>
        </div>
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border-b-8 border-brand-red flex items-center justify-between group">
            <div>
                <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-4">SUDAH KELUAR</p>
                <h4 className="text-4xl md:text-7xl font-black text-brand-red tracking-tighter">{stats.out}</h4>
            </div>
            <div className="bg-red-50 p-4 md:p-8 rounded-[2rem] text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all">
                <ArrowDownRight size={32} className="md:w-12 md:h-12" />
            </div>
        </div>
      </div>

      {/* FILTERS FULL WIDTH */}
      <div className="px-6 md:px-12 py-8 bg-white flex flex-col xl:flex-row gap-6 items-center border-b border-slate-100">
        <div className="relative flex-grow w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-navy opacity-40" size={20} />
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama, instansi, atau NIK tamu..." 
              className="w-full pl-16 pr-8 py-5 md:py-6 bg-[#f8fafc] rounded-[2rem] outline-none font-bold text-sm md:text-base border-2 border-transparent focus:border-brand-navy focus:bg-white transition-all shadow-inner" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
        </div>
        <div className="flex flex-row gap-4 w-full xl:w-auto shrink-0">
            <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-[1.5rem] border border-slate-200 flex-1">
                <Calendar size={18} className="text-brand-navy" />
                <input type="date" className="bg-transparent outline-none font-black text-[11px] text-brand-navy uppercase w-full" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-[1.5rem] border border-slate-200 flex-1">
                <Calendar size={18} className="text-brand-navy" />
                <input type="date" className="bg-transparent outline-none font-black text-[11px] text-brand-navy uppercase w-full" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
        </div>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="md:hidden p-6 space-y-4">
        {filteredGuests.length === 0 ? (
          <div className="py-20 text-center font-black text-slate-300 uppercase tracking-widest">Data Kosong</div>
        ) : (
          filteredGuests.map(guest => (
            <div key={guest.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
               <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border-2 border-white shadow-sm" onClick={() => guest.fotoTamu && setSelectedImage({url: guest.fotoTamu, title: guest.namaLengkap})}>
                    {guest.fotoTamu ? <img src={guest.fotoTamu} className="w-full h-full object-cover" /> : <User size={24} className="m-auto mt-4 text-slate-300" />}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <h5 className="font-black text-brand-navy uppercase text-sm truncate">{guest.namaLengkap}</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{guest.asalInstansi}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${guest.status === GuestStatus.DIIZINKAN ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {guest.status}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2">MASUK</p>
                    <p className="text-xs font-black text-emerald-600 flex items-center gap-2"><Clock size={14} /> {guest.jamMasuk}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2">KELUAR</p>
                    <p className="text-xs font-black text-brand-red flex items-center gap-2">
                      {guest.jamKeluar ? <><CheckCircle size={14} /> {guest.jamKeluar}</> : '--:--'}
                    </p>
                  </div>
               </div>

               <div className="flex gap-3">
                  {!guest.jamKeluar && guest.status === GuestStatus.DIIZINKAN && (
                    <button onClick={() => onCheckout(guest.id)} className="flex-grow bg-brand-navy text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">CHECKOUT</button>
                  )}
                  {role === UserRole.SEKURITI && (
                    <button onClick={() => onDelete?.(guest.id)} className="p-4 bg-red-50 text-brand-red rounded-2xl border border-red-100"><Trash2 size={20} /></button>
                  )}
               </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE VIEW - FULL WIDTH */}
      <div className="hidden md:block w-full overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-navy text-white">
              <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.2em] w-48">WAKTU</th>
              <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.2em]">PROFIL TAMU</th>
              <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.2em]">TUJUAN & KEPERLUAN</th>
              <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.2em] text-center">DOKUMEN</th>
              <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.2em]">STATUS</th>
              <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.2em] text-center">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-32 text-center text-slate-300 font-black uppercase tracking-[0.4em]">
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              filteredGuests.map(guest => (
                <tr key={guest.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl w-fit">
                        <Clock size={14} strokeWidth={3} />
                        <span className="text-[11px] font-black">IN: {guest.jamMasuk}</span>
                      </div>
                      {guest.jamKeluar && (
                        <div className="flex items-center gap-2 text-brand-red bg-red-50 px-3 py-1.5 rounded-xl w-fit">
                          <Clock size={14} strokeWidth={3} />
                          <span className="text-[11px] font-black">OUT: {guest.jamKeluar}</span>
                        </div>
                      )}
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{guest.tanggal}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div 
                        className="w-16 h-16 bg-slate-100 rounded-[1.25rem] overflow-hidden border-2 border-white shadow-md cursor-pointer shrink-0"
                        onClick={() => guest.fotoTamu && setSelectedImage({url: guest.fotoTamu, title: guest.namaLengkap})}
                      >
                        {guest.fotoTamu ? <img src={guest.fotoTamu} className="w-full h-full object-cover" /> : <User size={24} className="m-auto mt-5 text-slate-300" />}
                      </div>
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <p className="font-black text-brand-navy text-[15px] uppercase truncate">{guest.namaLengkap}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                           <span className="bg-slate-100 px-2 py-0.5 rounded-md">{guest.asalInstansi || 'Personal'}</span>
                        </p>
                        <p className="text-[9px] font-black text-slate-400 mt-1">NIK: {guest.nomorKtp}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-2">
                      <p className="text-[13px] font-black text-slate-800 uppercase italic leading-tight">"{guest.keperluan}"</p>
                      <div className="flex items-center gap-2 text-brand-navy/60 font-bold text-[10px] uppercase">
                        <User size={12} /> PJ: {guest.penanggungJawab} ({guest.divisi})
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="flex justify-center gap-3">
                      {guest.suratUndangan && (
                        <button 
                          onClick={() => setSelectedImage({url: guest.suratUndangan!, title: 'Surat Undangan'})} 
                          className="p-3 bg-brand-navy/5 text-brand-navy rounded-xl hover:bg-brand-navy hover:text-white transition-all shadow-sm"
                        >
                          <FileText size={18} />
                        </button>
                      )}
                      {guest.k3Pdf && (
                        <button 
                          onClick={() => setSelectedImage({url: guest.k3Pdf!, title: 'Dokumen K3'})} 
                          className="p-3 bg-red-50 text-brand-red rounded-xl hover:bg-brand-red hover:text-white transition-all shadow-sm"
                        >
                          <FileText size={18} />
                        </button>
                      )}
                      {!guest.suratUndangan && !guest.k3Pdf && <span className="text-[10px] font-black text-slate-200 uppercase">-</span>}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${
                      guest.status === GuestStatus.DIIZINKAN 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : guest.status === GuestStatus.DITOLAK
                      ? 'bg-red-50 text-brand-red border-red-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                    }`}>
                      {guest.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-center">
                     <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!guest.jamKeluar && guest.status === GuestStatus.DIIZINKAN && (
                          <button 
                            onClick={() => onCheckout(guest.id)} 
                            className="bg-brand-navy text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark shadow-xl active:scale-95 transition-all"
                          >
                            CHECKOUT
                          </button>
                        )}
                        {role === UserRole.SEKURITI && (
                          <button 
                            onClick={() => onDelete?.(guest.id)} 
                            className="p-3 text-slate-300 hover:text-brand-red hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                     </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL IMAGE PREVIEW */}
      {selectedImage && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[600] flex items-center justify-center p-6 md:p-10" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full h-full bg-white rounded-[3rem] p-2 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 text-slate-400 hover:text-brand-red transition-all p-3 bg-slate-100 rounded-full z-10"><X size={24} /></button>
            <div className="w-full h-full bg-slate-50 flex items-center justify-center p-4">
               {selectedImage.url.startsWith('data:application/pdf') ? (
                 <iframe src={selectedImage.url} className="w-full h-full border-none rounded-2xl" />
               ) : (
                 <img src={selectedImage.url} className="max-w-full max-h-full object-contain rounded-2xl" alt={selectedImage.title} />
               )}
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
               <a href={selectedImage.url} download={selectedImage.title} className="bg-brand-navy text-white px-12 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl hover:scale-105 transition-all">
                  <Download size={24} /> SIMPAN FILE
               </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestList;