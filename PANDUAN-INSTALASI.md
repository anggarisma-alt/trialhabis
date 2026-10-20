# 📋 PANDUAN INSTALASI — Halaman Trial Berakhir

Arsitektur: **Frontend** (index.html, css/, js/) di **GitHub Pages** + **Backend** (Kode.gs) di **Google Apps Script** sebagai REST API. Harga, teks, dan nomor admin diedit lewat **Google Sheets**.

---

## BAGIAN A — Backend (Google Apps Script)

1. Buka https://script.google.com → **Proyek baru**.
2. Ganti nama file `Code.gs` menjadi `Kode`, lalu hapus isinya dan **paste seluruh isi `Kode.gs`**.
3. Jalankan `setupAppEnvironment()` — **HANYA SEKALI**:
   - Dropdown fungsi → pilih `setupAppEnvironment` → ▶ **Run**.
   - Klik **Review permissions** → izinkan akses Drive & Sheets.
   - Buka **Execution log**, pastikan muncul ✅ *Setup selesai*.
   - Cek Google Drive: folder 📁 *Halaman Trial Berakhir* sudah ada.
   - Cek Google Sheets: file 🗃️ *Database — Halaman Trial Berakhir* dengan sheet **AppConfig**.
   - ⚠️ Jangan jalankan lebih dari sekali (kalau terlanjur, fungsi akan menolak otomatis).
4. **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Klik **Deploy** → **salin URL yang berakhiran `/exec`**.
5. Tes cepat: tempel URL `/exec` + `?action=getConfig` di browser. Harus muncul JSON dengan `"success":true`.

## BAGIAN B — Frontend

1. Ekstrak `trial-berakhir.zip`. Folder hasilnya bernama **`trial-berakhir`** — folder inilah yang nanti di-`git init`.
2. Buka `js/config.js`, ganti `GANTI_DENGAN_URL_EXEC_ANDA` dengan URL `/exec` dari langkah A4. Simpan.
3. Pastikan isi folder `trial-berakhir` seperti ini (`index.html` harus langsung terlihat, bukan di dalam subfolder):

```
trial-berakhir/
├── index.html
├── README.md
├── PANDUAN-INSTALASI.md
├── css/style.css
└── js/ config.js, api.js, app.js
```

## BAGIAN C — Deploy ke GitHub Pages (via terminal)

Satu kali saja untuk persiapan: install Git (https://git-scm.com), buat akun di https://github.com, lalu atur identitas:

```bash
git config --global user.name "Nama Anda"
git config --global user.email "email@akun-github-anda.com"
```

1. Di GitHub: **+ → New repository** → nama bebas (mis. `trial-berakhir`) → **Public** → **jangan** centang README/.gitignore/license → **Create**.
2. Buka terminal **di dalam folder `trial-berakhir`** (Windows: buka folder di File Explorer → klik address bar → ketik `powershell` → Enter).
3. Cek isi folder — `index.html` harus terlihat:

```powershell
dir
```

4. Jalankan satu per satu:

```bash
git init
git add .
git commit -m "Upload pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

5. Saat diminta password, gunakan **Personal Access Token** (bukan password akun): https://github.com/settings/tokens → *Generate new token (classic)* → centang **repo** → salin token `ghp_...`. Saat paste, layar terlihat kosong — itu normal.
6. Di repo GitHub: **Settings → Pages** → Source: *Deploy from a branch* → Branch: **main** / **(root)** → **Save**. Centang **Enforce HTTPS**.
7. Tunggu 1–2 menit, situs aktif di `https://USERNAME.github.io/NAMA-REPO/`.

## Mengubah harga / teks / nomor admin

Buka Google Sheets **AppConfig**, edit kolom **value**. Perubahan tampil dalam ±5 menit (cache server). Ingin langsung? Di Apps Script jalankan fungsi `bersihkanCache`.

- Harga: angka saja, tanpa titik (contoh `250000`).
- Hemat dihitung otomatis: `harga_tahunan_normal − harga_tahunan_promo`.
- Nomor admin: format `08xx...` atau `62...`.
- Template pesan WhatsApp: boleh diubah, pertahankan `{paket}` dan `{harga}`.

## Update setelah ini

- **Frontend berubah**: `git add .` → `git commit -m "catatan"` → `git push`. Tekan **Ctrl+Shift+R** untuk melihat versi baru.
- **Kode.gs berubah**: Apps Script → **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. ⚠️ Jangan pilih *New deployment* karena URL `/exec` akan berubah dan situs berhenti memuat data.

## Tes akhir

1. Buka URL GitHub Pages di HP.
2. Harga tampil sesuai Sheet.
3. Ketuk kartu **Bulanan** dan **Tahunan** → WhatsApp terbuka ke nomor admin dengan pesan sesuai paket.
4. Ketuk nomor telepon → dialer terbuka.
5. Chrome DevTools → Network: tidak ada error CORS.
6. Ketik `Perf.table()` di Console untuk melihat waktu total vs waktu server.

## Troubleshooting

| Gejala | Solusi |
|---|---|
| Harga tampil tapi tidak berubah setelah edit Sheet | Tunggu ±5 menit atau jalankan `bersihkanCache`, lalu Ctrl+Shift+R |
| Muncul "Harga mungkin belum yang terbaru" | `GAS_URL` salah / belum diisi, atau deployment bukan *Anyone*. Tes URL `/exec?action=getConfig` di browser |
| 404 di GitHub Pages | `index.html` tidak di root repo. Buka repo di browser dan cek |
| Halaman tanpa styling | Folder `css/` dan `js/` tidak ikut ter-push (jangan upload lewat web GitHub) |
| Nomor admin kehilangan angka 0 di Sheet | Format sel `nomor_admin` harus *Plain text*; aplikasi tetap menanganinya |
