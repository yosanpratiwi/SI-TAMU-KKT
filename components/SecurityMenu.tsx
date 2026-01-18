import React from 'react';
import { Plus, ListFilter } from 'lucide-react';

interface SecurityMenuProps {
  activeView: 'form' | 'list';
  onSelect: (view: 'form' | 'list') => void;
}

const SecurityMenu: React.FC<SecurityMenuProps> = ({ activeView, onSelect }) => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 w-full max-w-sm border border-slate-50 animate-in slide-in-from-left-10 duration-500">
      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">
        AKSES PETUGAS
      </h3>
      
      <div className="flex flex-col gap-4">
        <button
          onClick={() => onSelect('form')}
          className={`flex items-center gap-4 px-6 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all duration-300 group ${
            activeView === 'form' 
            ? 'bg-[#0f172a] text-white shadow-xl shadow-slate-200' 
            : 'bg-white text-slate-500 border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className={`p-2 rounded-lg transition-colors ${activeView === 'form' ? 'bg-white/10' : 'bg-slate-100 text-slate-400 group-hover:text-brand-navy'}`}>
            <Plus size={20} strokeWidth={3} />
          </div>
          REGISTRASI BARU
        </button>

        <button
          onClick={() => onSelect('list')}
          className={`flex items-center gap-4 px-6 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all duration-300 group ${
            activeView === 'list' 
            ? 'bg-[#0f172a] text-white shadow-xl shadow-slate-200' 
            : 'bg-white text-slate-500 border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className={`p-2 rounded-lg transition-colors ${activeView === 'list' ? 'bg-white/10' : 'bg-slate-100 text-slate-400 group-hover:text-brand-navy'}`}>
            <ListFilter size={20} strokeWidth={3} />
          </div>
          LOG BUKU TAMU
        </button>
      </div>
    </div>
  );
};

export default SecurityMenu;