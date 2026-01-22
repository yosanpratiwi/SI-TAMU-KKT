import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UserRole, GuestEntry, GuestStatus, Notification } from './types';
import Header from './components/Header';
import GuestForm from './components/GuestForm';
import GuestList from './components/GuestList';
import SecurityLogin from './components/SecurityLogin';
import SecurityMenu from './components/SecurityMenu';
import StaffApprovalView from './components/StaffApprovalView';
import StaffDashboard from './components/StaffDashboard';
import QRCodeModal from './components/QRCodeModal';
import NotificationCenter from './components/NotificationCenter';
import { generateGuestMessage, getManualWALink } from './services/whatsapp';
import { ArrowRight, UserCheck, AlertTriangle, MessageCircle, AlertCircle } from 'lucide-react';

// DETEKSI ALAMAT API DINAMIS
const getApiUrl = () => {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:3002/api';
  }
  // Jika diakses lewat HP / Internet, arahkan ke host yang sama tapi port backend 3002
  return `http://${host}:3002/api`;
};

const API_URL = getApiUrl();

const App: React.FC = () => {
  const [isSecurityLoggedIn, setIsSecurityLoggedIn] = useState(() => sessionStorage.getItem('kkt_security_auth') === 'true');
  const [role, setRole] = useState<UserRole>(isSecurityLoggedIn ? UserRole.SEKURITI : UserRole.TAMU);
  const [view, setView] = useState<'form' | 'list' | 'success' | 'approval' | 'staff_dashboard' | 'qr'>(isSecurityLoggedIn ? 'list' : 'form');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [guests, setGuests] = useState<GuestEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isBackendDown, setIsBackendDown] = useState(false);
  const [waBackup, setWaBackup] = useState<{phone: string, message: string} | null>(null);
  
  const lastGuestIdRef = useRef<string | null>(null);

  const loadGuests = useCallback(async (isSilent = false) => {
    try {
      const res = await fetch(`${API_URL}/guests`);
      if (!res.ok) throw new Error();
      const data: GuestEntry[] = await res.json();
      
      if (data.length > 0 && lastGuestIdRef.current && data[0].id !== lastGuestIdRef.current) {
        const newGuest = data[0];
        if (newGuest.status === GuestStatus.PENDING) {
          const newNotif: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            guestId: newGuest.id,
            message: `Tamu baru: ${newGuest.namaLengkap} ingin bertemu Bapak/Ibu ${newGuest.penanggungJawab}`,
            timestamp: new Date(),
            isActioned: false
          };
          setNotifications(prev => [newNotif, ...prev]);
          try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play(); } catch(e) {}
        }
      }
      
      if (data.length > 0) lastGuestIdRef.current = data[0].id;
      setGuests(data);
      setIsBackendDown(false);
    } catch (err) {
      if (!isSilent) setIsBackendDown(true);
    }
  }, []);

  useEffect(() => {
    loadGuests();
    const interval = setInterval(() => {
      loadGuests(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [loadGuests]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const approvalId = urlParams.get('approval');
    if (approvalId) {
      setView('approval');
      setRole(UserRole.STAF);
    }
  }, []);

  const handleSecurityLogin = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await response.json();
      if (result.success) {
        setIsSecurityLoggedIn(true);
        sessionStorage.setItem('kkt_security_auth', 'true');
        sessionStorage.setItem('kkt_user_profile', JSON.stringify(result.user));
        setRole(UserRole.SEKURITI);
        setShowLoginModal(false);
        setView('list');
      } else {
        alert(result.message || 'Login gagal!');
      }
    } catch (err) {
      alert('Koneksi ke server gagal.');
    }
  };

  const handleAddGuest = useCallback(async (newEntry: Omit<GuestEntry, 'id' | 'jamKeluar' | 'status'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const entry: GuestEntry = { ...newEntry, id, jamKeluar: null, status: GuestStatus.PENDING };
    const message = generateGuestMessage(entry);
    setWaBackup(null);

    try {
      const response = await fetch(`${API_URL}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...entry,
          waPayload: { target: entry.nomorHpPJ, message: message }
        })
      });
      const result = await response.json();
      
      if (result.success) {
        setGuests(prev => [entry, ...prev]);
        lastGuestIdRef.current = id;
        if (!result.waStatus) {
          setWaBackup({ phone: entry.nomorHpPJ, message: message });
        }
      }
      
      if (role === UserRole.TAMU) setView('success');
      else setView('list');
    } catch (error) {
      alert("Error: Backend bermasalah!");
    }
  }, [role]);

  const handleStaffAction = async (guestId: string, status: GuestStatus, catatan: string, notifId?: string) => {
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
        if (notifId) {
          setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isActioned: true } : n));
        }
        if (view === 'approval') {
          alert(`Konfirmasi Berhasil!`);
          window.location.href = window.location.origin + window.location.pathname;
        }
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
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-brand-navy selection:text-white">
      <Header role={role} onToggleRole={() => {
        if (role === UserRole.TAMU) { setRole(UserRole.SEKURITI); if(!isSecurityLoggedIn) setShowLoginModal(true); else setView('list'); }
        else if (role === UserRole.SEKURITI) { setRole(UserRole.STAF); setView('staff_dashboard'); }
        else { setRole(UserRole.TAMU); setView('form'); }
      }} />
      
      {showLoginModal && <SecurityLogin onLogin={handleSecurityLogin} onCancel={() => { setShowLoginModal(false); setRole(UserRole.TAMU); }} />}

      {(role === UserRole.STAF || role === UserRole.SEKURITI) && (
        <NotificationCenter 
          notifications={notifications} 
          guests={guests} 
          onClear={() => setNotifications([])} 
          onAction={handleStaffAction} 
        />
      )}

      {isBackendDown && (
        <div className="bg-brand-red text-white py-4 text-center text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-xl print:hidden">
          <AlertTriangle size={20} /> PERINGATAN: SERVER DATABASE OFFLINE!
        </div>
      )}

      <main className="flex-grow flex flex-col items-center justify-start py-12 md:py-20 px-4 md:px-8">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-12 items-start justify-center">
          {role === UserRole.SEKURITI && isSecurityLoggedIn && (view === 'form' || view === 'list' || view === 'qr') && (
            <div className="w-full lg:w-auto sticky top-40 z-30 print:hidden">
              <SecurityMenu activeView={view === 'qr' ? 'qr' : (view as 'form' | 'list')} onSelect={(v) => setView(v)} />
            </div>
          )}

          <div className="w-full">
            {view === 'approval' ? (
              <StaffApprovalView guest={guests.find(g => g.id === new URLSearchParams(window.location.search).get('approval') || '')} onAction={(gid, stat, cat) => handleStaffAction(gid, stat, cat)} />
            ) : view === 'staff_dashboard' ? (
               <StaffDashboard guests={guests} notifications={notifications} onAction={handleStaffAction} />
            ) : view === 'qr' ? (
               <QRCodeModal onClose={() => setView('list')} />
            ) : view === 'success' ? (
              <div className="bg-white rounded-[4rem] shadow-2xl p-16 md:p-28 text-center max-w-4xl mx-auto border-4 border-brand-green/20 relative overflow-hidden animate-in zoom-in duration-500">
                <div className="bg-brand-green w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-12 text-white shadow-[0_20px_50px_rgba(0,146,69,0.3)] animate-bounce">
                   <UserCheck size={80} />
                </div>
                <h2 className="text-5xl font-[900] text-brand-navy mb-14 italic uppercase tracking-tighter text-center leading-none">PENDAFTARAN BERHASIL</h2>
                <p className="text-slate-800 text-lg font-bold mb-14 max-w-2xl mx-auto leading-relaxed uppercase tracking-widest">
                  DATA TELAH TERSIMPAN. NOTIFIKASI OTOMATIS SEDANG DIKIRIM KE PEGAWAI.
                </p>
                
                {waBackup && role === UserRole.SEKURITI && (
                  <div className="mb-14 p-10 bg-amber-50 border-4 border-dashed border-amber-300 rounded-[3rem] animate-in slide-in-from-top duration-300">
                     <p className="text-[13px] font-black text-amber-700 uppercase tracking-widest mb-6 flex items-center justify-center gap-3">
                       <AlertCircle size={20} /> WHATSAPP OTOMATIS GAGAL
                     </p>
                     <button 
                        onClick={() => window.open(getManualWALink(waBackup.phone, waBackup.message), '_blank')}
                        className="w-full bg-emerald-600 text-white py-8 rounded-3xl font-[900] text-[14px] uppercase tracking-[0.4em] flex items-center justify-center gap-5 shadow-2xl hover:bg-emerald-700 transition-all active:scale-95"
                     >
                        <MessageCircle size={24} /> KIRIM WHATSAPP MANUAL
                     </button>
                  </div>
                )}

                <button onClick={() => { setView('form'); setWaBackup(null); }} className="w-full btn-brand-gradient text-white py-8 rounded-[2.5rem] font-[900] text-[14px] uppercase tracking-[0.5em] flex items-center justify-center gap-6 shadow-2xl">
                  KEMBALI KE BERANDA <ArrowRight size={28} />
                </button>
              </div>
            ) : (view === 'form') ? (
              <div className="bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,51,154,0.15)] overflow-hidden">
                <GuestForm onSubmit={handleAddGuest} role={role} />
              </div>
            ) : (view === 'list') ? (
              <div className="bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,51,154,0.15)] overflow-hidden">
                <GuestList 
                  guests={guests} 
                  onCheckout={handleCheckout} 
                  onDelete={(id) => setGuests(prev => prev.filter(g => g.id !== id))} 
                  role={role}
                  onResendNotification={(id) => {
                    const g = guests.find(guest => guest.id === id);
                    if (g) window.open(getManualWALink(g.nomorHpPJ, generateGuestMessage(g)), '_blank');
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <footer className="py-12 text-center bg-white border-t-2 border-slate-100 print:hidden">
        <p className="text-[12px] font-[900] text-brand-navy uppercase tracking-[0.4em] italic">&copy; PT KALTIM KARIANGAU TERMINAL 2026</p>
      </footer>
    </div>
  );
};

export default App;