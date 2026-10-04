/* =====================================================
   NUSA KOTA — App.js
   1) Deploy Code.gs sebagai Web App di Google Apps Script
   2) Tempel URL Web App (berakhiran /exec) di bawah ini
   ===================================================== */
const CONFIG = {
  WEB_APP_URL: "https://script.google.com/macros/s/AKfycbw11b5XZs4A6o-JWoztyKCePvZHwSKKLWKUx7sajHmCFduUIqJ0DhWUWZSOoNUTEd5qvw/exec"
};

const CITIES = [
  { name: "Yogyakarta", emo: "🏯", bg: "#ffc93c", tag: "Kota budaya, gudeg, dan angkringan yang bikin betah." },
  { name: "Bali (Denpasar)", emo: "🏝️", bg: "#c8ff2e", tag: "Pantai, pura, dan sunset yang tak pernah membosankan." },
  { name: "Bandung", emo: "🌄", bg: "#ff7ad9", tag: "Udara sejuk, kafe kreatif, dan wisata kuliner." },
  { name: "Jakarta", emo: "🌆", bg: "#7fd6ff", tag: "Ibu kota yang tidak pernah tidur, penuh peluang." },
  { name: "Surabaya", emo: "🦈", bg: "#ff6b57", tag: "Kota pahlawan dengan rawon dan semangat arek-arek." },
  { name: "Malang", emo: "🍎", bg: "#9bf0c3", tag: "Dingin, hijau, dan dikelilingi gunung." },
  { name: "Medan", emo: "🍲", bg: "#ffa94d", tag: "Rumah durian, bika ambon, dan soto Medan." },
  { name: "Makassar", emo: "⛵", bg: "#b9a4ff", tag: "Coto, pisang epe, dan senja di Losari." },
  { name: "Semarang", emo: "🏛️", bg: "#ffe45e", tag: "Lawang Sewu, lumpia, dan nuansa kota tua." },
  { name: "Labuan Bajo", emo: "🦎", bg: "#5eead4", tag: "Gerbang Komodo dan laut biru yang memukau." }
];

const COLORS = CITIES.map(c => c.bg);
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const isLive = () => /^https:\/\/script\.google\.com\/.+\/exec/.test(CONFIG.WEB_APP_URL);

let rows = [];

