
import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, X, Eye, EyeOff, Anchor } from 'lucide-react';

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
    <div className="fixed inset-0 bg-brand-navy/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in duration-500">
        <div className="relative bg-brand-navy p-12 text-white text-center">
          <div className="bg-white/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/20 shadow-2xl">
              <Shield size={48} className="text-white" />
          </div>
          <h3 className="text-3xl font-black tracking-tight">Login Petugas</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] mt-3 opacity-60">SI-TAMU KKT SECURITY</p>
          
          <button onClick={onCancel} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors p-2">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-10">
            <div className="space-y-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">ID PENGGUNA</label>
                    <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input 
                            type="text"
                            placeholder="Input username..."
                            className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-[1.5rem] border-2 border-slate-100 focus:border-brand-navy focus:bg-white transition-all outline-none font-bold text-sm"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">KATA SANDI</label>
                    <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="w-full pl-16 pr-16 py-5 bg-slate-50 rounded-[1.5rem] border-2 border-slate-100 focus:border-brand-navy focus:bg-white transition-all outline-none font-bold text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-navy transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            <button 
                type="submit"
                disabled={!username || !password}
                className="w-full bg-brand-red text-white py-6 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-brand-navy disabled:opacity-30 transition-all shadow-2xl shadow-brand-red/20 flex items-center justify-center gap-4 group active:scale-95"
            >
                MASUK SISTEM <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </form>
      </div>
    </div>
  );
};

export default SecurityLogin;
