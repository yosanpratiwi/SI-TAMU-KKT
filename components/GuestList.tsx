import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GuestEntry, GuestStatus, UserRole, VisitType } from '../types';
import { getManualWALink, sendWAAuto } from '../services/whatsapp';
import { Search, PlusCircle, Clock, FileSpreadsheet, X, User, Send, Users, ArrowUpRight, ArrowDownRight, HardHat, CheckCircle2, AlertCircle, Building, ChevronDown, Calendar, MessageSquare } from 'lucide-react';

interface GuestListProps {
  guests: GuestEntry[];
  onCheckout: (id: string) => void;
  role?: UserRole;
  onAddGuest?: () => void;
}

type DateFilterType = 'today' | '1w' | '1m' | '1y' | 'all';

const GuestList: React.FC<GuestListProps> = ({ guests, onCheckout, role, onAddGuest }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string} | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredByDate = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    return guests.filter(g => {
      const guestDate = new Date(g.tanggal);
      const diffTime = Math.abs(now.getTime() - guestDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (dateFilter) {
        case 'today': return g.tanggal === todayStr;
        case '1w': return diffDays <= 7;
        case '1m': return diffDays <= 30;
        case '1y': return diffDays <= 365;
        case 'all': return true;
        default: return true;
      }
    });
  }, [guests, dateFilter]);

  const filteredGuests = useMemo(() => {
    return filteredByDate.filter(g => {
      const term = searchTerm.toLowerCase();
      return g.namaLengkap.toLowerCase().includes(term) ||
             (g.asalInstansi || '').toLowerCase().includes(term) ||
             g.tujuan.toLowerCase().includes(term);
    });
  }, [filteredByDate, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: filteredGuests.length,
      inArea: filteredGuests.filter(g => !g.jamKeluar).length,
      out: filteredGuests.filter(g => g.jamKeluar).length
    };
  }, [filteredGuests]);

  const exportData = () => {
    const headers = ['Tanggal Kunjungan', 'Tipe', 'Nama Tamu', 'Asal Instansi', 'Staf Dituju', 'Divisi', 'Keperluan', 'Jam Masuk', 'Jam Keluar', 'Status', 'Catatan Staf'];
    const rows = filteredGuests.map(g => [
        `"${g.tanggal}"`, 
        g.visitType, 
        `"${g.namaLengkap}"`, 
        `"${g.asalInstansi || 'Pribadi'}"`, 
        `"${g.tujuan}"`, 
        `"${g.divisi}"`,
        `"${g.keperluan}"`,
        g.jamMasuk, 
        g.jamKeluar || '-',
        g.status,
        `"${g.catatan || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const today = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Tamu_KKT_${today}.csv`;
    link.click();
  };

  const notifyStaf = async (guest: GuestEntry) => {
    const approvalLink = `${window.location.origin}${window.location.pathname}?approval=${guest.id}`;
    const message = `*TAMU KKT REGISTER*\nTanggal: ${guest.tanggal}\nNama: ${guest.namaLengkap}\nInstansi: ${guest.asalInstansi}\nKeperluan: ${guest.keperluan}\nApproval: ${approvalLink}`;
    const res = await sendWAAuto(guest.nomorHpPJ, message);
    if (!res.success) window.open(getManualWALink(guest.nomorHpPJ, message), '_blank');
    else alert("Notifikasi Terkirim!");
  };

  const dateFilterLabels: Record<DateFilterType, string> = {
    today: 'Hari Ini',
    '1w': '1 Minggu',
    '1m': '1 Bulan',
    '1y': '1 Tahun',
    all: 'Semua Data'
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-[600px] rounded-3xl md:rounded-[4rem] overflow-hidden">
      {/* STATS HEADER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 p-6 md:p-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-200/60 flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tamu</p>
                <h4 className="text-3xl md:text-4xl font-black text-brand-navy leading-none">{stats.total}</h4>
            </div>
            <div className="bg-brand-navy/5 p-4 md:p-5 rounded-2xl md:rounded-3xl text-brand-navy">
                <Users size={24} />
            </div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-200/60 flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Di Area</p>
                <h4 className="text-3xl md:text-4xl font-black text-emerald-600 leading-none">{stats.inArea}</h4>
            </div>
            <div className="bg-emerald-50 p-4 md:p-5 rounded-2xl md:rounded-3xl text-emerald-600">
                <ArrowUpRight size={24} />
            </div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-200/60 flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Checkout</p>
                <h4 className="text-3xl md:text-4xl font-black text-brand-red leading-none">{stats.out}</h4>
            </div>
            <div className="bg-red-50 p-4 md:p-5 rounded-2xl md:rounded-3xl text-brand-red">
                <ArrowDownRight size={24} />
            </div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="mx-4 md:mx-8 mb-6 md:mb-8 p-5 md:p-6 bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200/60 flex flex-col xl:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
                type="text" 
                placeholder="Cari tamu..." 
                className="w-full pl-14 pr-6 py-3.5 bg-slate-50 rounded-xl border-2 border-transparent focus:border-brand-navy focus:bg-white outline-none text-sm font-bold transition-all" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="relative w-full sm:w-56" ref={filterRef}>
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-100 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-200 transition-all shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <Clock size={14} className="text-brand-navy" /> 
                    {dateFilterLabels[dateFilter]}
                  </span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isFilterOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-[100] overflow-hidden animate-in slide-in-from-top-2 duration-300">
                    {(['today', '1w', '1m', '1y', 'all'] as const).map((f) => (
                      <button 
                        key={f}
                        onClick={() => { setDateFilter(f); setIsFilterOpen(false); }}
                        className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b border-slate-50 last:border-0 ${dateFilter === f ? 'bg-brand-navy text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        {dateFilterLabels[f]}
                      </button>
                    ))}
                  </div>
                )}
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={exportData} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-50">
                    <FileSpreadsheet size={16} className="text-emerald-600" /> EXCEL (CSV)
                </button>
                {onAddGuest && (
                    <button onClick={onAddGuest} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-navy text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-brand-red transition-all shadow-lg shadow-blue-900/10">
                        <PlusCircle size={16} /> TAMU BARU
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="px-4 md:px-8 pb-8">
        <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu & Tanggal</th>
                        <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas Tamu</th>
                        <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Staf Dituju</th>
                        <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Catatan</th>
                        <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status / Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredGuests.length === 0 ? (
                        <tr><td colSpan={5} className="py-24 text-center text-slate-300 font-black uppercase tracking-widest text-xs">Data tidak ditemukan</td></tr>
                    ) : (
                        filteredGuests.map((guest) => (
                            <tr key={guest.id} className="hover:bg-slate-50/30 transition-all group">
                                <td className="px-6 md:px-10 py-6 md:py-8">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-brand-navy">
                                            <Clock size={12} className="text-brand-red" /> {guest.jamMasuk} WITA
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                            <Calendar size={12} className="text-slate-400" /> {guest.tanggal}
                                        </div>
                                        {guest.jamKeluar && (
                                            <div className="text-[9px] font-black text-brand-red uppercase">
                                                Keluar: {guest.jamKeluar}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 md:px-10 py-6 md:py-8">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div 
                                            className="relative h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden cursor-pointer shrink-0"
                                            onClick={() => guest.fotoTamu && setSelectedImage({url: guest.fotoTamu, title: guest.namaLengkap})}
                                        >
                                            {guest.fotoTamu ? <img src={guest.fotoTamu} className="w-full h-full object-cover" /> : <User className="m-auto text-slate-300" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-black text-brand-navy text-sm md:text-base truncate mb-1 leading-none">{guest.namaLengkap}</div>
                                            <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-slate-400 italic">
                                                <span className="truncate">{guest.asalInstansi || 'Pribadi'}</span>
                                                <span className={`uppercase whitespace-nowrap ${guest.visitType === VisitType.VENDOR ? 'text-brand-red' : 'text-brand-navy'}`}>({guest.visitType})</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 md:px-10 py-6 md:py-8">
                                    <div className="space-y-1">
                                        <div className="text-[11px] md:text-xs font-black text-slate-700 uppercase leading-tight">{guest.keperluan}</div>
                                        <div className="text-[9px] md:text-[10px] font-bold text-brand-navy/60 uppercase">
                                            <Building size={10} className="inline mr-1" /> {guest.tujuan} ({guest.divisi})
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 md:px-10 py-6 md:py-8 min-w-[250px]">
                                    {guest.catatan ? (
                                        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl animate-in fade-in slide-in-from-top-1 duration-500 max-w-xs">
                                          <div className="text-[8px] font-[900] text-indigo-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
                                              <MessageSquare size={10} /> Instruksi Staf
                                          </div>
                                          <div className="text-[10px] font-bold text-indigo-700 italic leading-relaxed">
                                              "{guest.catatan}"
                                          </div>
                                        </div>
                                    ) : (
                                        <span className="text-[9px] font-bold text-slate-300 uppercase italic tracking-widest">Tidak ada catatan</span>
                                    )}
                                </td>
                                <td className="px-6 md:px-10 py-6 md:py-8 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {guest.status === GuestStatus.DIIZINKAN ? (
                                            <div className="bg-emerald-50 text-emerald-600 px-3 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                                                <CheckCircle2 size={10} /> DISETUJUI
                                            </div>
                                        ) : guest.status === GuestStatus.DITOLAK ? (
                                            <div className="bg-red-50 text-brand-red px-3 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-1">
                                                <AlertCircle size={10} /> DITOLAK
                                            </div>
                                        ) : (
                                            <div className="bg-amber-50 text-amber-600 px-3 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-amber-100">
                                                PENDING
                                            </div>
                                        )}
                                        
                                        {!guest.jamKeluar && guest.status === GuestStatus.DIIZINKAN && (
                                            <button 
                                                onClick={() => onCheckout(guest.id)}
                                                className="px-4 py-2 bg-brand-navy text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-brand-red transition-all shadow-md"
                                            >
                                                OUT
                                            </button>
                                        )}
                                        <button onClick={() => notifyStaf(guest)} className="p-2 text-slate-400 hover:text-emerald-500 border border-slate-200 rounded-lg bg-white shadow-sm transition-all" title="Kirim Ulang Notifikasi WA">
                                            <Send size={14} />
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

      {/* MODAL IMAGE PREVIEW */}
      {selectedImage && (
        <div className="fixed inset-0 bg-brand-navy/95 backdrop-blur-xl z-[400] flex items-center justify-center p-6 md:p-10" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full flex flex-col items-center animate-in zoom-in duration-300">
            <button className="absolute -top-12 md:-top-16 right-0 text-white/50 hover:text-white transition-all bg-white/10 p-3 md:p-4 rounded-full"><X size={24} className="md:w-8 md:h-8" /></button>
            <div className="bg-white p-2 md:p-3 rounded-2xl md:rounded-[3rem] shadow-2xl overflow-hidden max-h-[70vh]">
              <img src={selectedImage.url} className="max-w-full max-h-full object-contain rounded-xl md:rounded-[2rem]" />
            </div>
            <h3 className="text-white font-black uppercase tracking-[0.4em] mt-6 md:mt-8 text-base md:text-xl italic">{selectedImage.title}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestList;