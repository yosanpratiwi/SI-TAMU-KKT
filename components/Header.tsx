
import React from 'react';
import { UserRole } from '../types';
import { Shield, User, Briefcase, MapPin, Navigation } from 'lucide-react';

interface HeaderProps {
  role: UserRole;
  onToggleRole: () => void;
}

const Header: React.FC<HeaderProps> = ({ role, onToggleRole }) => {
  const isSecurity = role === UserRole.SEKURITI;
  const isStaff = role === UserRole.STAF;

  return (
    <header className="bg-white border-b border-slate-100 px-4 md:px-12 py-4 md:py-5 sticky top-0 z-50 shadow-sm print:hidden">
      <div className="max-w-full flex items-center justify-between">
        
        {/* BAGIAN KIRI: LOGO & SLOGAN */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <div className="text-brand-navy">
            <Navigation size={28} fill="currentColor" className="rotate-45 md:w-8 md:h-8" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[14px] md:text-[20px] font-[900] text-brand-navy uppercase tracking-tight leading-none">
              KALTIM KARIANGAU TERMINAL
            </h1>
            <p className="text-[8px] md:text-[11px] font-medium italic text-slate-400 mt-0.5 md:mt-1">
              Handal, Tepat waktu dan Efisien
            </p>
          </div>
        </div>

        {/* BAGIAN KANAN: LOKASI & PEMISAH */}
        <div className="flex items-center gap-3 md:gap-10">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden sm:block h-10 w-[1px] bg-slate-200"></div> {/* Vertical Separator */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="bg-red-50 p-2 md:p-2.5 rounded-full shrink-0">
                <MapPin size={18} className="text-brand-red md:w-5 md:h-5" fill="currentColor" fillOpacity="0.2" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] md:text-[14px] font-[900] text-brand-navy uppercase tracking-tight leading-none">
                  LOBBY – KALTIM KARIANGAU TERMINAL
                </span>
                <span className="text-[8px] md:text-[10px] font-medium italic text-slate-400 mt-0.5 md:mt-1">
                  Sistem Informasi Tamu Digital
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={onToggleRole}
            className="flex items-center gap-2 p-2 rounded-full hover:bg-slate-50 transition-all text-brand-navy ml-2"
          >
            {isSecurity ? <Shield size={18} className="md:w-5 md:h-5" /> : isStaff ? <Briefcase size={18} className="md:w-5 md:h-5" /> : <User size={18} className="md:w-5 md:h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;