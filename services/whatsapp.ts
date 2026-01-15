const WHATSAPP_API_TOKEN = 'HUd8BtzQ8ZpBYnZKeNSC';

export const sendWAAuto = async (phone: string, message: string) => {
  if (!WHATSAPP_API_TOKEN) {
    console.warn("WhatsApp API Token belum diisi. Pesan tidak terkirim otomatis.");
    return { success: false, message: "API Token kosong" };
  }

  let formattedPhone = phone.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.slice(1);
  }

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': WHATSAPP_API_TOKEN,
      },
      body: new URLSearchParams({
        'target': formattedPhone,
        'message': message,
        'countryCode': '62',
      })
    });

    const result = await response.json();
    return { success: result.status === true, data: result };
  } catch (error) {
    console.error("Gagal mengirim WhatsApp otomatis:", error);
    return { success: false, error };
  }
};

/**
 * Menghasilkan link wa.me untuk pengiriman manual 
 */
export const getManualWALink = (phone: string, message: string) => {
  let formattedPhone = phone.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.slice(1);
  }
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Fungsi untuk menghasilkan format pesan WhatsApp yang rapi
 */
export const generateGuestMessage = (guestName: string, instansi: string, tujuan: string, keperluan: string) => {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  return `*NOTIFIKASI TAMU BARU* 
*SI-TAMU KKT*

Halo Bapak/Ibu ${tujuan},
Tamu Anda telah tiba di Lobby dan sedang menunggu konfirmasi:

Nama: ${guestName}
Asal: ${instansi || 'Pribadi/Perorangan'}
Keperluan: ${keperluan}
Waktu: ${timeStr} WITA

Mohon kesediaannya untuk memberikan konfirmasi melalui petugas Sekuriti di Lobby.

Terima kasih.
_Pesan otomatis via SI-TAMU KKT_`;
};
