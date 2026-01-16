
export enum GuestStatus {
  PENDING = 'PENDING',
  DIIZINKAN = 'DIIZINKAN',
  DITOLAK = 'DITOLAK',
  LOGGED = 'LOGGED'
}

export enum UserRole {
  SEKURITI = 'SEKURITI',
  TAMU = 'TAMU',
  STAF = 'STAF' // Role tambahan untuk simulasi persetujuan staf
}

export enum VisitType {
  STANDARD = 'STANDARD',
  VENDOR = 'VENDOR'
}

export interface GuestEntry {
  id: string;
  tanggal: string;
  visitType: VisitType;
  isGroup: boolean;
  groupMembers: string[]; 
  namaLengkap: string; 
  asalInstansi: string;
  keperluan: string;
  nomorHp: string;
  nomorKtp: string;
  
  // Photo & Documents
  fotoTamu?: string;
  fotoKTP?: string;
  k3Pdf?: string; 

  // Internal Destination
  tujuan: string;
  divisi: string;
  nomorHpPJ: string;
  penanggungJawab: string; // Staf internal KKT
  
  // Vendor specific
  deskripsiPekerjaan?: string;
  lokasiPekerjaan?: string;
  
  jamMasuk: string;
  jamKeluar: string | null;
  status: GuestStatus;
  catatan?: string;
  authorizedBy?: string;
}

export interface Notification {
  id: string;
  guestId: string;
  message: string;
  timestamp: Date;
  isActioned: boolean;
}
