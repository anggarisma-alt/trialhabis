// ============================================
// APP — render dari cache/default dulu, lalu segarkan dari server
// ============================================
(function () {
  'use strict';
  var CFG = window.APP_CONFIG;
  var LS_KEY = 'trial:' + CFG.CACHE_VERSION + ':config';
  var lastHash = null;
  var lastFetch = 0;

  // ---------- Penyimpanan lokal (aman bila diblokir) ----------
  var Store = {
    get: function () { try { var v = localStorage.getItem(LS_KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set: function (v) { try { localStorage.setItem(LS_KEY, JSON.stringify(v)); } catch (e) { /* tetap jalan tanpa cache */ } }
  };
  function hashStr(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h + ':' + s.length; }

  // ---------- Format ----------
  function rupiah(n) {
    n = Math.round(Number(n) || 0);
    return 'Rp ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function rupiahKoma(n) { return rupiah(n) + ',-'; }

  // 0895xxxx / 895xxxx / 62895xxxx → 62895xxxx (format wa.me)
  function waNumber(raw) {
    var d = String(raw || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.indexOf('62') === 0) return d;
    if (d.charAt(0) === '0') return '62' + d.slice(1);
    if (d.charAt(0) === '8') return '62' + d;
    return d;
  }
  // 62895xxxx → 0895-xxxx-xxxx (tampilan)
  function phoneDisplay(raw) {
    var n = waNumber(raw);
    var local = n.indexOf('62') === 0 ? '0' + n.slice(2) : n;
    return local.replace(/^(\d{4})(\d{4})(\d+)$/, '$1-$2-$3');
  }
  function waLink(num, text) { return 'https://wa.me/' + num + '?text=' + encodeURIComponent(text); }

  function merge(data) {
    var out = {}, k;
    for (k in CFG.DEFAULTS) out[k] = CFG.DEFAULTS[k];
    if (data) for (k in data) if (data[k] !== '' && data[k] != null) out[k] = data[k];
    return out;
  }

  // ---------- Render (textContent saja → aman dari injeksi) ----------
  function $(id) { return document.getElementById(id); }

  function render(data) {
    var c = merge(data);

    document.querySelectorAll('[data-k]').forEach(function (el) { el.textContent = c[el.getAttribute('data-k')] || ''; });

    var bulanan = Number(c.harga_bulanan) || 0;
    var normal  = Number(c.harga_tahunan_normal) || 0;
    var promo   = Number(c.harga_tahunan_promo) || 0;
    var hemat   = normal - promo;
    var num     = waNumber(c.nomor_admin);

    $('price-bulanan').textContent = rupiahKoma(bulanan);
    $('price-tahunan').textContent = rupiahKoma(promo);

    var punyaHemat = hemat > 0;
    $('price-normal').textContent = punyaHemat ? rupiahKoma(normal) : '';
    $('price-normal').parentNode.style.visibility = punyaHemat ? 'visible' : 'hidden';
    $('badge-hemat').hidden = !punyaHemat;
    if (punyaHemat) $('badge-hemat').textContent = 'Hemat / Save ' + rupiahKoma(hemat);

    function pesan(paket, harga) { return c.template_pesan.replace('{paket}', paket).replace('{harga}', rupiah(harga)); }
    $('plan-bulanan').href = waLink(num, pesan('Bulanan', bulanan));
    $('plan-tahunan').href = waLink(num, pesan('Tahunan', promo));
    $('wa-chat').href      = waLink(num, c.pesan_umum);

    $('phone').textContent = phoneDisplay(c.nomor_admin);
    $('phone').href = 'tel:+' + num;
  }

  // ---------- Notifikasi ----------
  function notice(text) {
    $('notice-text').textContent = text || '';
    $('notice').hidden = !text;
  }

  // ---------- Muat data: cache → (bila basi) server ----------
  async function load(force) {
    var cached = Store.get();
    if (!force && cached && Date.now() - cached.t < CFG.FRESH_MS) return;
    if (!window.Api.ready()) return; // GAS_URL belum diisi → tampil default saja

    var res = await window.Api.get('getConfig');
    lastFetch = Date.now();

    if (res.success) {
      var h = hashStr(JSON.stringify(res.data));
      Store.set({ t: Date.now(), h: h, data: res.data });
      if (h !== lastHash) { render(res.data); lastHash = h; }
      notice('');
    } else if (!cached) {
      notice('Harga mungkin belum yang terbaru. / Prices may be out of date.');
    }
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', function () {
    var cached = Store.get();
    render(cached ? cached.data : null);       // tampil seketika dari cache atau default
    lastHash = cached ? cached.h : null;

    $('notice-retry').addEventListener('click', function () { notice(''); load(true); });
    load(false);

    // Kembali ke tab setelah lama → segarkan bila data sudah basi
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && Date.now() - lastFetch > CFG.FRESH_MS) load(false);
    });
  });
})();
