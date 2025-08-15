// assets.js
// ✅ Registry duy nhất: khai báo đường dẫn 1 lần, gọi theo tên ở mọi nơi

const REGISTRY = new Map();

/* ===== Khai báo TÊN → URL (chỉ URL; trình duyệt tự cache khi dùng) ===== */

// 🐱 gif (ghi cả 2 alias: 'meobantim' và 'meobantin' để khỏi nhầm)
REGISTRY.set('meobantim', './assets/meobantim.gif');
REGISTRY.set('meobantin', './assets/meobantim.gif'); // alias
REGISTRY.set('chicanminhconhau', './assets/audio/chicanminhconhau.mp3');
REGISTRY.set('thutay', './assets/thutay.webp');

// 📕 12 ảnh sách: book1..book12.png
for (let i = 1; i <= 12; i++) {
  REGISTRY.set(`book${i}`, `./assets/book/book${i}.png`);
}

// 🖼️ 75 ảnh: img1..img79.webp
for (let i = 1; i <= 79; i++) {
  REGISTRY.set(`img${i}`, `./assets/images/img${i}.webp`);
}

// 🎞️ 1 video: video1.mp4 (đặt tên "video1")
REGISTRY.set('video1', './assets/video/video1.mp4');


/* ===== API tiện dùng ===== */
function url(name) {
  const u = REGISTRY.get(name);
  if (!u) throw new Error(`Asset not found: ${name}`);
  return u;
}

// Tạo <img> mới (tránh reuse cùng 1 node ở nhiều nơi)
function image(name, opts = {}) {
  const el = document.createElement('img');
  el.src = url(name);
  el.alt = name;
  if (opts.decoding) el.decoding = opts.decoding;     // 'async'
  if (opts.loading)  el.loading  = opts.loading;      // 'lazy' | 'eager'
  if (opts.fetchpriority) el.setAttribute('fetchpriority', opts.fetchpriority); // 'high' | 'low'
  return el;
}

// Tạo <video> mới (muted/playsinline để autoplay)
function video(name, opts = {}) {
  const el = document.createElement('video');
  el.src = url(name);
  el.autoplay = !!opts.autoplay;
  el.loop = !!opts.loop;
  el.muted = opts.muted !== false; // mặc định muted=true
  el.playsInline = true;
  el.preload = opts.preload || 'metadata'; // hoặc 'none'
  el.controls = !!opts.controls;
  return el;
}
// Tạo <audio> mới
function audio(name, opts = {}) {
  const el = document.createElement('audio');
  el.src = url(name);
  el.autoplay = !!opts.autoplay;   // thường không cần vì ta sẽ play() sau khi bấm nút
  el.loop = !!opts.loop;
  el.muted = !!opts.muted;         // audio mặc định không mute
  el.controls = !!opts.controls;
  el.preload = opts.preload || 'auto';
  return el;
}

/* ===== Preload / Prefetch (có tránh trùng) ===== */
function _absHref(href) {
  // chuyển về URL tuyệt đối để so soánh chắc chắn
  try { return new URL(href, document.baseURI).href; } catch { return href; }
}

function preload(name, asType = 'image', priority /* 'high' | 'low' */) {
  const href = url(name);
  const abs = _absHref(href);

  // Tránh tạo trùng cùng href
  const existed = Array.from(document.querySelectorAll('link[rel="preload"]'))
    .some(l => l.href === abs);
  if (existed) return null;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as  = asType; // 'image' | 'video' | 'font'...
  link.href = href;
  if (priority) link.setAttribute('fetchpriority', priority);
  document.head.appendChild(link);
  return link;
}

function prefetch(name) {
  const href = url(name);
  const abs = _absHref(href);
  const existed = Array.from(document.querySelectorAll('link[rel="prefetch"]'))
    .some(l => l.href === abs);
  if (existed) return null;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
  return link;
}

/* ===== Batch helpers ===== */
function preloadBatch(names, asType = 'image', priority) {
  names.forEach(n => preload(n, asType, priority));
}
function prefetchBatch(names) {
  names.forEach(n => prefetch(n));
}

/* ===== Helpers để lấy danh sách tên theo mẫu ===== */
function rangeNames(prefix, start, endInclusive) {
  return Array.from({ length: endInclusive - start + 1 }, (_, i) => `${prefix}${i + start}`);
}

/* ===== Nhóm tên tiện dụng (gọi gọn ở nơi khác) ===== */
const GROUPS = {
  books: rangeNames('book', 1, 12),
};

export const Assets = {
  url, image, video, audio,   // ⬅️ thêm audio
  preload, prefetch,
  preloadBatch, prefetchBatch,
  rangeNames, GROUPS
};