/* ---------- Scroll reveal ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      e.target.querySelectorAll(".bar i").forEach(b => (b.style.width = b.dataset.w + "%"));
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
const observe = (root = document) => root.querySelectorAll(".reveal:not(.in)").forEach(el => io.observe(el));

/* ---------- Counter animasi ---------- */
function countTo(el, to) {
  const from = parseInt(el.textContent, 10) || 0, t0 = performance.now(), dur = 1200;
  const step = t => {
    const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Render ---------- */
function render() {
  const counts = {};
  CITIES.forEach(c => (counts[c.name] = 0));
  rows.forEach(r => { if (r.city in counts) counts[r.city]++; });
  const ranked = CITIES.map(c => ({ ...c, n: counts[c.name] })).sort((a, b) => b.n - a.n);
  const max = Math.max(1, ranked[0].n);

  $("stVotes").textContent = "0"; countTo($("stVotes"), rows.length);
  countTo($("stCities"), ranked.filter(c => c.n > 0).length);
  countTo($("stReviews"), rows.filter(r => r.reason).length);

  $("rankGrid").innerHTML = ranked.map((c, i) => `
    <article class="card reveal ${i < 3 ? "top" : ""}" style="background:${c.bg};--d:${(i % 3) * 0.12}s">
      ${i === 0 ? '<span class="badge">Paling favorit</span>' : ""}
      <span class="pos">${i + 1}</span>
      <span class="emo">${c.emo}</span>
      <h3>${esc(c.name)}</h3>
      <p>${esc(c.tag)}</p>
      <div class="bar"><i data-w="${Math.round((c.n / max) * 100)}"></i></div>
      <div class="votes"><span>${c.n} suara</span><span>${rows.length ? Math.round((c.n / rows.length) * 100) : 0}%</span></div>
    </article>`).join("");

  const list = rows.filter(r => r.reason).slice(-12).reverse();
  $("revGrid").innerHTML = list.length ? list.map((r, i) => {
    const c = CITIES.find(x => x.name === r.city) || CITIES[0];
    return `<div class="rev reveal" style="background:${c.bg};--d:${(i % 3) * 0.1}s">
      <span class="c">${c.emo} ${esc(r.city)}</span><p>“${esc(r.reason)}”</p><small>— ${esc(r.name)}</small></div>`;
  }).join("") : '<div class="empty">Belum ada ulasan. Jadilah yang pertama memilih kota favoritmu.</div>';

  observe($("rankGrid")); observe($("revGrid"));
}

/* ---------- Data ---------- */
async function load() {
  if (!isLive()) {
    rows = [
      { name: "Rina", city: "Yogyakarta", reason: "Orangnya ramah dan makanannya murah serta enak." },
      { name: "Dimas", city: "Bali (Denpasar)", reason: "Suasana pantainya bikin pikiran tenang." },
      { name: "Sari", city: "Bandung", reason: "Udara sejuk dan banyak tempat nongkrong asyik." },
      { name: "Andi", city: "Makassar", reason: "Coto dan sunset di Losari tidak ada duanya." },
      { name: "Maya", city: "Yogyakarta", reason: "Setiap sudut kotanya punya cerita." }
    ];
    $("msg").className = "err";
    $("msg").textContent = "Mode demo: isi WEB_APP_URL di App.js agar terhubung ke spreadsheet.";
    return render();
  }
  try {
    const res = await fetch(CONFIG.WEB_APP_URL + "?action=list&t=" + Date.now());
    const json = await res.json();
    rows = json.ok ? json.rows : [];
  } catch (e) {
    rows = [];
    $("msg").className = "err";
    $("msg").textContent = "Data belum bisa dimuat. Periksa URL Web App dan izin akses 'Anyone'.";
  }
  render();
}

/* ---------- Kirim suara ---------- */
async function submitVote(e) {
  e.preventDefault();
  const msg = $("msg"), btn = $("submitBtn");
  const data = { name: $("name").value.trim(), city: $("city").value, reason: $("reason").value.trim() };
  if (!data.name || !data.city || !data.reason) {
    msg.className = "err"; msg.textContent = "Lengkapi nama, kota, dan alasan dulu."; return;
  }
  btn.disabled = true; btn.textContent = "Mengirim..."; msg.className = ""; msg.textContent = "";
  try {
    if (isLive()) {
      const res = await fetch(CONFIG.WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Gagal menyimpan");
    }
    rows.push(data); render();
    msg.className = "ok"; msg.textContent = "Suara terkirim. Terima kasih, " + data.name + "!";
    $("voteForm").reset();
    document.getElementById("ranking").scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    msg.className = "err"; msg.textContent = "Gagal mengirim: " + err.message + ". Coba lagi.";
  }
  btn.disabled = false; btn.textContent = "Kirim suara";
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("city").innerHTML = '<option value="" disabled selected>Pilih kota</option>' +
    CITIES.map(c => `<option value="${esc(c.name)}">${c.emo} ${esc(c.name)}</option>`).join("");

  const names = CITIES.map(c => `<span>${esc(c.name)}</span><span><em>★</em></span>`).join("");
  $("track").innerHTML = names + names;

  const nav = $("nav"), links = $("links");
  const onScroll = () => nav.classList.toggle("solid", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  $("menuBtn").addEventListener("click", () => links.classList.toggle("open"));
  links.addEventListener("click", e => { if (e.target.tagName === "A") links.classList.remove("open"); });

  $("voteForm").addEventListener("submit", submitVote);
  observe(); load();
});
