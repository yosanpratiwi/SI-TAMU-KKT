import React, { useState, useRef } from 'react';
import { GuestStatus, UserRole, GuestEntry, VisitType } from '../types';
import CameraCapture from './CameraCapture';
import { User, Building, Phone, CreditCard, Target, Settings, MapPin, HardHat, Briefcase, Info, ChevronRight, Users, Trash2, FileText, Upload, CheckCircle2, MessageSquare, Calendar, AlertCircle } from 'lucide-react';

interface GuestFormProps {
  onSubmit: (entry: Omit<GuestEntry, 'id' | 'jamKeluar' | 'status'>) => void;
  role: UserRole;
}

const GuestForm: React.FC<GuestFormProps> = ({ onSubmit, role }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const today = new Date().toISOString().split('T')[0];
  const displayDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

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
    tujuan: '', 
    divisi: '',
    nomorHpPJ: '', 
    deskripsiPekerjaan: '',
    lokasiPekerjaan: '',
    jamMasuk: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePhoneFocus = (field: 'nomorHp' | 'nomorHpPJ') => {
    if (!formData[field]) {
      setFormData(prev => ({ ...prev, [field]: '+62' }));
    }
  };

  const handlePhoneBlur = (field: 'nomorHp' | 'nomorHpPJ') => {
    if (formData[field] === '+62') {
      setFormData(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneChange = (field: 'nomorHp' | 'nomorHpPJ', value: string) => {
    let clean = value.replace(/[^+0-9]/g, '');
    
    if (!clean) {
      setFormData(prev => ({ ...prev, [field]: '' }));
      return;
    }

    if (!clean.startsWith('+62')) {
      if (clean.startsWith('0')) clean = clean.slice(1);
      else if (clean.startsWith('62')) clean = clean.slice(2);
      clean = '+62' + clean.replace(/\+/g, '');
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, k3Pdf: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.namaLengkap.trim()) newErrors.namaLengkap = 'Nama tamu wajib diisi.';
    if (!formData.asalInstansi.trim()) newErrors.asalInstansi = 'Asal instansi/perusahaan wajib diisi.';
    
    const cleanHp = formData.nomorHp.replace(/\+/g, '');
    if (!formData.nomorHp.trim() || cleanHp === '62') newErrors.nomorHp = 'Nomor HP aktif wajib diisi.';
    
    if (!formData.nomorKtp.trim()) newErrors.nomorKtp = 'NIK KTP wajib diisi.';
    if (formData.nomorKtp.length < 16) newErrors.nomorKtp = 'NIK harus 16 digit.';
    if (!formData.keperluan.trim()) newErrors.keperluan = 'Keperluan wajib diisi.';
    if (!formData.tujuan.trim()) newErrors.tujuan = 'Nama pegawai wajib diisi.';
    if (!formData.divisi.trim()) newErrors.divisi = 'Divisi wajib diisi.';

    const cleanHpPJ = formData.nomorHpPJ.replace(/\+/g, '');
    if (!formData.nomorHpPJ.trim() || cleanHpPJ === '62') newErrors.nomorHpPJ = 'Nomor WA pegawai wajib diisi.';
    
    if (!formData.fotoTamu) newErrors.fotoTamu = 'Ambil foto wajah.';
    if (!formData.fotoKTP) newErrors.fotoKTP = 'Ambil foto KTP.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        penanggungJawab: formData.tujuan,
        catatan: ''
      });
    }
  };

  const labelClasses = "text-[10px] md:text-[11px] font-[900] text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-2";
  const inputClasses = (error?: string) => `w-full px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl border-2 transition-all outline-none text-sm font-bold bg-slate-50/50 ${error ? 'border-brand-red/40 focus:border-brand-red' : 'border-slate-200 focus:border-brand-navy focus:bg-white'}`;

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-12 space-y-8 md:space-y-12">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-between border-b border-slate-100 pb-6 md:pb-8">
        <div className="flex p-1 bg-slate-100 rounded-xl md:rounded-2xl border border-slate-200 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFormData({...formData, visitType: VisitType.UMUM})}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${formData.visitType === VisitType.UMUM ? 'bg-white text-brand-navy shadow-sm ring-1 ring-slate-200' : 'text-slate-400'}`}
          >
            <User size={14} /> Umum
          </button>
          <button
            type="button"
            onClick={() => setFormData({...formData, visitType: VisitType.VENDOR})}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${formData.visitType === VisitType.VENDOR ? 'bg-white text-brand-red shadow-sm ring-1 ring-slate-200' : 'text-slate-400'}`}
          >
            <HardHat size={14} /> Vendor
          </button>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl md:rounded-2xl border border-slate-200 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFormData({...formData, isGroup: false})}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${!formData.isGroup ? 'bg-brand-navy text-white shadow-lg' : 'text-slate-400'}`}
          >
            <User size={14} /> Individu
          </button>
          <button
            type="button"
            onClick={() => setFormData({...formData, isGroup: true})}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${formData.isGroup ? 'bg-brand-navy text-white shadow-lg' : 'text-slate-400'}`}
          >
            <Users size={14} /> Rombongan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-10">
        <div className="col-span-full flex items-center gap-4">
            <h3 className="text-[10px] md:text-[11px] font-black text-brand-navy uppercase tracking-[0.3em] whitespace-nowrap">
                {formData.isGroup ? 'Identitas PJ Kelompok' : 'Identitas Tamu'}
            </h3>
            <div className="h-px bg-slate-200 w-full"></div>
        </div>

        <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          <CameraCapture label="FOTO WAJAH (WAJIB)" onCapture={(img) => setFormData({...formData, fotoTamu: img})} />
          <CameraCapture label="FOTO KTP/ID (WAJIB)" onCapture={(img) => setFormData({...formData, fotoKTP: img})} />
        </div>

        <div className="space-y-1">
          <label className={labelClasses}><User size={14} className="text-brand-navy" /> NAMA LENGKAP TAMU </label>
          <input type="text" className={inputClasses(errors.namaLengkap)} placeholder="Sesuai KTP" value={formData.namaLengkap} onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })} />
          {errors.namaLengkap && <p className="text-[9px] text-brand-red font-bold mt-1 px-1">{errors.namaLengkap}</p>}
        </div>

        <div className="space-y-1">
          <label className={labelClasses}><Building size={14} className="text-brand-navy" /> ASAL INSTANSI / PERUSAHAAN </label>
          <input type="text" className={inputClasses(errors.asalInstansi)} placeholder="Nama perusahaan atau instansi" value={formData.asalInstansi} onChange={(e) => setFormData({ ...formData, asalInstansi: e.target.value })} />
          {errors.asalInstansi && <p className="text-[9px] text-brand-red font-bold mt-1 px-1">{errors.asalInstansi}</p>}
        </div>

        <div className="space-y-1">
          <label className={labelClasses}><Phone size={14} className="text-brand-navy" /> NOMOR HP AKTIF </label>
          <input 
            type="text" 
            className={inputClasses(errors.nomorHp)} 
            placeholder="+62812..." 
            value={formData.nomorHp}
            onFocus={() => handlePhoneFocus('nomorHp')}
            onBlur={() => handlePhoneBlur('nomorHp')}
            onChange={(e) => handlePhoneChange('nomorHp', e.target.value)} 
          />
          {errors.nomorHp && <p className="text-[9px] text-brand-red font-bold mt-1 px-1">{errors.nomorHp}</p>}
        </div>

        <div className="space-y-1">
          <label className={labelClasses}><CreditCard size={14} className="text-brand-navy" /> NIK KTP </label>
          <input type="text" maxLength={16} className={inputClasses(errors.nomorKtp)} placeholder="16 Digit NIK" value={formData.nomorKtp} onChange={(e) => setFormData({ ...formData, nomorKtp: e.target.value.replace(/[^0-9]/g, '') })} />
          {errors.nomorKtp && <p className="text-[9px] text-brand-red font-bold mt-1 px-1">{errors.nomorKtp}</p>}
        </div>

        {formData.isGroup && (
          <div className="col-span-full bg-slate-50 p-6 md:p-8 rounded-3xl md:rounded-[2rem] border-2 border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                    <Users size={18} className="text-brand-navy" />
                    <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-brand-navy">Input Nama Anggota</h4>
                </div>
                <span className="text-[9px] font-bold text-slate-400">Total: {formData.groupMembers.length}</span>
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    className="flex-grow px-5 py-3 rounded-xl border-2 border-slate-300 outline-none focus:border-brand-navy text-sm font-bold bg-white" 
                    placeholder="Nama anggota..." 
                    value={formData.currentMember}
                    onChange={(e) => setFormData({...formData, currentMember: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                />
                <button type="button" onClick={addMember} className="bg-brand-navy text-white px-4 md:px-8 rounded-xl hover:bg-brand-red transition-all shadow-lg font-black text-[9px] uppercase tracking-widest">
                    ADD
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
                {formData.groupMembers.map((name, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white px-4 py-2 rounded-lg border border-slate-200 group">
                        <span className="text-[10px] font-bold text-slate-700 truncate mr-2">{idx + 1}. {name}</span>
                        <button type="button" onClick={() => removeMember(idx)} className="text-slate-300 hover:text-brand-red">
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
            </div>
          </div>
        )}

        <div className="col-span-full flex items-center gap-4 mt-6 md:mt-8">
            <h3 className="text-[10px] md:text-[11px] font-black text-brand-red uppercase tracking-[0.3em] whitespace-nowrap">KONFIRMASI PEGAWAI</h3>
            <div className="h-px bg-slate-200 w-full"></div>
        </div>

        <div className="space-y-1">
          <label className={labelClasses}><Target size={14} className="text-brand-navy" /> PEGAWAI YANG DITUJU </label>
          <input type="text" className={inputClasses(errors.tujuan)} placeholder="Nama pegawai KKT" value={formData.tujuan} onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })} />
          {errors.tujuan && <p className="text-[9px] text-brand-red font-bold mt-1 px-1">{errors.tujuan}</p>}
        </div>

        <div className="space-y-1">
          <label className={labelClasses}><Briefcase size={14} className="text-brand-navy" /> DIVISI / UNIT KERJA </label>
          <input type="text" className={inputClasses(errors.divisi)} placeholder="Unit kerja" value={formData.divisi} onChange={(e) => setFormData({ ...formData, divisi: e.target.value })} />
          {errors.divisi && <p className="text-[9px] text-brand-red font-bold mt-1 px-1">{errors.divisi}</p>}
        </div>

        <div className="space-y-1">
          <label className={labelClasses}><MessageSquare size={14} className="text-brand-green" /> NOMOR WHATSAPP PEGAWAI </label>
          <input 
            type="text" 
            className={inputClasses(errors.nomorHpPJ)} 
            placeholder="+62812..." 
            value={formData.nomorHpPJ}
            onFocus={() => handlePhoneFocus('nomorHpPJ')}
            onBlur={() => handlePhoneBlur('nomorHpPJ')}
            onChange={(e) => handlePhoneChange('nomorHpPJ', e.target.value)}
          />
          {errors.nomorHpPJ && <p className="text-[9px] text-brand-red font-bold mt-1 px-1">{errors.nomorHpPJ}</p>}
        </div>

        <div className="space-y-1">
          <label className={labelClasses}><Info size={14} className="text-brand-navy" /> KEPERLUAN KUNJUNGAN </label>
          <input type="text" className={inputClasses(errors.keperluan)} placeholder="Maksud kedatangan" value={formData.keperluan} onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })} />
          {errors.keperluan && <p className="text-[9px] text-brand-red font-bold mt-1 px-1">{errors.keperluan}</p>}
        </div>

        {formData.visitType === VisitType.VENDOR && (
          <>
            <div className="col-span-full border-t border-slate-100 pt-8 mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className={labelClasses}><MapPin size={14} className="text-brand-red" /> LOKASI PEKERJAAN</label>
                <input type="text" className={inputClasses()} placeholder="Area/Site" value={formData.lokasiPekerjaan} onChange={(e) => setFormData({ ...formData, lokasiPekerjaan: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className={labelClasses}><Settings size={14} className="text-brand-red" /> DESKRIPSI PEKERJAAN</label>
                <input type="text" className={inputClasses()} placeholder="Jenis pekerjaan" value={formData.deskripsiPekerjaan} onChange={(e) => setFormData({ ...formData, deskripsiPekerjaan: e.target.value })} />
              </div>
            </div>
            <div className="col-span-full space-y-1">
              <label className={labelClasses}><FileText size={14} className="text-brand-red" /> DOKUMEN K3 / IZIN KERJA</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-4 border-dashed rounded-3xl md:rounded-[2rem] p-6 md:p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${formData.k3Pdf ? 'border-brand-green bg-brand-green/5' : 'border-slate-200 hover:border-brand-navy bg-slate-50'}`}
              >
                <div className={`p-4 md:p-6 rounded-full ${formData.k3Pdf ? 'bg-brand-green/20 text-brand-green' : 'bg-white text-slate-300'}`}>
                    <Upload size={32} className="md:w-10 md:h-10" />
                </div>
                <div className="text-center">
                    <span className="block text-[11px] font-black uppercase tracking-widest text-slate-600">
                        {formData.k3Pdf ? 'DOKUMEN TERLAMPIR' : 'UNGGAH DOKUMEN K3'}
                    </span>
                    <div className="flex items-center justify-center gap-2 mt-2 text-[9px] text-slate-400 font-bold">
                        <AlertCircle size={10} /> PDF/JPG/PNG (Maksimal 5MB)
                    </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf,image/*" onChange={handleFileUpload} />
              </div>
            </div>
          </>
        )}
      </div>

      <button
        type="submit"
        className="w-full btn-brand-gradient text-white py-6 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black text-[12px] md:text-[14px] uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-4 md:gap-6"
      >
        DAFTARKAN KEDATANGAN <ChevronRight size={24} />
      </button>
    </form>
  );
};

export default GuestForm;