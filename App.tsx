
import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, GuestEntry, GuestStatus } from './types';
import Header from './components/Header';
import GuestForm from './components/GuestForm';
import GuestList from './components/GuestList';
import SecurityLogin from './components/SecurityLogin';
import SecurityMenu from './components/SecurityMenu';
import StaffApprovalView from './components/StaffApprovalView';
import StaffDashboard from './components/StaffDashboard';
import QRCodeModal from './components/QRCodeModal';
import { generateGuestMessage } from './services/whatsapp';
import { ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

const API_URL = `http://${window.location.hostname}:3002/api`;

const App: React.FC = () => {
  const [isSecurityLoggedIn, setIsSecurityLoggedIn] = useState(() => sessionStorage.getItem('kkt_security_auth') === 'true');
  const [role, setRole] = useState<UserRole>(isSecurityLoggedIn ? UserRole.SEKURITI : UserRole.TAMU);
  const [view, setView] = useState<'form' | 'list' | 'success' | 'approval' | 'staff_dashboard' | 'qr'>(isSecurityLoggedIn ? 'list' : 'form');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [guests, setGuests] = useState<GuestEntry[]>([]);
  const [isBackendDown, setIsBackendDown] = useState(false);

  const loadGuests = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/guests`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGuests(data);
      setIsBackendDown(false);
    } catch (err) {
      setIsBackendDown(true);
    }
  }, []);

  useEffect(() => {
    loadGuests();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('approval')) {
      setView('approval');
      setRole(UserRole.STAF);
    }
  }, [loadGuests]);

  const handleSecurityLogin = (username: string, password: string) => {
    if ((username === 'admin' || username === 'sekuriti') && password === '123') { 
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
    const entry: GuestEntry = { ...newEntry, id, jamKeluar: null, status: GuestStatus.PENDING };
    const message = generateGuestMessage(entry);

    try {
      const response = await fetch(`${API_URL}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...entry,
          waPayload: { target: entry.nomorHpPJ, message: message }
        })
      });
      if (response.ok) {
        setGuests(prev => [entry, ...prev]);
        if (role === UserRole.TAMU) setView('success');
        else setView('list');
      }
    } catch (error) {
      alert("Error: Database Offline.");
    }
  }, [role]);

  const handleStaffAction = async (guestId: string, status: GuestStatus, catatan: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    try {
      const res = await fetch(`${API_URL}/guests/${guestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, catatan, jamKeluar: status === GuestStatus.DITOLAK ? timeStr : null })
      });
      if (res.ok) {
        setGuests(prev => prev.map(g => g.id === guestId ? { ...g, status, catatan, jamKeluar: status === GuestStatus.DITOLAK ? timeStr : g.jamKeluar } : g));
      }
    } catch (error) {}
  };

  const handleCheckout = useCallback(async (id: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    try {
      await fetch(`${API_URL}/guests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jamKeluar: timeStr })
      });
      setGuests(prev => prev.map(g => g.id === id ? { ...g, jamKeluar: timeStr } : g));
    } catch (err) {}
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header role={role} onToggleRole={() => {
        if (role === UserRole.TAMU) { setRole(UserRole.SEKURITI); if(!isSecurityLoggedIn) setShowLoginModal(true); else setView('list'); }
        else if (role === UserRole.SEKURITI) { setRole(UserRole.STAF); setView('staff_dashboard'); }
        else { setRole(UserRole.TAMU); setView('form'); }
      }} />
      
      {showLoginModal && <SecurityLogin onLogin={handleSecurityLogin} onCancel={() => { setShowLoginModal(false); setRole(UserRole.TAMU); }} />}

      {/* HORIZONTAL DASHBOARD NAVIGATION (PC & MOBILE) */}
      {role === UserRole.SEKURITI && isSecurityLoggedIn && (
        <SecurityMenu activeView={view === 'qr' ? 'qr' : (view as 'form' | 'list')} onSelect={(v) => setView(v)} />
      )}

      <main className="flex-grow flex flex-col">
        <div className="w-full h-full max-w-full mx-auto px-4 md:px-12 py-6">
          {isBackendDown && (
            <div className="bg-brand-red/10 text-brand-red p-4 rounded-2xl mb-6 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest border border-brand-red/20">
              <AlertTriangle size={18} /> BACKEND OFFLINE
            </div>
          )}

          {view === 'approval' ? (
            <StaffApprovalView guest={guests.find(g => g.id === new URLSearchParams(window.location.search).get('approval') || '')} onAction={handleStaffAction} />
          ) : view === 'staff_dashboard' ? (
             <StaffDashboard guests={guests} notifications={[]} onAction={handleStaffAction} />
          ) : view === 'qr' ? (
             <QRCodeModal onClose={() => setView('list')} />
          ) : view === 'success' ? (
            <div className="bg-white rounded-[3rem] shadow-2xl p-12 md:p-24 text-center max-w-3xl mx-auto mt-10">
              <div className="bg-brand-green w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 text-white shadow-xl">
                 <UserCheck size={48} />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-brand-navy mb-8 italic uppercase">BERHASIL TERDAFTAR</h2>
              <button onClick={() => setView('form')} className="bg-brand-navy text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 mx-auto">
                KEMBALI <ArrowRight size={20} />
              </button>
            </div>
          ) : (view === 'form') ? (
            <div className="max-w-5xl mx-auto w-full">
              <GuestForm onSubmit={handleAddGuest} role={role} />
            </div>
          ) : (view === 'list') ? (
            <div className="w-full bg-white rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <GuestList 
                guests={guests} 
                onCheckout={handleCheckout} 
                onDelete={(id) => setGuests(prev => prev.filter(g => g.id !== id))} 
                role={role}
              />
            </div>
          ) : null}
        </div>
      </main>

      <footer className="py-6 text-center bg-white border-t border-slate-100 mt-auto">
        <p className="text-[10px] font-black text-brand-navy uppercase tracking-widest italic">&copy; PT KALTIM KARIANGAU TERMINAL 2026</p>
      </footer>
    </div>
  );
};

export default App;