
// ===== Rain text for 3rd screen =====
let rainTimer = null;
let activeBottomCount = 0; // số chữ hiện hành sẽ rơi tới 100%
const BOTTOM_QUOTA = 10; // tối thiểu phải có 10 chữ rơi tới đáy
// Quản lý "lớp" (trước/sau) cho mưa chữ
const MAX_VISIBLE_TEXT_ITEMS = 20; // số lớp ta muốn quản độ mờ
let textLayers = []; // mảng các phần tử hiện hành (mới nhất đứng trước)
const TEXT_MAX_NODES = 50;
function rebalanceTextLayers() {
    const minAlpha = 0.5;
    const maxAlpha = 1.0;
    const total = textLayers.length;

    textLayers.forEach((el, idx) => {
        const alpha =
            maxAlpha - (idx / (total - 1 || 1)) * (maxAlpha - minAlpha);
        const label = el.querySelector(".label");
        if (label) {
            label.style.setProperty("--itemAlpha", alpha.toFixed(3));
            label.style.opacity = alpha.toFixed(3);
        }
    });
}

function spawnRainItem(container) {
    // Giới hạn DOM: nếu quá nhiều node, xóa node cũ nhất để tránh phình
    if (container.childElementCount >= TEXT_MAX_NODES) {
        container.firstElementChild?.remove();
    }

    const words = [
        "Thương em nhiều 💖",
        "Cô bé đáng yêu",
        "❤️",
        "💗",
        "Cô gái của lòng anh 💕",
        "Happy Trang Day 🎉",
    ];
    const el = document.createElement("span");
    el.className = "rain-item";

    // Vị trí ngang & thời lượng rơi
    el.style.left = -5 + Math.random() * 110 + "vw"; // tràn 2 mép
    el.style.setProperty("--dur", 2.5 + Math.random() * 1.5 + "s");

    // Rơi vượt đáy
    const endVH = 110 + Math.random() * 30;
    el.style.setProperty("--endY", endVH + "vh");

    // Chữ chính
    const word = words[Math.floor(Math.random() * words.length)];
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = word;

    // 🎯 Font-size ngẫu nhiên 1.5rem → ~2.2rem
    const fontSizeRem = (1.5 + Math.random() * 0.7).toFixed(2) + "rem";
    label.style.fontSize = fontSizeRem;

    el.appendChild(label);

    // Khi kết thúc animation: gỡ khỏi textLayers và remove khỏi DOM
    el.addEventListener("animationend", () => {
        const idx = textLayers.indexOf(el);
        if (idx >= 0) textLayers.splice(idx, 1);
        el.remove(); // 🧹 quan trọng: xóa node sau khi rơi xong
    });

    container.appendChild(el);

    // Quản lý "lớp" mờ/đậm
    textLayers.unshift(el);
    if (textLayers.length > MAX_VISIBLE_TEXT_ITEMS) {
        textLayers.length = MAX_VISIBLE_TEXT_ITEMS;
    }
    rebalanceTextLayers();
}


export function startContentRain() {
  const container = document.querySelector("#thirdContent .content-rain");
  if (!container) return;
  stopContentRain();
  for (let i = 0; i < BOTTOM_QUOTA; i++) setTimeout(() => spawnRainItem(container), i * 120);
  rainTimer = setInterval(() => spawnRainItem(container), 100 + Math.random() * 100);
}
export function stopContentRain() {
  if (rainTimer) clearInterval(rainTimer);
  rainTimer = null;
}

// ===== Config mưa media (CHỈ ảnh, dùng POOL) =====
import { Assets } from './assets.js';
// ==== Bộ đệm blob URL cho ảnh mưa (tải 1 lần) ====
const IMG_CACHE_NAME = 'rain-img-v1';
const _imgBlobURL = new Map();  // name -> blob:... url

async function getBlobURLForImage(name) {
  if (_imgBlobURL.has(name)) return _imgBlobURL.get(name);
  const url = Assets.url(name);
  const cache = await caches.open(IMG_CACHE_NAME);
  let resp = await cache.match(url);
  if (!resp) {
    resp = await fetch(url, { cache: 'reload' });
    if (resp.ok) await cache.put(url, resp.clone());
  }
  const blob = await resp.blob();
  const objURL = URL.createObjectURL(blob);
  _imgBlobURL.set(name, objURL);
  return objURL;
}

// dọn blob khi rời trang (tránh rò bộ nhớ)
window.addEventListener('beforeunload', () => {
  for (const u of _imgBlobURL.values()) URL.revokeObjectURL(u);
  _imgBlobURL.clear();
});
const IMAGE_NAMES = Assets.rangeNames('img', 1, 79);
const pickImageName = () =>
  IMAGE_NAMES[Math.floor(Math.random() * IMAGE_NAMES.length)];

