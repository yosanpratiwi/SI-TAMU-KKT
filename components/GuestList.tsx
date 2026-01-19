import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GuestEntry, GuestStatus, UserRole, VisitType } from '../types';
import { getManualWALink, sendWAAuto } from '../services/whatsapp';
import { Search, PlusCircle, Clock, FileSpreadsheet, X, User, Send, Users, ArrowUpRight, ArrowDownRight, HardHat, CheckCircle2, AlertCircle, Building, ChevronDown, Calendar, MessageSquare, FileText, ExternalLink, Printer, Download, QrCode, FileDown, Trash2 } from 'lucide-react';

interface GuestListProps {
  guests: GuestEntry[];
  onCheckout: (id: string) => void;
  onDelete?: (id: string) => void;
  role?: UserRole;
  onAddGuest?: () => void;
}

const GuestList: React.FC<GuestListProps> = ({ guests, onCheckout, onDelete, role, onAddGuest }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string, isPdf?: boolean} | null>(null);
  const [printGuest, setPrintGuest] = useState<GuestEntry | null>(null);
  const [isPrintingFullLog, setIsPrintingFullLog] = useState(false);

  // Helper untuk normalisasi tipe (Old Standard -> UMUM)
  const getDisplayType = (type: string) => {
    if (type === 'STANDARD') return 'UMUM';
    return type;
  };

  const filteredByDate = useMemo(() => {
    return guests.filter(g => {
      if (!startDate && !endDate) return true;
      const guestDate = g.tanggal; // YYYY-MM-DD
      if (startDate && guestDate < startDate) return false;
      if (endDate && guestDate > endDate) return false;
      return true;
    });
  }, [guests, startDate, endDate]);

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
    const headers = [
      'Tanggal', 
      'Tipe', 
      'Nama Tamu',
      'Individu/Kelompok', 
      'Nomor HP', 
      'Instansi/Perusahaan', 
      'NIK KTP', 
      'Nama Pegawai', 
      'Divisi', 
      'Keperluan', 
      'Jam Masuk', 
      'Jam Keluar'
    ];
    
    const rows = filteredGuests.map(g => {
        const individuKelompok = g.isGroup 
          ? `KELOMPOK (Anggota: ${g.groupMembers?.join('; ')})` 
          : 'INDIVIDU';

        return [
          `"${g.tanggal}"`, 
          getDisplayType(g.visitType),
          `"${g.namaLengkap}"`,
          `"${individuKelompok}"`,
          `"${g.nomorHp}"`,
          `"${g.asalInstansi || 'Pribadi'}"`, 
          `"${g.nomorKtp}"`,
          `"${g.penanggungJawab}"`, 
          `"${g.divisi}"`,
          `"${g.keperluan}"`,
          g.jamMasuk, 
          g.jamKeluar || '-'
        ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Log_Tamu_KKT_${new Date().getTime()}.csv`;
    link.click();
  };

  const handlePrintFullLog = () => {
    setPrintGuest(null);
    setIsPrintingFullLog(true);
    setTimeout(() => {
      window.print();
      setIsPrintingFullLog(false);
    }, 500);
  };

  const handlePrintPass = (guest: GuestEntry) => {
    setIsPrintingFullLog(false);
    setPrintGuest(guest);
    setTimeout(() => {
      window.print();
      setPrintGuest(null);
    }, 500);
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-[600px] rounded-3xl md:rounded-[4rem] overflow-hidden">
      
      {/* PRINT TEMPLATE: FULL LOG REPORT */}
      {isPrintingFullLog && (
        <div id="full-log-print" className="hidden print:block fixed inset-0 bg-white z-[9999] p-4 overflow-visible">
          <div className="flex items-center justify-between border-b-4 border-brand-navy pb-4 mb-6">
            <div>
              <h1 className="text-xl font-black text-brand-navy uppercase tracking-tighter">PT KALTIM KARIANGAU TERMINAL</h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Laporan Log Buku Tamu Digital (SI-TAMU)</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase">Status:</p>
              <p className="text-xs font-black text-brand-navy uppercase">DOKUMEN RESMI SISTEM</p>
            </div>
          </div>

          <table className="w-full border-collapse text-[7px] leading-tight">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-1 font-black uppercase text-center">Tanggal</th>
                <th className="border border-slate-300 p-1 font-black uppercase">Tamu (Individu/Kelompok)</th>
                <th className="border border-slate-300 p-1 font-black uppercase">Nomor HP</th>
                <th className="border border-slate-300 p-1 font-black uppercase">Instansi & NIK</th>
                <th className="border border-slate-300 p-1 font-black uppercase">Pegawai & Divisi</th>
                <th className="border border-slate-300 p-1 font-black uppercase">Keperluan</th>
                <th className="border border-slate-300 p-1 font-black uppercase text-center">In / Out</th>
                <th className="border border-slate-300 p-1 font-black uppercase text-center">Foto Wajah</th>
                <th className="border border-slate-300 p-1 font-black uppercase text-center">Foto KTP</th>
                <th className="border border-slate-300 p-1 font-black uppercase text-center">Dokumen K3</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((g) => (
                <tr key={g.id} className="page-break-inside-avoid">
                  <td className="border border-slate-300 p-1 align-top text-center">{g.tanggal}</td>
                  <td className="border border-slate-300 p-1 align-top">
                    <div className="font-black">{g.namaLengkap}</div>
                    {g.isGroup && <div className="text-[6px] italic text-slate-500">Anggota: {g.groupMembers.join(', ')}</div>}
                  </td>
                  <td className="border border-slate-300 p-1 align-top text-emerald-600 font-bold">{g.nomorHp}</td>
                  <td className="border border-slate-300 p-1 align-top">
                    <div>{g.asalInstansi || '-'}</div>
                    <div className="text-slate-400 font-bold">{g.nomorKtp}</div>
                  </td>
                  <td className="border border-slate-300 p-1 align-top">
                    <div className="font-bold text-brand-navy">{g.penanggungJawab}</div>
                    <div className="text-slate-400 italic">({g.divisi})</div>
                  </td>
                  <td className="border border-slate-300 p-1 align-top uppercase">{g.keperluan}</td>
                  <td className="border border-slate-300 p-1 align-top text-center">
                    <div className="font-black">IN: {g.jamMasuk}</div>
                    <div className="text-brand-red font-black">OUT: {g.jamKeluar || '-'}</div>
                  </td>
                  <td className="border border-slate-300 p-1 align-top text-center">
                    {g.fotoTamu ? <img src={g.fotoTamu} className="w-10 h-10 object-cover mx-auto border border-slate-200" /> : '-'}
                  </td>
                  <td className="border border-slate-300 p-1 align-top text-center">
                    {g.fotoKTP ? <img src={g.fotoKTP} className="w-12 h-8 object-cover mx-auto border border-slate-200" /> : '-'}
                  </td>
                  <td className="border border-slate-300 p-1 align-top text-center">
                    {g.k3Pdf ? (
                      <a href={g.k3Pdf} target="_blank" rel="noopener noreferrer" className="text-brand-navy font-black underline">Lihat disini</a>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW PASS MODAL TEMPLATE */}
      {printGuest && (
        <div id="guest-pass-print" className="hidden print:block fixed inset-0 bg-white z-[9999] p-10">
          <div className="max-w-[400px] mx-auto border-4 border-brand-navy rounded-[2rem] overflow-hidden">
             <div className="bg-brand-navy p-6 text-white text-center">
                <p className="text-[10px] font-black tracking-[0.4em] mb-1 uppercase">PT KALTIM KARIANGAU TERMINAL</p>
                <h2 className="text-2xl font-black italic">VISITOR PASS</h2>
             </div>
             <div className="p-8 space-y-6 flex flex-col items-center">
                <div className="w-40 h-40 bg-slate-100 rounded-3xl border-4 border-slate-200 overflow-hidden">
                   {printGuest.fotoTamu ? <img src={printGuest.fotoTamu} className="w-full h-full object-cover" /> : <User size={60} className="m-auto mt-10 text-slate-300" />}
                </div>
                <div className="text-center">
                   <h3 className="text-2xl font-black text-brand-navy tracking-tight">{printGuest.namaLengkap}</h3>
                   <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{printGuest.asalInstansi || 'Pribadi'}</p>
                </div>
                <div className="w-full grid grid-cols-2 gap-4 border-y border-slate-100 py-6">
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Waktu Masuk</p>
                      <p className="text-xs font-black text-brand-navy">{printGuest.jamMasuk} WITA</p>
                   </div>
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pegawai Tujuan</p>
                      <p className="text-xs font-black text-brand-navy truncate">{printGuest.penanggungJawab}</p>
                   </div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                   <QrCode size={40} className="text-brand-navy" />
                </div>
             </div>
             <div className={`h-4 w-full ${printGuest.status === GuestStatus.DIIZINKAN ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          </div>
        </div>
      )}

      {/* STATS & SEARCH */}
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

      <div className="mx-4 md:mx-8 mb-6 md:mb-8 p-5 md:p-6 bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200/60 flex flex-col xl:flex-row items-center justify-between gap-6">
        <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
                type="text" 
                placeholder="Cari nama tamu / instansi..." 
                className="w-full pl-14 pr-6 py-3.5 bg-slate-50 rounded-xl border-2 border-transparent focus:border-brand-navy focus:bg-white outline-none text-sm font-bold transition-all" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl border border-slate-200 w-full sm:w-auto">
                <input type="date" className="bg-white border-none rounded-lg px-3 py-1.5 text-[10px] font-black outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <span className="text-slate-300">s/d</span>
                <input type="date" className="bg-white border-none rounded-lg px-3 py-1.5 text-[10px] font-black outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={handlePrintFullLog} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all">
                    <FileDown size={16} /> PDF LOG
                </button>
                <button onClick={exportData} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all group">
                    <FileSpreadsheet size={16} className="text-emerald-600 group-hover:text-white" /> EXCEL (CSV)
                </button>
            </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="px-4 md:px-8 pb-8">
        <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu & Tanggal</th>
                        <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas Tamu</th>
                        <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Pegawai Dituju</th>
                        <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Catatan Staf</th>
                        <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status / Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredGuests.length === 0 ? (
                        <tr><td colSpan={5} className="py-24 text-center text-slate-300 font-black uppercase tracking-widest text-xs">Data tidak ditemukan dalam sistem</td></tr>
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
                                        {guest.jamKeluar && <div className="text-[9px] font-black text-brand-red uppercase">Keluar: {guest.jamKeluar}</div>}
                                    </div>
                                </td>
                                <td className="px-6 md:px-10 py-6 md:py-8">
                                    <div className="flex items-start gap-4">
                                        <div className="relative h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer shrink-0" onClick={() => guest.fotoTamu && setSelectedImage({url: guest.fotoTamu, title: guest.namaLengkap})}>
                                            {guest.fotoTamu ? <img src={guest.fotoTamu} className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-3 text-slate-300" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-black text-brand-navy text-sm truncate">{guest.namaLengkap}</div>
                                            <div className="text-[9px] font-bold text-slate-400 italic mb-1">
                                              {guest.asalInstansi || 'Pribadi'} ({getDisplayType(guest.visitType)})
                                            </div>
                                            {guest.isGroup && <div className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 w-fit">KELOMPOK (+{guest.groupMembers.length})</div>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 md:px-10 py-6 md:py-8">
                                    <div className="text-[11px] font-black text-slate-700 uppercase">{guest.keperluan}</div>
                                    <div className="text-[9px] font-bold text-brand-navy/60 uppercase">Tujuan: {guest.penanggungJawab} ({guest.divisi})</div>
                                </td>
                                <td className="px-6 md:px-10 py-6 md:py-8">
                                    {guest.catatan ? (
                                        <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-lg text-[9px] font-bold text-indigo-700 italic">"{guest.catatan}"</div>
                                    ) : (
                                        <span className="text-[9px] font-bold text-slate-300 italic">Tidak ada catatan</span>
                                    )}
                                </td>
                                <td className="px-6 md:px-10 py-6 md:py-8 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {guest.status === GuestStatus.DIIZINKAN ? (
                                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border border-emerald-100">DISETUJUI</span>
                                        ) : guest.status === GuestStatus.DITOLAK ? (
                                            <span className="bg-red-50 text-brand-red px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border border-red-100">DITOLAK</span>
                                        ) : (
                                            <span className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border border-amber-100">PENDING</span>
                                        )}
                                        {!guest.jamKeluar && guest.status === GuestStatus.DIIZINKAN && (
                                            <button onClick={() => onCheckout(guest.id)} className="px-3 py-1.5 bg-brand-navy text-white text-[8px] font-black uppercase rounded-lg hover:bg-brand-red transition-all">OUT</button>
                                        )}
                                        {role === UserRole.SEKURITI && (
                                            <button 
                                              onClick={() => onDelete && window.confirm('Hapus data ini? (Tindakan ini tidak dapat dibatalkan)') && onDelete(guest.id)} 
                                              className="p-2 text-slate-300 hover:text-brand-red transition-colors"
                                              title="Hapus Data Double"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                        <button onClick={() => handlePrintPass(guest)} className="p-2 text-slate-300 hover:text-brand-navy transition-colors"><Printer size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-brand-navy/95 backdrop-blur-xl z-[400] flex items-center justify-center p-6" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full h-[80vh] bg-white p-2 rounded-3xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 text-white"><X size={28} /></button>
            {selectedImage.isPdf ? (
              <iframe src={selectedImage.url} className="w-full h-full rounded-2xl border-none" />
            ) : (
              <img src={selectedImage.url} className="w-full h-full object-contain rounded-2xl" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestList;