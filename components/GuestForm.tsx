
import React, { useState, useRef } from 'react';
import { GuestStatus, UserRole, GuestEntry, VisitType } from '../types';
import CameraCapture from './CameraCapture';
import { User, Building, Phone, CreditCard, Target, Settings, MapPin, Briefcase, Info, ChevronRight, Users, Trash2, Upload, ClipboardList, MessageSquare, Plus } from 'lucide-react';

interface GuestFormProps {
  onSubmit: (entry: Omit<GuestEntry, 'id' | 'jamKeluar' | 'status'>) => void;
  role: UserRole;
}

const GuestForm: React.FC<GuestFormProps> = ({ onSubmit, role }) => {
  const k3InputRef = useRef<HTMLInputElement>(null);
  const inviteInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    tanggal: today,
    visitType: VisitType.UMUM,
    isGroup: false,
    groupMembers: [] as string[],
    currentMember: '',
    namaLengkap: '',
    asalInstansi: '',
    keperluan: '',
    nomorHp: '',
    nomorKtp: '',
    fotoTamu: '',
    fotoKTP: '',
    k3Pdf: '',
    suratUndangan: '',
    tujuan: '', 
    divisi: '',
    nomorHpPJ: '', 
    deskripsiPekerjaan: '',
    lokasiPekerjaan: '',
    jamMasuk: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePhoneChange = (field: 'nomorHp' | 'nomorHpPJ', value: string) => {
    let clean = value.replace(/[^+0-9]/g, '');
    if (!clean.startsWith('+62') && clean.length > 0) {
      if (clean.startsWith('0')) clean = clean.slice(1);
      clean = '+62' + clean;
    }
    setFormData(prev => ({ ...prev, [field]: clean }));
  };

  const addMember = () => {
    if (formData.currentMember.trim()) {
      setFormData({
        ...formData,
        groupMembers: [...formData.groupMembers, formData.currentMember.trim()],
        currentMember: ''
      });
    }
  };

  const removeMember = (index: number) => {
    setFormData({
      ...formData,
      groupMembers: formData.groupMembers.filter((_, i) => i !== index)
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'k3Pdf' | 'suratUndangan') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.namaLengkap.trim()) newErrors.namaLengkap = 'Wajib diisi';
    if (!formData.asalInstansi.trim()) newErrors.asalInstansi = 'Wajib diisi';
    if (!formData.nomorHp.trim() || formData.nomorHp === '+62') newErrors.nomorHp = 'Wajib diisi';
    if (!formData.nomorKtp.trim() || formData.nomorKtp.length < 16) newErrors.nomorKtp = 'NIK 16 Digit';
    if (!formData.tujuan.trim()) newErrors.tujuan = 'Wajib diisi';
    if (!formData.divisi.trim()) newErrors.divisi = 'Wajib diisi';
    if (!formData.nomorHpPJ.trim() || formData.nomorHpPJ === '+62') newErrors.nomorHpPJ = 'Wajib diisi';
    if (!formData.keperluan.trim()) newErrors.keperluan = 'Wajib diisi';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ ...formData, penanggungJawab: formData.tujuan });
    } else {
      alert("Mohon lengkapi formulir pendaftaran.");
    }
  };

  const labelClasses = "text-[11px] font-[800] text-brand-navy uppercase tracking-widest flex items-center gap-2 mb-3 px-1";
  const inputClasses = (error?: string) => `w-full px-6 py-4.5 rounded-xl border transition-all outline-none text-[14px] font-bold bg-[#f8fafc] ${error ? 'border-brand-red focus:border-brand-red' : 'border-slate-100 focus:border-brand-navy focus:bg-white focus:shadow-sm'}`;

  return (
    <div className="bg-white rounded-[4rem] overflow-hidden">
      {/* HEADER CARD */}
      <div className="bg-brand-navy p-10 md:p-14 text-white flex items-center gap-6 rounded-b-[4rem] md:rounded-b-[5rem]">
        <div className="bg-white/10 p-5 rounded-2xl border border-white/20">
          <ClipboardList size={36} />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-[900] italic tracking-tighter uppercase leading-none">
            BUKU TAMU DIGITAL
          </h2>
          <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] opacity-40 mt-2">
            LOBBY KALTIM KARIANGAU TERMINAL
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-16 space-y-16">
        
        {/* TABS - KATEGORI & TIPE (Sesuai Gambar) */}
        <div className="flex flex-col sm:flex-row gap-8 items-center justify-between">
          <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 w-full sm:w-auto shadow-sm">
            <button
              type="button"
              onClick={() => setFormData({...formData, visitType: VisitType.UMUM})}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-3.5 rounded-xl text-[10px] font-[900] uppercase tracking-widest transition-all ${formData.visitType === VisitType.UMUM ? 'bg-brand-navy text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <User size={14} /> TAMU UMUM
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, visitType: VisitType.VENDOR})}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-3.5 rounded-xl text-[10px] font-[900] uppercase tracking-widest transition-all ${formData.visitType === VisitType.VENDOR ? 'bg-brand-navy text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Briefcase size={14} /> VENDOR
            </button>
          </div>

          <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 w-full sm:w-auto shadow-sm">
            <button
              type="button"
              onClick={() => setFormData({...formData, isGroup: false})}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-3.5 rounded-xl text-[10px] font-[900] uppercase tracking-widest transition-all ${!formData.isGroup ? 'bg-brand-navy text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <User size={14} /> INDIVIDU
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, isGroup: true})}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-3.5 rounded-xl text-[10px] font-[900] uppercase tracking-widest transition-all ${formData.isGroup ? 'bg-brand-navy text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Users size={14} /> ROMBONGAN
            </button>
          </div>
        </div>

        {/* SECTION 1: IDENTITAS TAMU */}
        <div className="space-y-12">
          <div className="flex items-center gap-6">
            <h3 className="text-[15px] font-[900] text-brand-navy uppercase tracking-[0.3em] whitespace-nowrap italic">IDENTITAS TAMU</h3>
            <div className="h-[1px] bg-slate-100 w-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <CameraCapture label="FOTO WAJAH" onCapture={(img) => setFormData({...formData, fotoTamu: img})} />
            <CameraCapture label="FOTO KTP / ID CARD" onCapture={(img) => setFormData({...formData, fotoKTP: img})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-1">
              <label className={labelClasses}><User size={14} /> NAMA LENGKAP TAMU</label>
              <input type="text" className={inputClasses(errors.namaLengkap)} placeholder="Nama sesuai KTP" value={formData.namaLengkap} onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className={labelClasses}><Building size={14} /> ASAL INSTANSI / PERUSAHAAN</label>
              <input type="text" className={inputClasses(errors.asalInstansi)} placeholder="Nama perusahaan asal" value={formData.asalInstansi} onChange={(e) => setFormData({ ...formData, asalInstansi: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className={labelClasses}><Phone size={14} /> NOMOR AKTIF</label>
              <input type="text" className={inputClasses(errors.nomorHp)} placeholder="+628..." value={formData.nomorHp} onChange={(e) => handlePhoneChange('nomorHp', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelClasses}><CreditCard size={14} /> NIK KTP</label>
              <input type="text" maxLength={16} className={inputClasses(errors.nomorKtp)} placeholder="16 digit NIK" value={formData.nomorKtp} onChange={(e) => setFormData({ ...formData, nomorKtp: e.target.value.replace(/[^0-9]/g, '') })} />
            </div>
          </div>
        </div>

        {/* DAFTAR ANGGOTA ROMBONGAN (Sesuai Gambar) */}
        {formData.isGroup && (
          <div className="bg-[#f1f5f9] p-10 rounded-[2.5rem] border border-slate-200 space-y-8 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
              <div className="flex items-center gap-4">
                 <Users size={22} className="text-brand-navy" />
                 <h4 className="text-[13px] font-black uppercase tracking-widest text-brand-navy">DAFTAR ANGGOTA ROMBONGAN</h4>
              </div>
              <div className="bg-white text-brand-navy border border-slate-200 px-5 py-2 rounded-full text-[10px] font-black shadow-sm">
                 {formData.groupMembers.length} Peserta
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                className="flex-grow px-7 py-5 rounded-2xl border border-slate-100 outline-none focus:border-brand-navy font-bold text-sm bg-white shadow-sm" 
                placeholder="Ketik nama anggota..." 
                value={formData.currentMember} 
                onChange={(e) => setFormData({...formData, currentMember: e.target.value})} 
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())} 
              />
              <button 
                type="button" 
                onClick={addMember} 
                className="bg-brand-navy text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                TAMBAH
              </button>
            </div>
            {formData.groupMembers.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {formData.groupMembers.map((name, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white px-6 py-4 rounded-2xl border border-slate-50 shadow-sm group/item hover:border-brand-navy transition-all">
                    <span className="text-[13px] font-bold text-slate-700">{idx + 1}. {name}</span>
                    <button type="button" onClick={() => removeMember(idx)} className="text-slate-300 hover:text-brand-red transition-all"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: KONFIRMASI PEGAWAI */}
        <div className="space-y-12">
          <div className="flex items-center gap-6">
            <h3 className="text-[15px] font-[900] text-brand-navy uppercase tracking-[0.3em] whitespace-nowrap italic">KONFIRMASI PEGAWAI</h3>
            <div className="h-[1px] bg-slate-100 w-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-1">
              <label className={labelClasses}><Target size={14} /> PEGAWAI YANG DITUJU</label>
              <input type="text" className={inputClasses(errors.tujuan)} placeholder="Input nama pegawai KKT" value={formData.tujuan} onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className={labelClasses}><Briefcase size={14} /> DIVISI / UNIT KERJA</label>
              <input type="text" className={inputClasses(errors.divisi)} placeholder="Input divisi pegawai" value={formData.divisi} onChange={(e) => setFormData({ ...formData, divisi: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className={labelClasses}><MessageSquare size={14} /> WHATSAPP PEGAWAI</label>
              <input type="text" className={inputClasses(errors.nomorHpPJ)} placeholder="+628..." value={formData.nomorHpPJ} onChange={(e) => handlePhoneChange('nomorHpPJ', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelClasses}><Info size={14} /> KEPERLUAN</label>
              <input type="text" className={inputClasses(errors.keperluan)} placeholder="Contoh: Meeting Proyek, Audit, dsb." value={formData.keperluan} onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })} />
            </div>
          </div>
        </div>

        {/* VENDOR DETAIL AREA */}
        {formData.visitType === VisitType.VENDOR && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex items-center gap-6">
              <h3 className="text-[15px] font-[900] text-brand-navy uppercase tracking-[0.3em] whitespace-nowrap italic">DETAIL PEKERJAAN</h3>
              <div className="h-[1px] bg-slate-100 w-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-1">
                <label className={labelClasses}><MapPin size={14} className="text-brand-red" /> LOKASI PENGERJAAN</label>
                <input type="text" className={inputClasses()} placeholder="Contoh: Site Dermaga, Gudang" value={formData.lokasiPekerjaan} onChange={(e) => setFormData({ ...formData, lokasiPekerjaan: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className={labelClasses}><Settings size={14} className="text-brand-red" /> JENIS PEKERJAAN</label>
                <input type="text" className={inputClasses()} placeholder="Contoh: Maintenance, Sipil" value={formData.deskripsiPekerjaan} onChange={(e) => setFormData({ ...formData, deskripsiPekerjaan: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD AREA */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-4">
             {formData.visitType === VisitType.UMUM ? (
               <label className={labelClasses}><ClipboardList size={14} /> SURAT PENGANTAR / UNDANGAN</label>
             ) : (
               <label className={labelClasses}><ClipboardList size={14} /> DOKUMEN K3 / IZIN KERJA</label>
             )}
          </div>

          <div 
            onClick={() => formData.visitType === VisitType.UMUM ? inviteInputRef.current?.click() : k3InputRef.current?.click()}
            className={`group w-full min-h-[350px] border-2 border-dashed rounded-[3.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer transition-all ${
              (formData.visitType === VisitType.UMUM ? formData.suratUndangan : formData.k3Pdf) 
              ? 'border-brand-green bg-emerald-50/20' 
              : 'border-slate-200 bg-white hover:border-brand-navy hover:bg-slate-50'
            }`}
          >
            <div className={`p-8 rounded-full transition-all ${
                (formData.visitType === VisitType.UMUM ? formData.suratUndangan : formData.k3Pdf)
                ? 'bg-brand-green text-white shadow-xl shadow-emerald-200'
                : 'bg-slate-50 text-slate-300 group-hover:bg-white group-hover:text-brand-navy'
            }`}>
              <Upload size={48} />
            </div>
            <div className="text-center px-6">
              <h4 className="text-[18px] font-black uppercase tracking-widest text-slate-800 leading-none">
                {(formData.visitType === VisitType.UMUM ? formData.suratUndangan : formData.k3Pdf) 
                   ? 'DOKUMEN TERUNGGAH' 
                   : (formData.visitType === VisitType.UMUM ? 'UNGGAH SURAT' : 'UNGGAH DOKUMEN K3')}
              </h4>
              <p className="text-[10px] font-black text-slate-400 mt-4 flex items-center justify-center gap-2">
                 <Info size={14} /> PDF / JPG / PNG (MAKSIMAL 5MB)
              </p>
            </div>
            
            <input 
              type="file" 
              ref={formData.visitType === VisitType.UMUM ? inviteInputRef : k3InputRef} 
              className="hidden" 
              accept="application/pdf,image/*" 
              onChange={(e) => handleFileUpload(e, formData.visitType === VisitType.UMUM ? 'suratUndangan' : 'k3Pdf')} 
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="w-full bg-brand-navy hover:bg-brand-dark text-white py-9 rounded-[2.5rem] font-[900] text-[16px] uppercase tracking-[0.6em] transition-all shadow-[0_30px_60px_-15px_rgba(0,51,154,0.3)] active:scale-[0.98] flex items-center justify-center gap-6 mt-16 group"
        >
          DAFTARKAN KUNJUNGAN <ChevronRight size={32} className="group-hover:translate-x-3 transition-transform duration-300" />
        </button>
      </form>
    </div>
  );
};

export default GuestForm;
