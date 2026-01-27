
import React, { useState, useMemo } from 'react';
import { GuestEntry, GuestStatus, UserRole } from '../types';
import { Search, X, User, Users, ArrowUpRight, ArrowDownRight, Calendar, Trash2, FileText, CheckCircle, Clock, Filter } from 'lucide-react';

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
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string} | null>(null);

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
    <div className="flex flex-col bg-white w-full">
      
      {/* STATS AREA - HORIZONTAL PILLS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 p-6 md:p-10 bg-slate-50/40 border-b border-slate-100">
        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2">TOTAL LOG TAMU</p>
                <h4 className="text-3xl md:text-5xl font-black text-brand-navy tracking-tighter">{stats.total}</h4>
            </div>
            <div className="bg-brand-navy/5 p-4 rounded-2xl text-brand-navy"><Users size={28} /></div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2">SEDANG DI AREA</p>
                <h4 className="text-3xl md:text-5xl font-black text-brand-green tracking-tighter">{stats.inArea}</h4>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl text-brand-green"><ArrowUpRight size={28} /></div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2">TELAH KELUAR</p>
                <h4 className="text-3xl md:text-5xl font-black text-brand-red tracking-tighter">{stats.out}</h4>
            </div>
            <div className="bg-red-50 p-4 rounded-2xl text-brand-red"><ArrowDownRight size={28} /></div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="px-6 md:px-10 py-6 border-b border-slate-100 flex flex-col xl:flex-row gap-4 items-center bg-white">
        <div className="relative flex-grow w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama, instansi, atau NIK tamu..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:border-brand-navy transition-all" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
        </div>
        <div className="flex gap-4 w-full xl:w-auto">
            <div className="flex items-center gap-3 bg-slate-50 px-5 rounded-2xl border border-slate-100">
               <Calendar size={16} className="text-slate-400" />
               <input type="date" className="bg-transparent py-4 font-black text-[10px] text-brand-navy outline-none uppercase" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-3 bg-slate-50 px-5 rounded-2xl border border-slate-100">
               <Calendar size={16} className="text-slate-400" />
               <input type="date" className="bg-transparent py-4 font-black text-[10px] text-brand-navy outline-none uppercase" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
        </div>
      </div>

      {/* FULL WIDTH TABLE (DESKTOP) */}
      <div className="w-full overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">WAKTU KUNJUNGAN</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">PROFIL TAMU</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">PENANGGUNG JAWAB</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-center">FILES</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">STATUS</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center text-slate-200 font-black uppercase tracking-[0.2em]">Belum Ada Data Tamu</td>
                </tr>
              ) : (
                filteredGuests.map(guest => (
                  <tr key={guest.id} className="hover:bg-slate-50/20 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-black text-emerald-600">IN: {guest.jamMasuk}</span>
                        {guest.jamKeluar ? <span className="text-[13px] font-black text-brand-red">OUT: {guest.jamKeluar}</span> : <span className="text-[10px] font-bold text-slate-300 italic">BELUM CHECKOUT</span>}
                        <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">{guest.tanggal}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm" onClick={() => guest.fotoTamu && setSelectedImage({url: guest.fotoTamu, title: guest.namaLengkap})}>
                          {guest.fotoTamu ? <img src={guest.fotoTamu} className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform" /> : <User size={22} className="m-auto mt-4 text-slate-200" />}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-black text-brand-navy text-[15px] uppercase truncate leading-none mb-1">{guest.namaLengkap}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase truncate italic">{guest.asalInstansi || 'Perorangan'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-[13px] font-black text-slate-700 uppercase leading-tight">{guest.penanggungJawab}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase italic tracking-wider">"{guest.keperluan}"</p>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="flex justify-center gap-3">
                        {guest.suratUndangan && <button onClick={() => setSelectedImage({url: guest.suratUndangan!, title: 'Surat Undangan'})} className="p-2.5 bg-slate-50 text-brand-navy rounded-xl hover:bg-brand-navy hover:text-white transition-all"><FileText size={18} /></button>}
                        {guest.k3Pdf && <button onClick={() => setSelectedImage({url: guest.k3Pdf!, title: 'Dokumen K3'})} className="p-2.5 bg-slate-50 text-brand-red rounded-xl hover:bg-brand-red hover:text-white transition-all"><FileText size={18} /></button>}
                        {!guest.suratUndangan && !guest.k3Pdf && <span className="text-[10px] font-black text-slate-200">-</span>}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        guest.status === GuestStatus.DIIZINKAN ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {guest.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-center">
                       {!guest.jamKeluar && guest.status === GuestStatus.DIIZINKAN ? (
                          <button onClick={() => onCheckout(guest.id)} className="bg-[#00339a] text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">CHECKOUT</button>
                       ) : (
                          role === UserRole.SEKURITI && <button onClick={() => onDelete?.(guest.id)} className="p-3 text-slate-200 hover:text-brand-red transition-all"><Trash2 size={20} /></button>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE VIEW (CARDS) */}
        <div className="md:hidden p-4 space-y-4">
          {filteredGuests.map(guest => (
            <div key={guest.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm space-y-5">
               <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                       {guest.fotoTamu ? <img src={guest.fotoTamu} className="w-full h-full object-cover" /> : <User size={18} className="m-auto mt-4 text-slate-200" />}
                    </div>
                    <div>
                      <h5 className="font-black text-brand-navy text-[13px] uppercase truncate w-32">{guest.namaLengkap}</h5>
                      <p className="text-[10px] font-bold text-slate-400 uppercase italic truncate w-32">{guest.asalInstansi}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${guest.status === GuestStatus.DIIZINKAN ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {guest.status}
                  </span>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/50 p-4 rounded-2xl">
                     <p className="text-[8px] font-black text-slate-400 uppercase mb-1">MASUK</p>
                     <p className="text-sm font-black text-brand-navy">{guest.jamMasuk}</p>
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-2xl">
                     <p className="text-[8px] font-black text-slate-400 uppercase mb-1">KELUAR</p>
                     <p className={`text-sm font-black ${guest.jamKeluar ? 'text-brand-red' : 'text-slate-300 italic text-[10px]'}`}>{guest.jamKeluar || 'Belum Keluar'}</p>
                  </div>
               </div>

               <div className="flex flex-col gap-1 px-1">
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-tight">PJ: {guest.penanggungJawab}</p>
                  <p className="text-[10px] font-bold text-slate-400 italic">"{guest.keperluan}"</p>
               </div>

               {!guest.jamKeluar && guest.status === GuestStatus.DIIZINKAN && (
                 <button onClick={() => onCheckout(guest.id)} className="w-full bg-[#00339a] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10">KONFIRMASI KELUAR</button>
               )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL IMAGE VIEW */}
      {selectedImage && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[600] flex items-center justify-center p-4 md:p-10" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full h-[85vh] bg-white rounded-[2rem] md:rounded-[3rem] p-2 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 text-slate-400 hover:text-brand-red transition-all p-3 bg-slate-50 rounded-full z-10"><X size={24} /></button>
            <div className="w-full h-full bg-slate-50 flex items-center justify-center p-4 md:p-8">
               {selectedImage.url.startsWith('data:application/pdf') ? (
                 <iframe src={selectedImage.url} className="w-full h-full border-none rounded-2xl" />
               ) : (
                 <img src={selectedImage.url} className="max-w-full max-h-full object-contain rounded-2xl" alt={selectedImage.title} />
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestList;