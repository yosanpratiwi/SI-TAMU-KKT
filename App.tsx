
import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, GuestEntry, GuestStatus, Notification, VisitType } from './types';
import Header from './components/Header';
import GuestForm from './components/GuestForm';
import GuestList from './components/GuestList';
import NotificationCenter from './components/NotificationCenter';
import SecurityLogin from './components/SecurityLogin';
import StaffApprovalView from './components/StaffApprovalView';
import { sendWAAuto, generateGuestMessage, getManualWALink } from './services/whatsapp';
import { ShieldAlert, ClipboardList, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

const DAFTAR_PETUGAS = [
  { username: 'admin', password: 'admin123' },
  { username: 'sekuriti', password: '123' }
];

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.TAMU);
  const [isSecurityLoggedIn, setIsSecurityLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [guests, setGuests] = useState<GuestEntry[]>(() => {
    const saved = localStorage.getItem('kkt_guests_v4');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [view, setView] = useState<'form' | 'list' | 'success' | 'approval'>('form');
  const [selectedGuestForApproval, setSelectedGuestForApproval] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. SINKRONISASI REAL-TIME ANTAR TAB (LocalStorage Event)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kkt_guests_v4' && e.newValue) {
        setGuests(JSON.parse(e.newValue));
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 2000);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Polling ringan setiap 5 detik untuk mensimulasikan update status staf
    const interval = setInterval(() => {
      const latest = localStorage.getItem('kkt_guests_v4');
      if (latest) {
        const parsed = JSON.parse(latest);
        if (JSON.stringify(parsed) !== JSON.stringify(guests)) {
          setGuests(parsed);
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [guests]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const approvalId = urlParams.get('approval');
    if (approvalId) {
      setSelectedGuestForApproval(approvalId);
      setView('approval');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kkt_guests_v4', JSON.stringify(guests));
  }, [guests]);

  const toggleRole = () => {
    if (role === UserRole.TAMU) {
      setRole(UserRole.SEKURITI);
      setShowLoginModal(true);
    } else {
      setRole(UserRole.TAMU);
      setIsSecurityLoggedIn(false);
      setShowLoginModal(false);
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
      alert('Kredensial tidak valid!');
    }
  };

  const handleAddGuest = useCallback(async (newEntry: Omit<GuestEntry, 'id' | 'jamKeluar' | 'status'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const entry: GuestEntry = { 
      ...newEntry, 
      id, 
      jamKeluar: null, 
      status: GuestStatus.PENDING 
    };

    setGuests(prev => [entry, ...prev]);
    setView('success');

    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      guestId: id,
      message: `${entry.namaLengkap} sedang menunggu konfirmasi Anda.`,
      timestamp: new Date(),
      isActioned: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    const message = generateGuestMessage({
      id: entry.id,
      namaLengkap: entry.namaLengkap,
      asalInstansi: entry.asalInstansi,
      penanggungJawab: entry.penanggungJawab,
      keperluan: entry.keperluan,
      isGroup: entry.isGroup,
      memberCount: entry.groupMembers.length
    });

    const result = await sendWAAuto(entry.nomorHpPJ, message);
    if (!result.success) {
      console.log("Auto-WA Gagal, link manual:", getManualWALink(entry.nomorHpPJ, message));
    }
  }, []);

  const handleCheckout = useCallback((id: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setGuests(prev => prev.map(g => g.id === id ? { ...g, jamKeluar: timeStr } : g));
  }, []);

  const handleStaffAction = (guestId: string, status: GuestStatus, catatan: string) => {
    // Ambil data terbaru dari localStorage dulu untuk menghindari race condition
    const latestRaw = localStorage.getItem('kkt_guests_v4');
    const latestData: GuestEntry[] = latestRaw ? JSON.parse(latestRaw) : guests;
    
    const updated = latestData.map(g => g.id === guestId ? { ...g, status, catatan } : g);
    setGuests(updated);
    localStorage.setItem('kkt_guests_v4', JSON.stringify(updated));
    
    setNotifications(prev => prev.map(n => n.guestId === guestId ? { ...n, isActioned: true } : n));
    
    if (view === 'approval') {
      alert(`Status kunjungan telah diperbarui menjadi: ${status}`);
      window.location.href = window.location.origin + window.location.pathname;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-brand-navy selection:text-white">
      <Header role={role} onToggleRole={toggleRole} />
      
      {showLoginModal && (
        <SecurityLogin onLogin={handleSecurityLogin} onCancel={() => { setShowLoginModal(false); setRole(UserRole.TAMU); }} />
      )}

      <main className="flex-grow flex flex-col items-center justify-start py-6 md:py-12 px-4 md:px-6">
        <div className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* Real-time Indicator for Security */}
          {isSecurityLoggedIn && (
            <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${isSyncing ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
              <div className="bg-brand-navy text-white px-6 py-2 rounded-full shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-md">
                <RefreshCw size={14} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Syncing Data...</span>
              </div>
            </div>
          )}

          {view === 'approval' && selectedGuestForApproval ? (
            <StaffApprovalView 
              guest={guests.find(g => g.id === selectedGuestForApproval)} 
              onAction={handleStaffAction} 
            />
          ) : view === 'success' ? (
            <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-2xl p-10 md:p-16 text-center max-w-2xl mx-auto border border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-3 bg-brand-green"></div>
              <div className="bg-emerald-50 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600 shadow-inner">
                 <CheckCircle2 size={40} className="md:w-12 md:h-12" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-brand-navy mb-4 italic tracking-tight uppercase">REGISTRASI SELESAI</h2>
              <p className="text-slate-500 font-bold mb-10 px-4 md:px-8 italic">Pesan konfirmasi telah dikirimkan secara otomatis ke WhatsApp Staf yang dituju. Silakan tunggu konfirmasi di area Lobby.</p>
              
              <button onClick={() => setView('form')} className="w-full btn-brand-gradient text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 transition-all">
                  KEMBALI KE BERANDA <ArrowRight size={18} />
              </button>
            </div>
          ) : (role === UserRole.TAMU || (role === UserRole.SEKURITI && isSecurityLoggedIn && view === 'form')) ? (
            <div className="bg-white rounded-3xl md:rounded-[4rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-700">
              <div className="bg-brand-navy px-8 md:px-12 py-10 md:py-12 text-white flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10 flex items-center gap-6 md:gap-8">
                   <div className="p-4 md:p-5 bg-white/10 rounded-2xl md:rounded-3xl backdrop-blur-md border border-white/20">
                      <ClipboardList size={32} className="md:w-10 md:h-10 text-white" />
                   </div>
                   <div>
                      <h2 className="text-2xl md:text-3xl font-[900] tracking-widest uppercase italic leading-tight">REGISTRATION</h2>
                      <p className="text-white/50 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.5em] mt-1 md:mt-2">Kaltim Kariangau Terminal</p>
                   </div>
                </div>
                <div className="relative z-10 hidden lg:flex items-center gap-4 bg-white/5 px-8 py-5 rounded-[2rem] border border-white/10 backdrop-blur-md">
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Operation Center</p>
                      <p className="text-sm font-bold text-white">Lobby Gate 01</p>
                    </div>
                    <ShieldCheck size={28} className="text-emerald-400" />
                </div>
              </div>
              <GuestForm onSubmit={handleAddGuest} role={role} />
            </div>
          ) : (role === UserRole.SEKURITI && isSecurityLoggedIn) ? (
            <div className="bg-white rounded-3xl md:rounded-[4rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-slate-100">
              <GuestList guests={guests} onCheckout={handleCheckout} role={role} onAddGuest={() => setView('form')} />
            </div>
          ) : role === UserRole.SEKURITI && !isSecurityLoggedIn && !showLoginModal ? (
            <div className="flex flex-col items-center justify-center py-10 md:py-20">
              <div className="bg-white p-10 md:p-16 rounded-3xl md:rounded-[4rem] shadow-2xl border border-slate-100 max-w-lg text-center mx-4">
                <div className="bg-red-50 w-20 h-20 md:w-24 md:h-24 rounded-3xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-6 md:mb-8 text-brand-red">
                   <ShieldAlert size={40} className="md:w-12 md:h-12" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-brand-navy mb-4 tracking-tighter uppercase">Akses Terbatas</h3>
                <p className="text-slate-500 font-bold mb-10 leading-relaxed text-sm md:text-base">Dashboard pemantauan tamu hanya dapat diakses oleh petugas keamanan resmi KKT.</p>
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="w-full btn-brand-gradient text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all"
                >
                  LOGIN PETUGAS
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <footer className="py-8 md:py-12 text-center bg-white border-t border-slate-100 px-6">
        <div className="flex items-center justify-center gap-3 mb-4 opacity-30 grayscale">
            <div className="h-0.5 w-8 md:w-12 bg-slate-900"></div>
            <div className="h-2 w-2 bg-slate-900 rounded-full"></div>
            <div className="h-0.5 w-8 md:w-12 bg-slate-900"></div>
        </div>
        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.6em] mb-1">DIGITALISASI SISTEM BUKU TAMU</p>
        <p className="text-[10px] md:text-[11px] font-bold text-brand-navy uppercase tracking-[0.2em]">&copy; 2026 PT KALTIM KARIANGAU TERMINAL</p>
      </footer>

      {isSecurityLoggedIn && role === UserRole.SEKURITI && (
        <NotificationCenter notifications={notifications} guests={guests} onClear={() => setNotifications([])} onAction={handleStaffAction} />
      )}
    </div>
  );
};

export default App;
