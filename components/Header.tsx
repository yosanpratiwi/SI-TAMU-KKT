import React from 'react';
import { UserRole } from '../types';
import { Shield, User, MapPin, Building2, Briefcase } from 'lucide-react';

interface HeaderProps {
  role: UserRole;
  onToggleRole: () => void;
}

const Header: React.FC<HeaderProps> = ({ role, onToggleRole }) => {
  const isSecurity = role === UserRole.SEKURITI;
  const isStaff = role === UserRole.STAF;

  return (
    <header className="bg-white border-b-4 border-[#00339a] px-6 py-6 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* TYPOGRAPHIC BRANDING */}
        <div className="flex flex-col md:items-start items-center text-center md:text-left">
          <div className="flex items-center gap-3 mb-1">
            <Building2 size={24} className="text-[#00339a]" />
            <h1 className="text-2xl font-[900] text-[#00339a] tracking-tight leading-none uppercase">
              KALTIM KARIANGAU TERMINAL
            </h1>
          </div>
          <p className="text-[12px] font-bold italic text-slate-500 tracking-wide border-t border-slate-100 pt-1 inline-block">
            Handal, Tepat waktu dan Efisien
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end border-r border-slate-200 pr-6">
            <div className="flex items-center gap-2 text-[#00339a]">
              <MapPin size={14} className="text-[#ee1c25]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">LOBBY</span>
            </div>
            <span className="text-[11px] font-extrabold text-slate-400 mt-0.5 italic">Sistem Informasi Tamu Digital</span>
          </div>

          <button 
            onClick={onToggleRole}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all border-2 active:scale-95 group shadow-sm ${
              isSecurity 
              ? 'bg-[#00339a] text-white border-[#00339a] shadow-lg shadow-blue-900/20' 
              : isStaff
              ? 'bg-[#009245] text-white border-[#009245] shadow-lg shadow-emerald-900/20'
              : 'bg-white text-[#00339a] border-slate-200 hover:border-[#00339a]'
            }`}
          >
            {isSecurity ? <Shield size={18} className="group-hover:rotate-12 transition-transform" /> : isStaff ? <Briefcase size={18} /> : <User size={18} />}
            {isSecurity ? 'MODE SEKURITI' : isStaff ? 'MODE STAF' : 'MODE TAMU'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;