
import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, X, Eye, EyeOff } from 'lucide-react';

interface SecurityLoginProps {
  onLogin: (username: string, password: string) => void;
  onCancel: () => void;
}

const SecurityLogin: React.FC<SecurityLoginProps> = ({ onLogin, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onLogin(username, password);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-navy/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] md:rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in duration-500">
        <div className="relative bg-brand-navy p-8 md:p-12 text-white text-center">
          <div className="bg-white/10 w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 backdrop-blur-md border border-white/20 shadow-2xl">
              <Shield size={40} className="md:w-12 md:h-12 text-white" />
          </div>
          <h3 className="text-3xl md:text-4xl font-black tracking-tight text-white italic uppercase leading-none">SECURITY LOGIN</h3>
          <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] mt-4 text-white/50 leading-relaxed">
            Sistem Informasi Tamu Digital<br/>Kaltim Kariangau Terminal
          </p>
          
          <button onClick={onCancel} className="absolute top-6 md:top-8 right-6 md:right-8 text-white/40 hover:text-white transition-colors p-2">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8 md:space-y-10">
            <div className="space-y-6 md:space-y-8">
                <div className="space-y-2 md:space-y-3">
                    <label className="text-[11px] md:text-[12px] font-black text-slate-800 uppercase tracking-widest px-1">ID PETUGAS</label>
                    <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-navy" size={20} />
                        <input 
                            type="text"
                            placeholder="Input username..."
                            className="w-full pl-16 pr-6 py-4 md:py-5 bg-slate-50 rounded-2xl border-2 border-slate-200 focus:border-brand-navy focus:bg-white transition-all outline-none font-black text-sm text-slate-900"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                    <label className="text-[11px] md:text-[12px] font-black text-slate-800 uppercase tracking-widest px-1">PASSWORD SISTEM</label>
                    <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-navy" size={20} />
                        <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="w-full pl-16 pr-16 py-4 md:py-5 bg-slate-50 rounded-2xl border-2 border-slate-200 focus:border-brand-navy focus:bg-white transition-all outline-none font-black text-sm text-slate-900"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-navy transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            <button 
                type="submit"
                disabled={!username || !password}
                className="w-full bg-brand-red text-white py-5 md:py-6 rounded-2xl font-black text-[12px] md:text-[13px] uppercase tracking-[0.4em] hover:bg-brand-navy disabled:opacity-20 transition-all shadow-xl shadow-brand-red/20 flex items-center justify-center gap-4 group active:scale-95"
            >
                OTENTIKASI MASUK <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </form>
      </div>
    </div>
  );
};

export default SecurityLogin;
