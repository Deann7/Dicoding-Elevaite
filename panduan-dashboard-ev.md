# Panduan Dashboard EV Battery Monitoring (Elevaite Volt-Guard)

## 🎯 Tujuan Dashboard
Dashboard **Elevaite Volt-Guard** dirancang sebagai sistem pemantauan inventaris baterai *Electric Vehicle* (EV) tingkat industri dan otomasi alur kerja *Quality Assurance* (QA). Tujuan utamanya meliputi:
- **Pemantauan Keamanan Real-time (Telemetry):** Melacak metrik kritis baterai secara langsung (seperti suhu dan kelembaban) untuk mencegah risiko berbahaya seperti *Thermal Runaway*.
- **Otomasi Rilis QA dengan AI:** Menggantikan proses persetujuan kelayakan baterai yang manual dengan memanfaatkan teknologi **AI Scanner (Azure Document Intelligence)**. Sistem ini secara otomatis mengekstrak data tulisan/ketikan dari dokumen lab.
- **Manajemen Karantina Otomatis:** Secara proaktif mengkarantina (On Hold) atau menolak (Reject) batch baterai yang terdeteksi memiliki metrik anomali (misalnya suhu melebihi 35°C), menjaga integritas standar keamanan perakitan.

---

## ⚙️ Cara Kerja Dashboard
Dashboard ini menggabungkan data sensor (IoT) dan pemrosesan dokumen berbasis AI dalam satu alur yang terpusat:
1. **Penerimaan Baterai (Pending QA):** Baterai baru dari vendor (seperti LG Chem, CATL, dll.) didaftarkan ke sistem dan otomatis berada dalam status **Pending QA** (menunggu pengecekan fisik lab).
2. **Pengawasan Anomali Fisik:** Sistem terus mengawasi suhu baterai di rak penyimpanan. Jika ada pallet dengan suhu abnormal, sistem akan memindahkannya ke **Critical Battery Watchlist** dan menyorotnya dengan warna merah/kuning.
3. **Inspeksi Manual & Tes Lab:** Petugas lab (QA Engineer) melakukan tes fisik terhadap baterai untuk mendapatkan metrik *Voltage* (Tegangan) dan *Impedance* (Hambatan), kemudian mencatatnya di dokumen resmi.
4. **Pemindaian Dokumen AI (Auto-Release):** Dokumen hasil tes tersebut diunggah ke sistem. AI akan membaca angka-angkanya secara otomatis. Jika angka *Voltage* dan *Impedance* sesuai standar aman, sistem langsung merilis status pallet dari "Pending QA" menjadi siap pakai.

---

## 📦 Cara Menambahkan Pallet (dan Menyelesaikan QA)
Untuk memproses dan mendaftarkan/merilis pallet baterai yang baru masuk, pengguna dapat mengikuti alur *Scanner* berikut:

### Langkah 1: Unduh Template Resmi
Di halaman utama Dashboard bagian pojok kanan atas, klik tombol **"QA Template (Docs)"**.  
*Sistem akan mengunduh file MS Word (`EV_Battery_QA_Template.doc`) yang berisi format standar tabel QA dari Elevaite.*

### Langkah 2: Isi Data Inspeksi Pallet
Buka dokumen yang sudah diunduh. Untuk pallet yang baru, isi tabel dengan data inspeksi yang relevan:
- **Pallet ID:** Masukkan kode identitas pallet (contoh: `B-112`).
- **Batch Vendor:** Nama penyuplai (contoh: `Panasonic`).
- **Avg Voltage (V):** Hasil tegangan rata-rata (contoh: `4.18`).
- **Impedance (mΩ):** Hasil hambatan internal (contoh: `1.2`).
*(Catatan: Anda dapat mencetak dokumen ini untuk diisi manual dengan pena, atau diisi langsung melalui komputer, AI sistem mampu membaca keduanya).*

### Langkah 3: Lakukan Pemindaian (Scan)
Kembali ke halaman Dashboard dan klik tombol hitam **"New QA Scan"**. Anda akan diarahkan ke antarmuka AI Scanner.
- Unggah file dokumen yang sudah diisi (bisa berupa hasil scan PDF, foto, atau dokumen digital).
- Sistem pemindai akan memulai ekstraksi data.

### Langkah 4: Validasi dan Auto-Release
- Di belakang layar, AI akan mengekstrak informasi **Pallet ID**, **Voltage**, dan **Impedance**.
- AI mencocokkan data tersebut ke *database*.
- Jika metrik aman dan dikonfirmasi tingkat kepercayaan (*confidence level*) AI tinggi, pallet tersebut akan otomatis **ditambahkan / diperbarui** di sistem dengan status **Released** (Selesai).
- Riwayat persetujuan dokumen ini dapat Anda pantau langsung di kotak **"Recent QA Scans"** pada halaman utama Dashboard.
