// ============================================
// API — fetch ke GAS (timeout, retry, pengukur waktu)
// ============================================
(function () {
  'use strict';
  var CFG = window.APP_CONFIG;

  // Pengukur: ketik Perf.table() di Console untuk melihat total vs waktu server
  var Perf = {
    rows: [],
    add: function (action, total, server) {
      this.rows.push({ action: action, total: total, server: server == null ? null : server,
                       net: server == null ? null : total - server, at: new Date().toISOString() });
      if (this.rows.length > 100) this.rows.shift();
    },
    table: function () { console.table(this.rows.slice(-30)); }
  };
  window.Perf = Perf;

  function gasReady() { return CFG.GAS_URL && CFG.GAS_URL.indexOf('GANTI_') !== 0; }

  async function apiOnce(action, timeout) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, timeout);
    var t0 = performance.now();
    try {
      // GET sederhana (tanpa header khusus) → tidak memicu CORS preflight
      var res = await fetch(CFG.GAS_URL + '?action=' + encodeURIComponent(action),
                            { redirect: 'follow', cache: 'no-store', signal: ctrl.signal });
      var text = await res.text();
      try {
        var j = JSON.parse(text);
        Perf.add(action, Math.round(performance.now() - t0), j.ms);
        return j;
      } catch (e) {
        return { success: false, retryable: res.status >= 500 || res.status === 429,
                 message: 'Server membalas HTTP ' + res.status + ' (bukan JSON).' };
      }
    } catch (err) {
      return { success: false, retryable: true,
               message: err.name === 'AbortError' ? 'Server terlalu lama merespons.' : 'Koneksi terputus.' };
    } finally { clearTimeout(timer); }
  }

  function waitOnline(ms) {
    return new Promise(function (resolve) {
      if (navigator.onLine !== false) return resolve();
      var t = setTimeout(done, ms);
      function done() { clearTimeout(t); removeEventListener('online', done); resolve(); }
      addEventListener('online', done);
    });
  }

  // Baca data: hingga 3x percobaan (percobaan pertama lebih pendek agar cepat pulih dari cold start)
  async function apiGet(action) {
    var res;
    for (var i = 0; i < 3; i++) {
      if (i) {
        await new Promise(function (r) { setTimeout(r, 1200 * i); });
        if (navigator.onLine === false) await waitOnline(15000);
      }
      res = await apiOnce(action, i ? 40000 : 25000);
      if (res.success || !res.retryable) break;
    }
    return res;
  }

  window.Api = { get: apiGet, ready: gasReady };
})();
