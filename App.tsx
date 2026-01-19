import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, GuestEntry, GuestStatus, Notification, VisitType } from './types';
import Header from './components/Header';
import GuestForm from './components/GuestForm';
import GuestList from './components/GuestList';
import NotificationCenter from './components/NotificationCenter';
import SecurityLogin from './components/SecurityLogin';
import SecurityMenu from './components/SecurityMenu';
import StaffApprovalView from './components/StaffApprovalView';
import StaffDashboard from './components/StaffDashboard';
import { sendWAAuto, generateGuestMessage, getManualWALink } from './services/whatsapp';
import { ShieldAlert, ClipboardList, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

const DAFTAR_PETUGAS = [
  { username: 'admin', password: 'admin123' },
  { username: 'sekuriti', password: '123' }
];

const App: React.FC = () => {
  const [isSecurityLoggedIn, setIsSecurityLoggedIn] = useState(() => {
    return sessionStorage.getItem('kkt_security_auth') === 'true';
  });

  const [role, setRole] = useState<UserRole>(() => {
    const auth = sessionStorage.getItem('kkt_security_auth') === 'true';
    return auth ? UserRole.SEKURITI : UserRole.TAMU;
  });

  const [view, setView] = useState<'form' | 'list' | 'success' | 'approval' | 'staff_dashboard'>(() => {
    const auth = sessionStorage.getItem('kkt_security_auth') === 'true';
    return auth ? 'list' : 'form';
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [guests, setGuests] = useState<GuestEntry[]>(() => {
    const saved = localStorage.getItem('kkt_guests_v4');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedGuestForApproval, setSelectedGuestForApproval] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const approvalId = urlParams.get('approval');
    if (approvalId) {
      setSelectedGuestForApproval(approvalId);
      setView('approval');
      setRole(UserRole.STAF);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kkt_guests_v4', JSON.stringify(guests));
  }, [guests]);

  const toggleRole = () => {
    if (role === UserRole.TAMU) {
      setRole(UserRole.SEKURITI);
      if (!isSecurityLoggedIn) {
        setShowLoginModal(true);
      } else {
        setView('list');
      }
    } else if (role === UserRole.SEKURITI) {
      setRole(UserRole.STAF);
      setView('staff_dashboard');
    } else {
      setRole(UserRole.TAMU);
      setView('form');
    }
  };

  const handleSecurityLogin = (username: string, password: string) => {
    const userFound = DAFTAR_PETUGAS.find(u => u.username === username && u.password === password);
    if (userFound) { 
      setIsSecurityLoggedIn(true);
      sessionStorage.setItem('kkt_security_auth', 'true');
      setRole(UserRole.SEKURITI);
      setShowLoginModal(false);
      setView('list');
    } else {
      alert('ID atau Password salah!');
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
    const message = generateGuestMessage(entry);

    const result = await sendWAAuto(entry.nomorHpPJ, message);
    if (!result.success) {
      const waLink = getManualWALink(entry.nomorHpPJ, message);
      window.open(waLink, '_blank');
    }

    if (isSecurityLoggedIn) {
      setView('list');
    } else {
      setView('success');
    }
  }, [isSecurityLoggedIn]);

  const handleCheckout = useCallback((id: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setGuests(prev => prev.map(g => g.id === id ? { ...g, jamKeluar: timeStr } : g));
  }, []);

  const handleDeleteGuest = (id: string) => {
    setGuests(prev => prev.filter(g => g.id !== id));
  };

  const handleStaffAction = (guestId: string, status: GuestStatus, catatan: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const updated = guests.map(g => {
      if (g.id === guestId) {
        // Jika ditolak, otomatis jamKeluar terisi
        return { 
          ...g, 
          status, 
          catatan,
          jamKeluar: status === GuestStatus.DITOLAK ? timeStr : g.jamKeluar 
        };
      }
      return g;
    });
    
    setGuests(updated);
    
    if (view === 'approval') {
      alert(`Berhasil: Tamu telah ${status === GuestStatus.DIIZINKAN ? 'DISETUJUI' : 'DITOLAK'}`);
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
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 items-start justify-center">
          
          {role === UserRole.SEKURITI && isSecurityLoggedIn && (view === 'form' || view === 'list') && (
            <div className="w-full lg:w-auto sticky top-32 z-30">
              <SecurityMenu 
                activeView={view as 'form' | 'list'} 
                onSelect={(v) => setView(v)} 
              />
            </div>
          )}

          <div className="w-full">
            {view === 'approval' && selectedGuestForApproval ? (
              <StaffApprovalView 
                guest={guests.find(g => g.id === selectedGuestForApproval)} 
                onAction={handleStaffAction} 
              />
            ) : view === 'staff_dashboard' ? (
               <StaffDashboard guests={guests} notifications={notifications} onAction={handleStaffAction} />
            ) : view === 'success' ? (
              <div className="bg-white rounded-[2rem] shadow-2xl p-10 text-center max-w-2xl mx-auto border border-slate-100 relative">
                <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600">
                   <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black text-brand-navy mb-10 italic uppercase tracking-tight">REGISTRASI BERHASIL</h2>
                <button onClick={() => setView('form')} className="w-full btn-brand-gradient text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4">
                    KEMBALI KE BERANDA <ArrowRight size={18} />
                </button>
              </div>
            ) : (role === UserRole.TAMU || (role === UserRole.SEKURITI && isSecurityLoggedIn && view === 'form')) ? (
              <div className="bg-white rounded-3xl md:rounded-[4rem] shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-brand-navy px-8 py-10 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6">
                     <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                        <ClipboardList size={32} />
                     </div>
                     <div>
                        <h2 className="text-2xl font-[900] tracking-widest uppercase italic">REGISTRATION</h2>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.5em] mt-1">Lobby Gate 01 - KKT</p>
                     </div>
                  </div>
                </div>
                <GuestForm onSubmit={handleAddGuest} role={role} />
              </div>
            ) : (role === UserRole.SEKURITI && isSecurityLoggedIn && view === 'list') ? (
              <div className="bg-white rounded-3xl md:rounded-[4rem] shadow-2xl overflow-hidden border border-slate-100">
                <GuestList 
                  guests={guests} 
                  onCheckout={handleCheckout} 
                  onDelete={handleDeleteGuest}
                  role={role} 
                />
              </div>
            ) : role === UserRole.SEKURITI && !isSecurityLoggedIn && !showLoginModal ? (
              <div className="flex flex-col items-center justify-center py-20 w-full">
                 <ShieldAlert size={64} className="text-brand-red mb-6" />
                 <button onClick={() => setShowLoginModal(true)} className="btn-brand-gradient text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em]">LOGIN PETUGAS</button>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <footer className="py-8 text-center bg-white border-t border-slate-100">
        <p className="text-[10px] font-bold text-brand-navy uppercase tracking-[0.2em]">&copy; 2026 PT KALTIM KARIANGAU TERMINAL</p>
      </footer>

      {role === UserRole.STAF && view === 'staff_dashboard' && (
        <NotificationCenter notifications={notifications} guests={guests} onClear={() => setNotifications([])} onAction={handleStaffAction} />
      )}
    </div>
  );
};

export default App;