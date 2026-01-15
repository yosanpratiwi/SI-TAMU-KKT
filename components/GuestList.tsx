
import React, { useState } from 'react';
import { GuestEntry, GuestStatus, UserRole } from '../types';
import { Search, Download, Calendar, Target, Filter, ChevronDown, Briefcase, PlusCircle, ExternalLink, Clock, FileSpreadsheet, CreditCard, X, User, MessageSquare, Eye, Camera } from 'lucide-react';

interface GuestListProps {
  guests: GuestEntry[];
  onCheckout: (id: string) => void;
  role?: UserRole;
  onAddGuest?: () => void;
}

const GuestList: React.FC<GuestListProps> = ({ guests, onCheckout, role, onAddGuest }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string} | null>(null);

  const filteredGuests = guests.filter(g => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = g.namaLengkap.toLowerCase().includes(term) ||
                          (g.asalInstansi || '').toLowerCase().includes(term) ||
                          g.keperluan.toLowerCase().includes(term) ||
                          g.tujuan.toLowerCase().includes(term);
    
    if (dateFilter === 'all') return matchesSearch;
    const now = new Date();
    now.setHours(0,0,0,0);
    const guestDate = new Date(g.tanggal);
    if (dateFilter === 'today') return matchesSearch && g.tanggal === now.toISOString().split('T')[0];
    return matchesSearch;
  });

  const exportData = () => {
    const headers = ['Tanggal', 'Nama Tamu', 'Instansi', 'NIK KTP', 'Keperluan', 'Tujuan', 'Jam Masuk', 'Jam Keluar', 'Status Foto Wajah', 'Status Foto KTP'];
    
    const rows = filteredGuests.map(g => [
      g.tanggal, 
      g.namaLengkap, 
      g.asalInstansi || 'Pribadi', 
      `'${g.nomorKtp}`, 
      g.keperluan, 
      g.tujuan, 
      g.jamMasuk, 
      g.jamKeluar || '-',
      g.fotoTamu ? '[TERSEDIA DI SISTEM]' : '[TIDAK ADA]',
      g.fotoKTP ? '[TERSEDIA DI SISTEM]' : '[TIDAK ADA]'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Log_Tamu_KKT_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const sendWhatsAppNotification = (guest: GuestEntry) => {
    if (!guest.nomorHpPJ) return;
    const message = `🔔 NOTIFIKASI: Halo ${guest.penanggungJawab}, tamu ${guest.namaLengkap} dari ${guest.asalInstansi || 'Pribadi'} sudah tiba di lobby.`;
    let phone = guest.nomorHpPJ.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col">
      {/* MODAL PREVIEW FOTO */}
      {selectedImage && (
        <div className="fixed inset-0 bg-slate-900/95 z-[300] flex flex-col items-center justify-center p-10 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-4xl flex flex-col items-center gap-6">
            <div className="flex justify-between items-center w-full text-white border-b border-white/10 pb-4">
               <h3 className="text-lg font-black uppercase tracking-widest">{selectedImage.title}</h3>
               <button onClick={() => setSelectedImage(null)} className="text-white hover:text-brand-red transition-colors bg-white/10 p-2 rounded-full"><X size={24} /></button>
            </div>
            <div className="bg-white p-2 rounded-3xl shadow-2xl">
              <img src={selectedImage.url} className="max-w-full max-h-[70vh] rounded-2xl object-contain" alt="Preview" />
            </div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest italic">Klik di luar atau tombol silang untuk menutup</p>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setSelectedImage(null)}></div>
        </div>
      )}

      <div className="px-8 py-8 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-6 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
            <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    type="text"
                    placeholder="Pencarian tamu..."
                    className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 text-[11px] font-bold shadow-sm outline-none focus:border-brand-navy"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="relative min-w-[150px]">
                <select 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as any)}
                    className="w-full pl-4 pr-10 py-3 bg-white rounded-xl border border-slate-200 text-[9px] font-black uppercase tracking-widest appearance-none outline-none cursor-pointer"
                >
                    <option value="all">Semua Riwayat</option>
                    <option value="today">Hari Ini</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
            <button onClick={exportData} className="flex-grow lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-brand-navy rounded-xl font-black text-[9px] uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all">
                <FileSpreadsheet size={16} className="text-brand-green" /> Export CSV
            </button>
            {onAddGuest && (
                <button onClick={onAddGuest} className="flex-grow lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-brand-red text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-brand-navy transition-all shadow-lg">
                    <PlusCircle size={16} /> Registrasi Baru
                </button>
            )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-brand-navy text-white">
              <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest">Identitas & Foto</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest">KTP / ID</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest">Detail Kunjungan</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest">Waktu</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredGuests.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Belum ada data kunjungan</td></tr>
            ) : (
              filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div 
                        className="group relative h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-slate-200 cursor-pointer shadow-sm hover:border-brand-navy transition-all"
                        onClick={() => guest.fotoTamu && setSelectedImage({url: guest.fotoTamu, title: `Foto Wajah: ${guest.namaLengkap}`})}
                      >
                        {guest.fotoTamu ? (
                          <>
                            <img src={guest.fotoTamu} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-brand-navy/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye size={18} className="text-white" />
                            </div>
                          </>
                        ) : <User className="text-slate-300" size={24} />}
                      </div>
                      <div>
                        <div className="font-extrabold text-brand-navy text-sm leading-tight">{guest.namaLengkap}</div>
                        <div className="text-[9px] text-brand-red font-black uppercase tracking-widest mt-1">{guest.asalInstansi || 'Perorangan'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {guest.fotoKTP ? (
                      <button 
                        onClick={() => setSelectedImage({url: guest.fotoKTP!, title: `KTP: ${guest.namaLengkap}`})}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all"
                      >
                        <CreditCard size={14} className="text-brand-navy" /> Lihat KTP
                      </button>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-300 italic">Tanpa Foto KTP</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-[10px] font-bold text-slate-600 mb-1 leading-relaxed max-w-[200px] line-clamp-2">{guest.keperluan}</div>
                    <div className="text-[10px] font-black text-brand-navy uppercase flex items-center gap-1.5">
                        <Target size={12} className="text-brand-red" /> {guest.tujuan}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-[9px] font-black text-slate-400 flex flex-col gap-1.5">
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-brand-navy" /> IN: {guest.jamMasuk}</span>
                        {guest.jamKeluar && <span className="flex items-center gap-1.5 text-brand-green"><ExternalLink size={12} /> OUT: {guest.jamKeluar}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2 min-w-[120px]">
                        {!guest.jamKeluar ? (
                        <button onClick={() => onCheckout(guest.id)} className="w-full bg-brand-navy text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-red transition-all shadow-md shadow-brand-navy/10">
                            Check-Out
                        </button>
                        ) : (
                        <div className="bg-slate-100 text-slate-400 text-center py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200">
                            Selesai
                        </div>
                        )}
                        <button onClick={() => sendWhatsAppNotification(guest)} className="w-full bg-white text-brand-green border border-slate-200 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-green/5 transition-all flex items-center justify-center gap-2">
                            <MessageSquare size={12} /> Notif WA
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestList;
