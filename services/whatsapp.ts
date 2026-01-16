const WHATSAPP_API_TOKEN = 'HUd8BtzQ8ZpBYnZKeNSC'; 

export const sendWAAuto = async (phone: string, message: string) => {
  if (!WHATSAPP_API_TOKEN || WHATSAPP_API_TOKEN === 'HUd8BtzQ8ZpBYnZKeNSC') {
    return { success: false, message: "API Token belum dikonfigurasi" };
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

// Membuat template pesan WhatsApp profesional dengan link approval

export const generateGuestMessage = (guest: {
  id: string,
  namaLengkap: string, 
  asalInstansi: string, 
  penanggungJawab: string, 
  keperluan: string,
  isGroup: boolean,
  memberCount: number
}) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Deteksi URL saat ini untuk membuat link approval dinamis
  const baseUrl = window.location.origin + window.location.pathname;
  const approvalLink = `${baseUrl}?approval=${guest.id}`;
  
  const groupText = guest.isGroup ? `\n👥 *Tipe:* Rombongan (${guest.memberCount} Orang)` : `\n👤 *Tipe:* Individu`;
  
  return `*NOTIFIKASI TAMU KKT* 
-----------------------------------
Halo Bapak/Ibu *${guest.penanggungJawab}*,
Ada tamu di Lobby Gate 01 ingin menemui Anda:

*Nama:* ${guest.namaLengkap} ${groupText}
*Instansi:* ${guest.asalInstansi || 'Pribadi/Undangan'}
*Keperluan:* ${guest.keperluan}
*Jam Masuk:* ${timeStr} WITA

Silakan berikan instruksi (SETUJU/TOLAK) melalui link sistem di bawah ini:
🔗 ${approvalLink}

_Mohon segera memberikan konfirmasi. Terimakasih._
-----------------------------------
_SI-TAMU Kaltim Kariangau Terminal_`;
};
