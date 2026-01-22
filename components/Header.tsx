import React from 'react';
import { UserRole } from '../types';
import { Shield, User, Briefcase, MapPin } from 'lucide-react';

interface HeaderProps {
  role: UserRole;
  onToggleRole: () => void;
}

const Header: React.FC<HeaderProps> = ({ role, onToggleRole }) => {
  const isSecurity = role === UserRole.SEKURITI;
  const isStaff = role === UserRole.STAF;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-50 shadow-sm print:hidden">
      <div className="container mx-auto max-w-[1400px] flex items-center justify-between">
        
        {/* LOGO KKT - SESUAI LAMPIRAN 2 */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-brand-navy" fill="currentColor">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
              </svg>
              <h1 className="text-[15px] font-[900] text-brand-navy uppercase tracking-tight leading-none">
                KALTIM KARIANGAU TERMINAL
              </h1>
            </div>
            <p className="text-[9px] font-bold italic text-slate-400 mt-1 pl-8">
              Handal, Tepat waktu dan Efisien
            </p>
          </div>
        </div>

        {/* INFO LOKASI - SESUAI LAMPIRAN 2 */}
        <div className="hidden lg:flex items-center gap-3 border-l border-slate-200 pl-8">
          <div className="bg-brand-red/10 p-2 rounded-full">
            <MapPin size={16} className="text-brand-red" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-brand-navy uppercase tracking-widest">
              LOBBY - KALTIM KARIANGAU TERMINAL
            </span>
            <span className="text-[9px] font-bold text-slate-400 italic">
              Sistem Informasi Tamu Digital
            </span>
          </div>
        </div>

        {/* TOMBOL MODE - SESUAI LAMPIRAN 2 */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-[1px] bg-slate-200 mr-2 hidden sm:block"></div>
          <button 
            onClick={onToggleRole}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-[900] text-[10px] uppercase tracking-[0.1em] transition-all border active:scale-95 group shadow-sm ${
              isSecurity 
              ? 'bg-brand-navy text-white border-brand-navy shadow-lg shadow-brand-navy/20' 
              : isStaff
              ? 'bg-brand-green text-white border-brand-green'
              : 'bg-white text-brand-navy border-slate-200 hover:border-brand-navy'
            }`}
          >
            {isSecurity ? <Shield size={14} /> : isStaff ? <Briefcase size={14} /> : <User size={14} />}
            {isSecurity ? 'MODE SEKURITI' : isStaff ? 'MODE STAF' : 'MODE TAMU'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;