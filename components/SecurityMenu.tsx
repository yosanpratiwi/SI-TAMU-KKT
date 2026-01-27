
import React from 'react';

interface SecurityMenuProps {
  activeView: 'form' | 'list' | 'qr';
  onSelect: (view: 'form' | 'list' | 'qr') => void;
}

const SecurityMenu: React.FC<SecurityMenuProps> = ({ activeView, onSelect }) => {
  const getBtnClass = (view: string) => {
    const isActive = activeView === view;
    return `px-6 md:px-10 py-3 md:py-4 rounded-full font-[800] text-[10px] md:text-[11px] uppercase tracking-widest transition-all border-2 shrink-0 ${
      isActive 
      ? 'bg-[#00339a] text-white border-[#00339a] shadow-xl shadow-blue-900/30 -translate-y-[2px]' 
      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-600'
    }`;
  };

  return (
    <div className="bg-white border-b border-slate-50">
      <div className="max-w-full mx-auto px-4 md:px-12 flex flex-row gap-3 md:gap-5 py-5 md:py-8 items-center overflow-x-auto no-scrollbar scroll-smooth">
        <button onClick={() => onSelect('list')} className={getBtnClass('list')}>
          DASHBOARD PEMANTAUAN
        </button>

        <button onClick={() => onSelect('form')} className={getBtnClass('form')}>
          INPUT TAMU BARU
        </button>

        <button onClick={() => onSelect('qr')} className={getBtnClass('qr')}>
          QR PENDAFTARAN
        </button>
        
        {/* Decorative Spacer for PC */}
        <div className="flex-grow hidden md:block"></div>
        
        <div className="hidden lg:block">
          <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">PT KALTIM KARIANGAU TERMINAL</p>
        </div>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default SecurityMenu;