// --- Pool cấu hình ---
let mediaRainTimer = null;
const POOL_SIZE = 60;                 // ⚙️ điều chỉnh 40–80 tuỳ máy
let mediaPool = [];                   // span.rain-media (mỗi span chứa <img>)
let poolInUse = 0;

// Spawn nhịp (có thể adaptive sau)
function spawnInterval() {
  return 180 + Math.random() * (320 - 180); // ms
}

// Tạo pool node sẵn (gắn vào container 1 lần, mặc định ẩn)
function buildPool(container) {
  if (mediaPool.length) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < POOL_SIZE; i++) {
    const wrap = document.createElement('span');
    wrap.className = 'rain-media';
    // dùng transition thay vì keyframes để dễ reset
    wrap.style.willChange = 'transform';
    wrap.style.transition = 'transform linear var(--dur, 3s)';

    const img = document.createElement('img');
    img.decoding = 'async';
    img.loading = 'lazy';
    img.alt = 'rain-media';
    wrap.appendChild(img);

    // ẩn trước, khi “acquire” sẽ bật lên
    wrap.style.display = 'none';
    frag.appendChild(wrap);
    mediaPool.push(wrap);
  }
  container.appendChild(frag);
}

function acquire() {
  for (const node of mediaPool) {
    if (node.style.display === 'none') {
      node.style.display = '';
      poolInUse++;
      return node;
    }
  }
  return null; // pool đã full
}

function release(node) {
  node.style.display = 'none';
  poolInUse = Math.max(0, poolInUse - 1);
}

// Tái sử dụng 1 node từ pool làm “một hạt mưa”
function recycleOne(container) {
  const node = acquire();
  if (!node) return;

  const img = node.firstElementChild; // <img>
  const name = pickImageName();
// ✅ Dùng blob URL đã cache (không request lại)
getBlobURLForImage(name)
  .then(objURL => { img.src = objURL; })
  .catch(() => { img.src = Assets.url(name); }); // fallback nếu Cache API bị chặn

img.dataset.asset = name;
  img.dataset.asset = name;

  // card dọc gọn nhẹ
  const w = 90 + Math.floor(Math.random() * 50);        // 90..140 px
  const h = Math.floor(w * (1.35 + Math.random() * 0.15));
  node.style.setProperty('--w', w + 'px');
  node.style.setProperty('--h', h + 'px');

  // vị trí ngang, thời lượng, điểm rơi
  const left = -5 + Math.random() * 110;                // -5..105 vw (tràn mép)
  const dur  = 2.2 + Math.random() * 2.0;               // 2.2..4.2 s
  const endY = 110 + Math.random() * 30;                // 110..140 vh

  node.style.left = left + 'vw';
  node.style.setProperty('--dur', dur + 's');

  // Reset vị trí ở trên đỉnh (khớp với CSS transform)
  node.style.transform = 'translate(-50%, -15vh)';

  // buộc reflow để transition chạy từ đầu (trick)
  // eslint-disable-next-line no-unused-expressions
  node.offsetHeight;

  // animate rơi xuống
  node.style.transform = `translate(-50%, ${endY}vh)`;

  // Hẹn giờ trả node về pool khi xong
  setTimeout(() => release(node), dur * 1000 + 30);
}

export function startMediaRain() {
  const container = document.querySelector('#thirdContent .media-rain');
  if (!container) return;

  stopMediaRain();
  buildPool(container);
const warm = IMAGE_NAMES.slice(0).sort(()=>Math.random()-0.5).slice(0, 10);
Promise.allSettled(warm.map(n => getBlobURLForImage(n))).then(()=>{/* ignore */});
  // Seed ban đầu (lấp chỗ trống)
  const seed = Math.min(POOL_SIZE, 14);
  for (let i = 0; i < seed; i++) {
    setTimeout(() => recycleOne(container), i * 80);
  }

  // Tick liên tục nhưng chỉ spawn khi pool còn slot
  const tick = () => {
    if (poolInUse < POOL_SIZE) recycleOne(container);
    mediaRainTimer = setTimeout(tick, spawnInterval());
  };
  tick();
}

export function stopMediaRain() {
  if (mediaRainTimer) { clearTimeout(mediaRainTimer); mediaRainTimer = null; }
  // Không cần remove node — pool giữ sẵn; chỉ việc ẩn đi:
  for (const n of mediaPool) n.style.display = 'none';
  poolInUse = 0;
}
