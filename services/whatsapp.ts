//WhatsApp Service KKT - Integrated with SI-TAMU Flow
import { GuestEntry } from '../types';

// PENTING: Untuk pengiriman OTOMATIS tanpa buka WA, isi token dari fonnte.com
const WHATSAPP_API_TOKEN = 'HUd8BtzQ8ZpBYnZKeNSC'; 

export const sendWAAuto = async (phone: string, message: string) => {
  if (!WHATSAPP_API_TOKEN) {
    return { success: false, message: "API Token kosong" };
  }

  let formattedPhone = phone.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.slice(1);
  }

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { 'Authorization': WHATSAPP_API_TOKEN },
      body: new URLSearchParams({
        'target': formattedPhone,
        'message': message,
        'countryCode': '62',
      })
    });
    const result = await response.json();
    return { success: result.status === true, data: result };
  } catch (error) {
    console.error("WA API Error:", error);
    return { success: false, error };
  }
};

export const getManualWALink = (phone: string, message: string) => {
  let formattedPhone = phone.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.slice(1);
  }
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

// Membuat template pesan WhatsApp sesuai tipe kunjungan (Individu/Rombongan)
export const generateGuestMessage = (guest: GuestEntry) => {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Deteksi URL untuk link approval
  const baseUrl = window.location.origin + window.location.pathname;
  const approvalLink = `${baseUrl}?approval=${guest.id}`;

  if (guest.isGroup) {
    // TEMPLATE ROMBONGAN
    const totalAnggota = guest.groupMembers?.length || 0;
    const totalOrang = 1 + totalAnggota;
    const daftarAnggota = guest.groupMembers?.join(', ') || '-';

    return `*NOTIFIKASI TAMU ROMBONGAN* 
SI-TAMU KKT

Halo Bapak/Ibu ${guest.penanggungJawab},
Tamu ROMBONGAN Anda telah tiba di Lobby (Total: ${totalOrang} Orang):

PJ Rombongan: ${guest.namaLengkap}
Anggota: ${daftarAnggota}
Asal: ${guest.asalInstansi || 'Pribadi'}
Keperluan: ${guest.keperluan}
Waktu: ${timeStr} WITA

Mohon kesediaannya untuk memberikan konfirmasi melalui link di bawah ini:
${approvalLink}

(Jika link tidak bisa diklik, mohon simpan nomor ini atau balas pesan ini terlebih dahulu)`;
  } else {
    // TEMPLATE INDIVIDU
    return `*NOTIFIKASI TAMU* 
SI-TAMU KKT

Halo Bapak/Ibu ${guest.penanggungJawab},
Tamu Anda telah tiba di Lobby:

Nama: ${guest.namaLengkap}
Asal: ${guest.asalInstansi || 'Pribadi'}
Keperluan: ${guest.keperluan}
Waktu: ${timeStr} WITA

Mohon kesediaannya untuk memberikan konfirmasi melalui link di bawah ini:
${approvalLink}

(Jika link tidak bisa diklik, mohon simpan nomor ini atau balas pesan ini terlebih dahulu)`;
  }
};