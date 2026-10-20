// ============================================
// KONFIGURASI — edit file ini SEBELUM push ke GitHub
// ============================================
window.APP_CONFIG = {
  // Tempel URL Web App (berakhiran /exec) dari Google Apps Script
  GAS_URL: 'https://script.google.com/macros/s/AKfycbxLPADnxNu3lc7kNKZfvaGkhSa_lQNvQQvZbkB94TQ0Ptk0NZb0G6L8db7w7PMT354/exec',

  // Naikkan angka versi bila bentuk data berubah (cache lama otomatis tak terpakai)
  CACHE_VERSION: 'v1',

  // Selama 60 detik data tersimpan dianggap segar → tidak perlu tanya server
  FRESH_MS: 60000,

  // Tampilan cadangan: dipakai saat pertama dibuka / server belum merespons.
  // Isi sebenarnya diambil dari Google Sheets (sheet AppConfig).
  DEFAULTS: {
    judul_id: 'Masa trial Anda telah berakhir',
    judul_en: 'Your trial period has ended.',
    ajakan_id: 'Segera pilih sesuai kebutuhan Anda',
    ajakan_en: 'Choose the plan that fits your needs.',
    harga_bulanan: '250000',
    harga_tahunan_normal: '3000000',
    harga_tahunan_promo: '2800000',
    nomor_admin: '089527850069',
    template_pesan: 'Halo admin, saya ingin berlangganan paket {paket} ({harga}).',
    pesan_umum: 'Halo admin, saya ingin bertanya tentang berlangganan.'
  }
};
