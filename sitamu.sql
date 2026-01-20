-- 1. Hapus tabel lama jika ada (agar bersih)
DROP TABLE IF EXISTS anggota_rombongan CASCADE;
DROP TABLE IF EXISTS kunjungan CASCADE;
DROP TABLE IF EXISTS tamu CASCADE;
DROP TABLE IF EXISTS petugas CASCADE;

-- 2. Buat ulang dengan struktur paling lengkap sesuai gambar
CREATE TABLE petugas (
    id_petugas SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama_petugas VARCHAR(100)
);

CREATE TABLE tamu (
    id_tamu SERIAL PRIMARY KEY,
    nama_lengkap VARCHAR(150) NOT NULL,
    asal_instansi VARCHAR(150),
    nomor_hp VARCHAR(20),
    nik CHAR(16),
    foto_wajah TEXT, 
    foto_ktp TEXT,
    tipe_tamu VARCHAR(20), 
    kategori_kunjungan VARCHAR(20) 
);

CREATE TABLE kunjungan (
    id_kunjungan SERIAL PRIMARY KEY,
    id_tamu INT REFERENCES tamu(id_tamu) ON DELETE CASCADE,
    pegawai_dituju VARCHAR(150) NOT NULL,
    divisi_unit VARCHAR(100),
    wa_pegawai VARCHAR(20),
    keperluan_kunjungan TEXT,
    lokasi_pekerjaan VARCHAR(200), 
    deskripsi_pekerjaan TEXT,      
    dokumen_k3 TEXT,               
    waktu_datang TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    waktu_keluar TIMESTAMP,
    status_konfirmasi VARCHAR(50) DEFAULT 'MENUNGGU KONFIRMASI',
    catatan_staf TEXT
);

CREATE TABLE anggota_rombongan (
    id_anggota SERIAL PRIMARY KEY,
    id_kunjungan INT REFERENCES kunjungan(id_kunjungan) ON DELETE CASCADE,
    nama_anggota VARCHAR(150) NOT NULL
);

-- 3. Isi data admin pertama agar bisa login
INSERT INTO petugas (username, password, nama_petugas) 
VALUES ('admin', '123', 'Security KKT');