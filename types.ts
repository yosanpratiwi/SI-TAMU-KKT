
export enum GuestStatus {
  PENDING = 'PENDING',
  DIIZINKAN = 'DIIZINKAN',
  DITOLAK = 'DITOLAK',
  CATATAN = 'CATATAN',
  LOGGED = 'LOGGED'
}

export enum UserRole {
  SEKURITI = 'SEKURITI',
  TAMU = 'TAMU'
}

export enum VisitType {
  STANDARD = 'STANDARD',
  MAINTENANCE = 'MAINTENANCE'
}

export interface GuestEntry {
  id: string;
  tanggal: string;
  visitType: VisitType;
  namaLengkap: string;
  asalInstansi: string; // Optional
  keperluan: string;
  nomorHp: string;
  nomorKtp: string;
  
  // Photo data (Base64)
  fotoTamu?: string;
  fotoKTP?: string;

  // Destination Info (Internal)
  tujuan: string;
  divisi: string; // Department of the visited person
  penanggungJawab: string;
  nomorHpPJ: string;
  
  // Maintenance Fields
  deskripsiPekerjaan?: string;
  lokasiPekerjaan?: string;
  pemesanInternal?: string;
  
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
