import React, { useState, useMemo } from 'react';
import { GuestEntry, GuestStatus, UserRole } from '../types';
import { Search, FileSpreadsheet, X, User, Users, ArrowUpRight, ArrowDownRight, Calendar, FileDown, Trash2, MessageCircle, FileText, Download } from 'lucide-react';

interface GuestListProps {
  guests: GuestEntry[];
  onCheckout: (id: string) => void;
  onDelete?: (id: string) => void;
  onResendNotification?: (id: string) => void;
  role?: UserRole;
  onAddGuest?: () => void;
}

const GuestList: React.FC<GuestListProps> = ({ guests, onCheckout, onDelete, onResendNotification, role }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string, isPdf?: boolean} | null>(null);

  const filteredGuests = useMemo(() => {
    return guests.filter(g => {
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        g.namaLengkap.toLowerCase().includes(term) || 
        (g.asalInstansi || '').toLowerCase().includes(term) || 
        (g.nomorKtp || '').includes(term);
      
      const guestDate = g.tanggal; // format YYYY-MM-DD
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

  const exportData = () => {
    const headers = [
      'Tanggal', 
      'Tipe', 
      'Nama Tamu', 
      'Individu/Kelompok', 
      'Rombongan',
      'Nomor HP', 
      'Instansi/Perusahaan', 
      'NIK KTP', 
      'Nama Pegawai', 
      'Divisi', 
      'Keperluan', 
      'Jam Masuk', 
      'Jam Keluar'
    ];

    const rows = filteredGuests.map(g => [
      `"${g.tanggal}"`,
      `"${g.visitType}"`,
      `"${g.namaLengkap}"`,
      `"${g.isGroup ? 'KELOMPOK' : 'INDIVIDU'}"`,
      `"${g.isGroup ? g.groupMembers.join('; ') : '-'}"`,
      `="${g.nomorHp}"`,
      `="${g.asalInstansi}"`,
      `="${g.nomorKtp}"`,
      `="${g.penanggungJawab}"`,
      `="${g.divisi || '-'}"`,
      `"${g.keperluan}"`,
      `"${g.jamMasuk}"`,
      `"${g.jamKeluar || '-'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Log_Tamu_KKT_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrintFullLog = () => {
    window.print();
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-[800px] rounded-[4rem] overflow-hidden">
      
      {/* AREA KHUSUS PRINT PDF (TIDAK MUNCUL DI LAYAR) */}
      <div id="full-log-print" className="hidden print:block p-8 bg-white min-h-screen font-sans">
        <div className="flex items-center justify-between border-b-4 border-brand-navy pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-brand-navy p-3 rounded-xl text-white">
              <Users size={30} />
            </div>
            <div>
              <h1 className="text-2xl font-[900] text-brand-navy uppercase tracking-tighter italic">SECUREGATE ENTERPRISE</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Log Laporan Kunjungan Tamu Digital</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-[14px] font-[900] text-brand-navy uppercase">KALTIM KARIANGAU TERMINAL</h2>
            <p className="text-[10px] font-bold text-slate-400 italic">Handal, Tepat waktu dan Efisien</p>
            <p className="text-[9px] font-black text-slate-900 mt-1 uppercase tracking-wider">DICETAK: {new Date().toLocaleString('id-ID')} WITA</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-400 table-fixed">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-400 p-2 text-[9px] font-[900] uppercase w-[30px]">NO</th>
              <th className="border border-slate-400 p-2 text-[9px] font-[900] uppercase text-left w-[110px]">TANGGAL & WAKTU</th>
              <th className="border border-slate-400 p-2 text-[9px] font-[900] uppercase text-left">NAMA TAMU</th>
              <th className="border border-slate-400 p-2 text-[9px] font-[900] uppercase text-left">NIK (KTP)</th>
              <th className="border border-slate-400 p-2 text-[9px] font-[900] uppercase text-left">INSTANSI</th>
              <th className="border border-slate-400 p-2 text-[9px] font-[900] uppercase text-left">KEPERLUAN</th>
              <th className="border border-slate-400 p-2 text-[9px] font-[900] uppercase text-left">PEGAWAI DITUJU</th>
              <th className="border border-slate-400 p-2 text-[9px] font-[900] uppercase text-center w-[75px]">DOC K3</th>
              <th className="border border-slate-400 p-2 text-[9px] font-[900] uppercase text-center w-[75px]">UNDANGAN</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map((g, idx) => (
              <tr key={g.id} className="text-[9px] font-bold text-slate-800 leading-tight">
                <td className="border border-slate-400 p-2 text-center">{idx + 1}</td>
                <td className="border border-slate-400 p-2">
                  <span className="block font-black">{g.tanggal}</span>
                  <span className="text-emerald-600 block">IN: {g.jamMasuk}</span>
                  <span className="text-brand-red block">OUT: {g.jamKeluar || '--:--'}</span>
                </td>
                <td className="border border-slate-400 p-2 font-black uppercase break-words">{g.namaLengkap}</td>
                <td className="border border-slate-400 p-2 font-mono break-all">{g.nomorKtp}</td>
                <td className="border border-slate-400 p-2 uppercase break-words">{g.asalInstansi}</td>
                <td className="border border-slate-400 p-2 italic break-words">"{g.keperluan}"</td>
                <td className="border border-slate-400 p-2 uppercase break-words">{g.penanggungJawab}</td>
                <td className="border border-slate-400 p-2 text-center">
                  {g.k3Pdf ? (
                    <a href={g.k3Pdf} target="_blank" className="text-brand-navy underline font-black break-all">(Lihat disini)</a>
                  ) : '-'}
                </td>
                <td className="border border-slate-400 p-2 text-center">
                  {g.suratUndangan ? (
                    <a href={g.suratUndangan} target="_blank" className="text-brand-navy underline font-black break-all">(Lihat disini)</a>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-12 flex justify-end">
           <div className="text-center w-52 border-t border-slate-300 pt-3">
              <p className="text-[9px] font-black uppercase mb-12 text-slate-400 tracking-widest">Petugas Keamanan</p>
              <p className="text-[11px] font-[900] text-brand-navy uppercase tracking-tighter">( ............................ )</p>
           </div>
        </div>
      </div>

      {/* STATS AREA (HIDDEN IN PRINT) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 p-12 print:hidden">
        <div className="bg-white p-10 rounded-[3rem] shadow-md border-b-[6px] border-brand-navy flex items-center justify-between">
            <div><p className="text-[12px] font-[900] text-slate-500 uppercase tracking-widest mb-2">Total Tamu</p><h4 className="text-5xl font-[900] text-brand-navy tracking-tighter">{stats.total}</h4></div>
            <div className="bg-brand-navy/10 p-5 rounded-[2rem] text-brand-navy"><Users size={32} /></div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] shadow-md border-b-[6px] border-emerald-500 flex items-center justify-between">
            <div><p className="text-[12px] font-[900] text-slate-500 uppercase tracking-widest mb-2">Di Area</p><h4 className="text-5xl font-[900] text-emerald-600 tracking-tighter">{stats.inArea}</h4></div>
            <div className="bg-emerald-50 p-5 rounded-[2rem] text-emerald-600"><ArrowUpRight size={32} /></div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] shadow-md border-b-[6px] border-brand-red flex items-center justify-between">
            <div><p className="text-[12px] font-[900] text-slate-500 uppercase tracking-widest mb-2">Keluar</p><h4 className="text-5xl font-[900] text-brand-red tracking-tighter">{stats.out}</h4></div>
            <div className="bg-red-50 p-5 rounded-[2rem] text-brand-red"><ArrowDownRight size={32} /></div>
        </div>
      </div>

      {/* SEARCH & FILTER ACTIONS (HIDDEN IN PRINT) */}
      <div className="mx-12 mb-10 p-10 bg-white rounded-[3rem] shadow-lg flex flex-col gap-10 border border-slate-200 print:hidden">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-8">
            <div className="relative w-full xl:max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-navy" size={24} />
                <input type="text" placeholder="Cari nama, instansi, atau NIK tamu..." className="w-full pl-16 pr-8 py-5.5 bg-slate-100 rounded-[2rem] outline-none font-black text-base focus:ring-4 focus:ring-brand-navy/10 focus:bg-white transition-all border-2 border-slate-100" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                <div className="flex items-center gap-3 bg-slate-100 px-6 py-4 rounded-[2rem] border-2 border-slate-100 focus-within:bg-white focus-within:border-brand-navy transition-all">
                    <Calendar size={18} className="text-brand-navy" />
                    <input type="date" className="bg-transparent outline-none font-[900] text-[12px] text-brand-navy uppercase" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="text-slate-300 font-black">s/d</div>
                <div className="flex items-center gap-3 bg-slate-100 px-6 py-4 rounded-[2rem] border-2 border-slate-100 focus-within:bg-white focus-within:border-brand-navy transition-all">
                    <Calendar size={18} className="text-brand-navy" />
                    <input type="date" className="bg-transparent outline-none font-[900] text-[12px] text-brand-navy uppercase" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
            </div>
        </div>

        <div className="flex gap-5 justify-end">
            <button onClick={handlePrintFullLog} className="px-12 py-5.5 bg-brand-navy text-white rounded-[2rem] font-[900] text-[13px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:shadow-2xl transition-all hover:bg-brand-dark">
                <FileDown size={24} /> (PDF)
            </button>
            <button onClick={exportData} className="px-12 py-5.5 bg-emerald-600 text-white rounded-[2rem] font-[900] text-[13px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:shadow-2xl transition-all hover:bg-emerald-700">
                <FileSpreadsheet size={24} /> EXCEL
            </button>
        </div>
      </div>

      {/* DATA TABLE UI (HIDDEN IN PRINT) */}
      <div className="px-12 pb-16 overflow-x-auto print:hidden">
        <table className="w-full border-collapse min-w-[1800px] bg-white rounded-[3rem] shadow-sm overflow-hidden">
          <thead>
            <tr className="bg-brand-navy text-left">
              <th className="px-10 py-8 text-[12px] font-[900] text-white uppercase tracking-[0.3em] border-r border-white/10">WAKTU</th>
              <th className="px-10 py-8 text-[12px] font-[900] text-white uppercase tracking-[0.3em] border-r border-white/10">PROFIL TAMU</th>
              <th className="px-10 py-8 text-[12px] font-[900] text-white uppercase tracking-[0.3em] border-r border-white/10">TUJUAN & KEPERLUAN</th>
              <th className="px-10 py-8 text-[12px] font-[900] text-white uppercase tracking-[0.3em] text-center border-r border-white/10">DOKUMEN</th>
              <th className="px-10 py-8 text-[12px] font-[900] text-white uppercase tracking-[0.3em]">STATUS</th>
              <th className="px-10 py-8 text-[12px] font-[900] text-white uppercase tracking-[0.3em] text-center">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {filteredGuests.length === 0 ? (
                <tr><td colSpan={6} className="py-32 text-center font-black text-slate-300 uppercase tracking-[0.5em] text-lg">Tidak ada data ditemukan</td></tr>
            ) : (
                filteredGuests.map(guest => (
                  <tr key={guest.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-10 py-10 border-r border-slate-100">
                      <div className="space-y-3">
                          <div className="text-[13px] font-black text-emerald-600 flex items-center gap-3 bg-emerald-50 py-1.5 px-4 rounded-xl w-fit border border-emerald-100 italic">
                            IN: {guest.jamMasuk} WITA
                          </div>
                          {guest.jamKeluar ? (
                              <div className="text-[13px] font-black text-brand-red flex items-center gap-3 bg-red-50 py-1.5 px-4 rounded-xl w-fit border border-red-100 italic">
                                OUT: {guest.jamKeluar} WITA
                              </div>
                          ) : (
                              <div className="text-[11px] font-black text-slate-400 uppercase italic pl-4">Aktif di kantor</div>
                          )}
                          <div className="text-[11px] font-black text-slate-900 pt-3 flex items-center gap-2 border-t-2 border-slate-100 mt-2">
                            <Calendar size={14} className="text-brand-navy" /> {guest.tanggal}
                          </div>
                      </div>
                    </td>
                    <td className="px-10 py-10 border-r border-slate-100">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-200 overflow-hidden shrink-0 border-4 border-white shadow-xl cursor-pointer hover:scale-110 transition-all" onClick={() => guest.fotoTamu && setSelectedImage({url: guest.fotoTamu, title: guest.namaLengkap})}>
                           {guest.fotoTamu ? <img src={guest.fotoTamu} className="w-full h-full object-cover" /> : <User size={32} className="m-auto mt-6 text-slate-400" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-[900] text-[18px] text-slate-900 truncate mb-1 uppercase tracking-tight">{guest.namaLengkap}</div>
                          <div className="text-[12px] font-black text-brand-navy uppercase italic tracking-widest bg-brand-navy/5 px-3 py-1 rounded-lg w-fit">
                            {guest.asalInstansi || 'Perorangan'}
                          </div>
                          <div className="mt-1 text-[11px] font-black text-slate-500 font-mono tracking-tight">NIK: {guest.nomorKtp}</div>
                          {guest.isGroup && <div className="mt-2 text-[10px] font-black text-white bg-brand-navy px-4 py-1.5 rounded-full w-fit shadow-md">ROMBONGAN (+{guest.groupMembers.length})</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-10 border-r border-slate-100">
                      <div className="text-[15px] font-black text-slate-900 leading-tight mb-3 uppercase italic tracking-tight underline decoration-brand-navy/20 underline-offset-4">{guest.keperluan}</div>
                      <div className="text-[11px] font-[900] text-slate-600 uppercase tracking-wider flex items-center gap-2">
                        DITUJU: <span className="text-brand-navy">{guest.penanggungJawab}</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1">Divisi: {guest.divisi}</div>
                    </td>
                    
                    <td className="px-10 py-10 text-center border-r border-slate-100">
                      <div className="flex justify-center gap-4">
                        {guest.suratUndangan && (
                          <button onClick={() => setSelectedImage({url: guest.suratUndangan!, title: 'Surat Undangan', isPdf: guest.suratUndangan!.startsWith('data:application/pdf')})} className="p-4 bg-blue-50 text-brand-navy rounded-[1.5rem] hover:bg-brand-navy hover:text-white transition-all border-2 border-blue-100 shadow-sm" title="Surat Undangan">
                            <FileText size={24} />
                          </button>
                        )}
                        {guest.k3Pdf && (
                          <button onClick={() => setSelectedImage({url: guest.k3Pdf!, title: 'Dokumen K3', isPdf: guest.k3Pdf!.startsWith('data:application/pdf')})} className="p-4 bg-red-50 text-brand-red rounded-[1.5rem] hover:bg-brand-red hover:text-white transition-all border-2 border-red-100 shadow-sm" title="Surat K3">
                            <FileText size={24} />
                          </button>
                        )}
                        {!guest.suratUndangan && !guest.k3Pdf && <span className="text-slate-200 font-black">--</span>}
                      </div>
                    </td>

                    <td className="px-10 py-10 border-r border-slate-100">
                        <div className="flex flex-col gap-3">
                            {guest.status === GuestStatus.PENDING ? (
                                <span className="bg-amber-100 text-amber-700 px-6 py-2 rounded-full text-[11px] font-[900] border-2 border-amber-200 uppercase tracking-widest w-fit animate-pulse">PENDING</span>
                            ) : (
                                <span className={`px-6 py-2 rounded-full text-[11px] font-[900] border-2 uppercase tracking-widest w-fit ${guest.status === GuestStatus.DIIZINKAN ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-brand-red border-red-200'}`}>
                                    {guest.status === GuestStatus.DIIZINKAN ? 'DISETUJUI' : 'DITOLAK'}
                                </span>
                            )}
                            {guest.catatan && (
                                <div className="text-[11px] font-bold text-slate-900 bg-slate-100 p-3 rounded-xl italic leading-relaxed">"{guest.catatan}"</div>
                            )}
                        </div>
                    </td>

                    <td className="px-10 py-10 text-center">
                      <div className="flex items-center justify-center gap-4">
                        {role === UserRole.SEKURITI && guest.status === GuestStatus.PENDING && (
                           <button onClick={() => onResendNotification?.(guest.id)} className="bg-emerald-500 text-white p-4 rounded-[1.5rem] hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-90"><MessageCircle size={24} /></button>
                        )}
                        {!guest.jamKeluar && guest.status === GuestStatus.DIIZINKAN && (
                           <button onClick={() => onCheckout(guest.id)} className="bg-brand-navy text-white px-8 py-4 text-[12px] font-[900] rounded-[1.5rem] hover:bg-brand-red transition-all shadow-xl active:scale-95">CHECK-OUT</button>
                        )}
                        {role === UserRole.SEKURITI && (
                           <button onClick={() => onDelete?.(guest.id)} className="p-4 text-slate-300 hover:text-brand-red hover:bg-red-50 rounded-[1.5rem] transition-all"><Trash2 size={24} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* PREVIEW MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-2xl z-[600] flex items-center justify-center p-12 print:hidden" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-7xl w-full h-full bg-white p-4 rounded-[4rem] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-10 border-b-2 border-slate-100 flex items-center justify-between">
               <h3 className="text-[20px] font-[900] text-brand-navy uppercase tracking-[0.3em] italic">{selectedImage.title}</h3>
               <button onClick={() => setSelectedImage(null)} className="p-4 text-slate-400 hover:text-brand-red hover:bg-red-50 rounded-full transition-all"><X size={40} /></button>
            </div>
            <div className="flex-grow overflow-hidden p-10 bg-slate-100 rounded-[3rem] mx-4 mb-4">
              {selectedImage.isPdf ? (
                <iframe src={selectedImage.url} className="w-full h-full border-none rounded-3xl shadow-2xl" title={selectedImage.title} />
              ) : (
                <img src={selectedImage.url} className="w-full h-full object-contain rounded-3xl" alt={selectedImage.title} />
              )}
            </div>
            <div className="p-10 border-t-2 border-slate-100 flex justify-end">
               <a href={selectedImage.url} download={selectedImage.title} className="bg-brand-navy text-white px-14 py-6 rounded-3xl font-[900] text-[14px] uppercase tracking-[0.4em] flex items-center gap-5 shadow-2xl hover:scale-105 active:scale-95 transition-all">
                  <Download size={26} /> DOWNLOAD FILE
               </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestList;