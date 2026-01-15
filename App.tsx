
import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, GuestEntry, GuestStatus, Notification, VisitType } from './types';
import Header from './components/Header';
import GuestForm from './components/GuestForm';
import GuestList from './components/GuestList';
import NotificationCenter from './components/NotificationCenter';
import SecurityLogin from './components/SecurityLogin';
import { sendWAAuto, generateGuestMessage, getManualWALink } from './services/whatsapp';
import { List, PlusCircle, CheckCircle2, MessageSquare, ArrowRight, ShieldCheck, ClipboardList, Send, ExternalLink, Loader2 } from 'lucide-react';

const DAFTAR_PETUGAS = [
  { username: 'admin', password: 'admin123' },
  { username: 'sekuriti', password: '123' }
];

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.TAMU);
  const [isSecurityLoggedIn, setIsSecurityLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [guests, setGuests] = useState<GuestEntry[]>(() => {
    const saved = localStorage.getItem('kkt_guests');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [view, setView] = useState<'form' | 'list' | 'success'>('form');
  const [lastRegisteredGuest, setLastRegisteredGuest] = useState<GuestEntry | null>(null);
  const [waStatus, setWaStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  useEffect(() => {
    localStorage.setItem('kkt_guests', JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    if (role === UserRole.TAMU && view !== 'success') {
      setView('form');
    } else if (role === UserRole.SEKURITI && !isSecurityLoggedIn) {
        setShowLoginModal(true);
    }
  }, [role, isSecurityLoggedIn]);

  const toggleRole = () => {
    if (role === UserRole.TAMU) {
        setRole(UserRole.SEKURITI);
    } else {
        setRole(UserRole.TAMU);
        setIsSecurityLoggedIn(false);
        setView('form');
    }
  };

  const handleSecurityLogin = (username: string, password: string) => {
    const userFound = DAFTAR_PETUGAS.find(u => u.username === username && u.password === password);
    if (userFound) { 
      setIsSecurityLoggedIn(true);
      setShowLoginModal(false);
      setView('list');
    } else {
      alert('Login Gagal! Mohon periksa kembali username dan password.');
    }
  };

  const handleAddGuest = useCallback(async (newEntry: Omit<GuestEntry, 'id' | 'jamKeluar' | 'status'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const status = newEntry.visitType === VisitType.MAINTENANCE ? GuestStatus.LOGGED : GuestStatus.PENDING;
    
    const entry: GuestEntry = { ...newEntry, id, jamKeluar: null, status };
    setGuests(prev => [entry, ...prev]);
    setLastRegisteredGuest(entry);
    setView('success');
    setWaStatus('sending');

    if (entry.nomorHpPJ) {
      const waMessage = generateGuestMessage(entry.namaLengkap, entry.asalInstansi, entry.penanggungJawab, entry.keperluan);
      const result = await sendWAAuto(entry.nomorHpPJ, waMessage);
      setWaStatus(result.success ? 'sent' : 'failed');
    } else {
      setWaStatus('idle');
    }
  }, []);

  const handleUpdateStatus = useCallback((guestId: string, status: GuestStatus, catatan: string, notifId: string) => {
    setGuests(prev => prev.map(g => 
      g.id === guestId ? { ...g, status, catatan: catatan || g.catatan, authorizedBy: 'Security KKT' } : g
    ));
    setNotifications(prev => prev.map(n => 
      n.id === notifId ? { ...n, isActioned: true } : n
    ));
  }, []);

  const handleCheckout = useCallback((id: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setGuests(prev => prev.map(g => g.id === id ? { ...g, jamKeluar: timeStr } : g));
  }, []);

  const handleManualWA = () => {
    if (lastRegisteredGuest) {
      const msg = generateGuestMessage(
        lastRegisteredGuest.namaLengkap, 
        lastRegisteredGuest.asalInstansi, 
        lastRegisteredGuest.penanggungJawab, 
        lastRegisteredGuest.keperluan
      );
      const link = getManualWALink(lastRegisteredGuest.nomorHpPJ, msg);
      window.open(link, '_blank');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header role={role} onToggleRole={toggleRole} />
      
      {showLoginModal && (
        <SecurityLogin onLogin={handleSecurityLogin} onCancel={() => { setShowLoginModal(false); setRole(UserRole.TAMU); }} />
      )}

      <main className="flex-grow container mx-auto px-4 py-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {role === UserRole.SEKURITI && isSecurityLoggedIn && (
            <aside className="w-full lg:w-72 shrink-0">
              <div className="bg-white p-8 rounded-3xl shadow-xl border-t-8 border-[#00339a]">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b pb-3">Menu Utama Petugas</p>
                <div className="space-y-3">
                  <button 
                    onClick={() => setView('form')} 
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${view === 'form' ? 'bg-[#00339a] text-white shadow-lg shadow-blue-900/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <PlusCircle size={20} /> Registrasi Tamu
                  </button>
                  <button 
                    onClick={() => setView('list')} 
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${view === 'list' ? 'bg-[#00339a] text-white shadow-lg shadow-blue-900/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <List size={20} /> Log Kedatangan
                  </button>
                </div>
                <button 
                  onClick={() => { if(confirm('Hapus semua riwayat?')) { setGuests([]); localStorage.removeItem('kkt_guests'); } }}
                  className="w-full mt-10 text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-red-500 transition-colors"
                >
                  Reset Data Lokal
                </button>
              </div>
            </aside>
          )}

          <div className="flex-grow">
            {view === 'success' ? (
              <div className="bg-white rounded-[3rem] border-t-8 border-brand-green shadow-2xl p-16 text-center max-w-2xl mx-auto">
                <div className="bg-brand-green/10 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-brand-green/20">
                  <CheckCircle2 size={64} className="text-brand-green" />
                </div>
                <h2 className="text-4xl font-black text-brand-navy mb-4 tracking-tighter">Berhasil Terdaftar</h2>
                <p className="text-slate-500 font-medium text-lg mb-8">
                  Terima kasih, data Bapak/Ibu <span className="text-[#00339a] font-extrabold">{lastRegisteredGuest?.namaLengkap}</span> telah tersimpan di sistem KKT.
                </p>

                {/* WHATSAPP STATUS AREA */}
                <div className="bg-slate-50 rounded-3xl p-8 mb-10 border border-slate-100">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <MessageSquare size={20} className="text-brand-green" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Status Notifikasi WhatsApp</span>
                  </div>
                  
                  {waStatus === 'sending' ? (
                    <div className="flex items-center justify-center gap-3 text-brand-navy font-bold">
                      <Loader2 size={20} className="animate-spin" /> Mengirim notifikasi otomatis...
                    </div>
                  ) : waStatus === 'sent' ? (
                    <div className="text-brand-green font-black text-sm uppercase">Pesan Otomatis Terkirim! ✅</div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500 font-bold italic">API Gateway belum aktif. Silakan kirim notifikasi secara manual untuk keperluan demo:</p>
                      <button 
                        onClick={handleManualWA}
                        className="w-full flex items-center justify-center gap-3 bg-brand-green text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
                      >
                        <ExternalLink size={18} /> Kirim Notifikasi (Manual)
                      </button>
                    </div>
                  )}
                </div>

                <button 
                    onClick={() => setView('form')} 
                    className="bg-[#00339a] text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-red transition-all shadow-xl active:scale-95"
                >
                    Kembali Ke Beranda
                </button>
              </div>
            ) : (role === UserRole.TAMU || (role === UserRole.SEKURITI && view === 'form' && isSecurityLoggedIn)) ? (
              <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-[#00339a] px-12 py-8 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase">Pendaftaran Tamu</h2>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Sistem Informasi Digital KKT</p>
                  </div>
                  <div className="bg-white/10 px-5 py-2.5 rounded-xl border border-white/20 hidden sm:block">
                     <span className="text-[11px] text-white font-black tracking-widest uppercase italic">SI-TAMU KKT</span>
                  </div>
                </div>
                <GuestForm onSubmit={handleAddGuest} role={role} />
              </div>
            ) : (role === UserRole.SEKURITI && isSecurityLoggedIn) ? (
              <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
                <GuestList guests={guests} onCheckout={handleCheckout} role={role} onAddGuest={() => setView('form')} />
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <footer className="py-12 text-center border-t border-slate-200 bg-white mt-auto">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center px-6 gap-4">
            <p className="text-[11px] font-black text-[#00339a] uppercase tracking-[0.4em]">
              &copy; {new Date().getFullYear()} KALTIM KARIANGAU TERMINAL
            </p>
            <div className="flex items-center gap-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digitalized by ICT KKT</span>
            </div>
        </div>
      </footer>
      
      {isSecurityLoggedIn && (
        <NotificationCenter notifications={notifications} guests={guests} onClear={() => setNotifications([])} onAction={handleUpdateStatus} />
      )}
    </div>
  );
};

export default App;
