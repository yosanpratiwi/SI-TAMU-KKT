
import React, { useState } from 'react';
import { GuestStatus, UserRole, GuestEntry, VisitType } from '../types';
import CameraCapture from './CameraCapture';
import { User, Building, Phone, CreditCard, Target, Clock, Settings, MapPin, HardHat, Calendar, MessageSquare, Briefcase, Info, ChevronRight, CheckCircle2 } from 'lucide-react';

interface GuestFormProps {
  onSubmit: (entry: Omit<GuestEntry, 'id' | 'jamKeluar' | 'status'>) => void;
  role: UserRole;
}

const GuestForm: React.FC<GuestFormProps> = ({ onSubmit, role }) => {
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    tanggal: getCurrentDate(),
    visitType: VisitType.STANDARD,
    namaLengkap: '',
    asalInstansi: '',
    keperluan: '',
    nomorHp: '',
    nomorKtp: '',
    fotoTamu: '',
    fotoKTP: '',
    tujuan: '',
    divisi: '',
    penanggungJawab: '',
    nomorHpPJ: '',
    deskripsiPekerjaan: '',
    lokasiPekerjaan: '',
    pemesanInternal: '',
    jamMasuk: getCurrentTime(),
    catatan: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.namaLengkap.trim()) newErrors.namaLengkap = 'Nama lengkap wajib diisi.';
    if (!formData.keperluan.trim()) newErrors.keperluan = 'Keperluan wajib diisi.';
    
    const phoneRegex = /^(\+62|0)[0-9]{9,13}$/;
    if (!phoneRegex.test(formData.nomorHp)) newErrors.nomorHp = 'Format nomor HP tidak valid.';
    
    const ktpRegex = /^[0-9]{16}$/;
    if (!ktpRegex.test(formData.nomorKtp)) newErrors.nomorKtp = 'Nomor KTP harus 16 digit.';

    if (formData.visitType === VisitType.STANDARD) {
      if (!formData.tujuan.trim()) newErrors.tujuan = 'Nama staf wajib diisi.';
      if (!formData.divisi.trim()) newErrors.divisi = 'Divisi wajib diisi.';
      if (!phoneRegex.test(formData.nomorHpPJ)) newErrors.nomorHpPJ = 'Nomor WA staf tidak valid.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const finalData = { ...formData, penanggungJawab: formData.tujuan };
      onSubmit(finalData);
    }
  };

  const inputClasses = (error?: string) => `
    w-full px-6 py-4 rounded-2xl border-2 transition-all outline-none text-sm font-bold text-slate-900
    ${error 
      ? 'border-brand-red/40 focus:border-brand-red bg-brand-red/5' 
      : 'border-slate-200 focus:border-brand-navy focus:bg-white bg-slate-50/50'}
  `;

  const labelClasses = "text-[11px] font-[900] text-slate-900 uppercase tracking-widest flex items-center gap-2 px-1 mb-2";

  return (
    <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-10">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 w-fit">
          <button
            type="button"
            onClick={() => setFormData({...formData, visitType: VisitType.STANDARD})}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.visitType === VisitType.STANDARD ? 'bg-white text-brand-navy shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <User size={14} /> Kunjungan Umum
          </button>
          <button
            type="button"
            onClick={() => setFormData({...formData, visitType: VisitType.MAINTENANCE})}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.visitType === VisitType.MAINTENANCE ? 'bg-white text-brand-red shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Settings size={14} /> Maintenance
          </button>
        </div>

        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border-2 border-slate-200 shadow-sm">
          <Calendar size={16} className="text-brand-navy" />
          <input 
            type="date"
            className="bg-transparent text-[10px] font-black text-slate-900 outline-none uppercase"
            value={formData.tanggal}
            onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        <div className="col-span-full flex items-center gap-4">
            <h3 className="text-[10px] font-black text-brand-navy uppercase tracking-[0.3em] whitespace-nowrap">Data Identitas Tamu</h3>
            <div className="h-px bg-slate-200 w-full"></div>
        </div>

        <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          <CameraCapture label="FOTO WAJAH" onCapture={(img) => setFormData({...formData, fotoTamu: img})} />
          <CameraCapture label="FOTO ID/KTP" onCapture={(img) => setFormData({...formData, fotoKTP: img})} />
        </div>

        <div className="space-y-1">
          <label className={labelClasses}>
            <User size={14} className="text-brand-navy" /> NAMA LENGKAP
          </label>
          <input
            type="text"
            className={inputClasses(errors.namaLengkap)}
            placeholder="Input nama sesuai KTP"
            value={formData.namaLengkap}
            onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className={labelClasses}>
            <Building size={14} className="text-brand-navy" /> INSTANSI / PERUSAHAAN / HUBUNGAN
          </label>
          <input
            type="text"
            className={inputClasses()}
            placeholder="Nama Perusahaan atau isi 'Keluarga Karyawan'"
            value={formData.asalInstansi}
            onChange={(e) => setFormData({ ...formData, asalInstansi: e.target.value })}
          />
          <p className="text-[9px] text-slate-400 font-bold mt-1 px-1">*Jika tamu keluarga karyawan, silakan isi: Keluarga Karyawan</p>
        </div>

        <div className="space-y-1">
          <label className={labelClasses}>
            <Phone size={14} className="text-brand-navy" /> NOMOR HP
          </label>
          <input
            type="text"
            className={inputClasses(errors.nomorHp)}
            placeholder="Contoh: 08123456789"
            value={formData.nomorHp}
            onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className={labelClasses}>
            <CreditCard size={14} className="text-brand-navy" /> NIK KTP
          </label>
          <input
            type="text"
            maxLength={16}
            className={inputClasses(errors.nomorKtp)}
            placeholder="Masukkan 16 digit NIK"
            value={formData.nomorKtp}
            onChange={(e) => setFormData({ ...formData, nomorKtp: e.target.value.replace(/[^0-9]/g, '') })}
          />
        </div>

        <div className="col-span-full space-y-1">
          <label className={labelClasses}>
            <Info size={14} className="text-brand-navy" /> KEPERLUAN KUNJUNGAN
          </label>
          <input
            type="text"
            className={inputClasses(errors.keperluan)}
            placeholder="Tuliskan tujuan kedatangan Anda secara jelas"
            value={formData.keperluan}
            onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
          />
        </div>

        {formData.visitType === VisitType.STANDARD ? (
          <>
            <div className="col-span-full flex items-center gap-4 mt-4">
                <h3 className="text-[10px] font-black text-brand-red uppercase tracking-[0.3em] whitespace-nowrap">Informasi Tujuan Kunjungan</h3>
                <div className="h-px bg-slate-200 w-full"></div>
            </div>

            <div className="space-y-1">
              <label className={labelClasses}>
                <Target size={14} className="text-brand-navy" /> NAMA STAF YANG DITUJU
              </label>
              <input
                type="text"
                className={inputClasses(errors.tujuan)}
                placeholder="Siapa yang ingin ditemui?"
                value={formData.tujuan}
                onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className={labelClasses}>
                <Briefcase size={14} className="text-brand-navy" /> DIVISI / DEPARTEMEN
              </label>
              <input
                type="text"
                className={inputClasses(errors.divisi)}
                placeholder="Unit kerja staf tersebut"
                value={formData.divisi}
                onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
              />
            </div>

            <div className="col-span-full space-y-1">
              <label className={labelClasses}>
                <MessageSquare size={14} className="text-brand-green" /> NOMOR WHATSAPP STAF (UNTUK NOTIFIKASI)
              </label>
              <input
                type="text"
                className={inputClasses(errors.nomorHpPJ)}
                placeholder="Nomor WA staf untuk konfirmasi otomatis"
                value={formData.nomorHpPJ}
                onChange={(e) => setFormData({ ...formData, nomorHpPJ: e.target.value })}
              />
            </div>
          </>
        ) : (
          <>
            <div className="col-span-full flex items-center gap-4 mt-4">
                <h3 className="text-[10px] font-black text-brand-red uppercase tracking-[0.3em] whitespace-nowrap">Detail Maintenance / Perbaikan</h3>
                <div className="h-px bg-slate-200 w-full"></div>
            </div>
            <div className="space-y-1">
              <label className={labelClasses}>
                <HardHat size={14} className="text-brand-navy" /> DESKRIPSI PEKERJAAN
              </label>
              <input
                type="text"
                className={inputClasses()}
                placeholder="Contoh: Perbaikan AC / Instalasi Jaringan"
                value={formData.deskripsiPekerjaan}
                onChange={(e) => setFormData({ ...formData, deskripsiPekerjaan: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClasses}>
                <MapPin size={14} className="text-brand-navy" /> AREA / LOKASI PEKERJAAN
              </label>
              <input
                type="text"
                className={inputClasses()}
                placeholder="Contoh: Gedung A, Lantai 2, Ruang Server"
                value={formData.lokasiPekerjaan}
                onChange={(e) => setFormData({ ...formData, lokasiPekerjaan: e.target.value })}
              />
            </div>
          </>
        )}
      </div>

      <button
        type="submit"
        className="group w-full relative overflow-hidden bg-brand-navy text-white py-6 rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] hover:bg-brand-red transition-all shadow-xl shadow-brand-navy/20 active:scale-[0.98] flex items-center justify-center gap-4 mt-6 border-b-4 border-black/20"
      >
        <span className="relative z-10 flex items-center gap-3">
          SIMPAN DATA & KIRIM NOTIFIKASI <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
    </form>
  );
};

export default GuestForm;
