const starField = document.getElementById("star-field");
const starCount = 500;

const starTypes = ['','star-4','star-5','star-6'];
const twinkleClasses = ['twinkle1','twinkle2','twinkle3','twinkle4','twinkle5'];

for (let i = 0; i < starCount; i++) {
  const star = document.createElement("div");
  star.classList.add("star");

  // Random loại ngôi sao
  const type = starTypes[Math.floor(Math.random() * starTypes.length)];
  if (type) star.classList.add(type);

  // Random animation nhấp nháy
  const twinkle = twinkleClasses[Math.floor(Math.random() * twinkleClasses.length)];
  star.style.animationName = twinkle;
  star.style.animationDuration = `${Math.random() * 3 + 2}s`; // ngẫu nhiên 2-5s

  // Vị trí ngẫu nhiên
  star.style.top = `${Math.random() * 100}%`;
  star.style.left = `${Math.random() * 100}%`;

  // Kích thước tăng 1.5 lần (so với trước)
  const size = (Math.random() * 3 + 1) * 1.2;
  star.style.width = `${size}px`;
  star.style.height = `${size}px`;

  // Đổ bóng nhẹ
  star.style.boxShadow = `0 0 ${size * 4}px white`;

  starField.appendChild(star);
}

  // Hiệu ứng sao băng
function initShootingStars(canvas, userOptions = {}) {
  const ctx = canvas.getContext('2d');
  let rafId = null;
  let tickId = null;
  let running = false;

  const shootingStars = [];

  const opts = {
    angle: Math.PI / 4,
    minLength: 150,
    maxLength: 400,
    minSpeed: 5,
    maxSpeed: 12,
    thickness: 2.5,
    spawnInterval: 1500,
    opacityDecay: 0.005,
    maxYRatio: 0.5,
    minTravelRatio: 0.3,
    minCountPerBatch: 1,
    maxCountPerBatch: 3,
    ...userOptions,
  };

  function createShootingStar() {
    const width = canvas.clientWidth || canvas.width;
    const height = canvas.clientHeight || canvas.height;
    const count = Math.floor(Math.random() * (opts.maxCountPerBatch - opts.minCountPerBatch + 1)) + opts.minCountPerBatch;

    for (let i = 0; i < count; i++) {
      const fromEdge = Math.random() < 0.5 ? 'left' : 'top';
      let startX, startY;

      if (fromEdge === 'left') {
        startX = -100;
        startY = Math.random() * height * opts.maxYRatio;
      } else {
        startX = Math.random() * width;
        startY = -100;
      }

      const angle = opts.angle;
      const length = Math.random() * (opts.maxLength - opts.minLength) + opts.minLength;
      const speed = Math.random() * (opts.maxSpeed - opts.minSpeed) + opts.minSpeed;

      shootingStars.push({
        x: startX,
        y: startY,
        length,
        speed,
        angle,
        opacity: 1
      });
    }
  }

  function drawShootingStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      const endX = s.x - Math.cos(s.angle) * s.length;
      const endY = s.y - Math.sin(s.angle) * s.length;

      const gradient = ctx.createLinearGradient(s.x, s.y, endX, endY);
      gradient.addColorStop(0, `rgba(255,255,255,${s.opacity})`);
      gradient.addColorStop(1, `rgba(255,255,255,0)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = opts.thickness;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.opacity -= opts.opacityDecay;

      if (s.opacity <= 0 || s.x > canvas.width || s.y > canvas.height) {
        shootingStars.splice(i, 1);
      }
    }
  }

  function loop() {
    drawShootingStars();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    createShootingStar();
    tickId = setInterval(createShootingStar, opts.spawnInterval);
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    clearInterval(tickId);
    cancelAnimationFrame(rafId);
    tickId = null;
    rafId = null;
  }

  function destroy() {
    stop();
    shootingStars.length = 0;
  }

  function setOptions(newOpts = {}) {
    Object.assign(opts, newOpts);
  }

  return { start, stop, destroy, setOptions };
}

window.addEventListener("load", () => {
  const canvas = document.getElementById("shooting-canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const shootingStars = initShootingStars(canvas);
  shootingStars.start();

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
});

function createHeart() {
  const container = document.getElementById('heart-container');
  const heart = document.createElement('div');
  heart.classList.add('heart');
  heart.textContent = '💗';

  // Vị trí ngang ngẫu nhiên
  const pos = Math.random() * 90 + 5;
  heart.style.left = `${pos}%`;

  // Kích thước ngẫu nhiên
  const scale = Math.random() * 0.5 + 1;
  heart.style.fontSize = `${24 * scale}px`;

  // Độ cao bay lên: 40vh - 70vh
  const offsetY = Math.random() * 30 + 40; // 40–70
  heart.style.setProperty('--offsetY', `-${offsetY}vh`);

  container.appendChild(heart);

  heart.addEventListener('animationend', () => {
    heart.remove();
  });
}

let heartIntervalId = null; // 🔹 Lưu ID interval

function ensureHeartsRunning() {
  heartIntervalId = setInterval(() => {
    const count = Math.floor(Math.random() * 4) + 2; // 2–5 trái tim mỗi đợt
    for (let i = 0; i < count; i++) {
      setTimeout(createHeart, i * 300); // tạo cách nhau 300ms
    }
  }, 3000);
}

window.addEventListener('DOMContentLoaded', () => {
  ensureHeartsRunning();
});


function handleStart() {
  const main = document.getElementById("mainContent");
  const second = document.getElementById("secondContent");

  // Thêm hiệu ứng mờ dần
  main.classList.add("fade-out");

  setTimeout(() => {
    main.style.display = "none";
    second.style.display = "block";
    second.classList.add("fade-in");
  }, 1500); // Phù hợp thời gian animation
}

const flipBook = (elBook) => {
  const pages = elBook.querySelectorAll(".page");
  const totalPages = pages.length;
  const nextButton = document.getElementById("nextButton");

  elBook.style.setProperty("--c", 0); // trang hiện tại

  pages.forEach((page, idx) => {
    page.style.setProperty("--i", idx);
    page.addEventListener("click", (evt) => {
      if (evt.target.closest("a")) return;
      const curr = evt.target.closest(".back") ? idx : idx + 1;
      elBook.style.setProperty("--c", curr);

      // Đến trang cuối -> đưa book về giữa + hiện nút Next (fade-in 1s)
      if (curr >= totalPages) {
        elBook.classList.add("snap-center");
        if (nextButton) nextButton.classList.add("visible");
      } else {
        elBook.classList.remove("snap-center");
        if (nextButton) nextButton.classList.remove("visible");
      }
    });
  });
};



document.querySelectorAll(".book").forEach(flipBook);

function goToThirdContent() {
  const second = document.getElementById("secondContent");
  const third = document.getElementById("thirdContent");

  // 🔹 Dừng hiệu ứng trái tim
  if (heartIntervalId) {
    clearInterval(heartIntervalId);
    heartIntervalId = null;
  }

  second.classList.add("fade-out");
  setTimeout(() => {
    second.style.display = "none";
    third.style.display = "flex"; // hoặc block
    third.classList.add("fade-in");
  }, 1500);
}

// ===== Rain text for 3rd screen =====
let rainTimer = null;
let activeBottomCount = 0;          // số chữ hiện hành sẽ rơi tới 100%
const BOTTOM_QUOTA = 10;            // tối thiểu phải có 10 chữ rơi tới đáy
// Quản lý "lớp" (trước/sau) cho mưa chữ
const MAX_VISIBLE_TEXT_ITEMS = 20;       // số lớp ta muốn quản độ mờ
let textLayers = [];                     // mảng các phần tử hiện hành (mới nhất đứng trước)

function rebalanceTextLayers() {
  const minAlpha = 0.5;
  const maxAlpha = 1.0;
  const total = textLayers.length;

  textLayers.forEach((el, idx) => {
    const alpha = maxAlpha - (idx / (total - 1 || 1)) * (maxAlpha - minAlpha);
    const label = el.querySelector(".label");
    if (label) {
      label.style.setProperty("--itemAlpha", alpha.toFixed(3));
      label.style.opacity = alpha.toFixed(3);
    }
  });
}

function spawnRainItem(container) {
  const words = ["content1", "content2", "content3","😍","😊","🤔","👍","😡","😝"];
  const el = document.createElement("span");
  el.className = "rain-item";

  // Vị trí ngang & thời lượng rơi
  el.style.left = (-5 + Math.random() * 110) + "vw"; // tràn 2 mép
  el.style.setProperty("--dur", (2.5 + Math.random() * 1.5) + "s");

  // Rơi vượt đáy
  const endVH = 110 + Math.random() * 30;
  el.style.setProperty("--endY", endVH + "vh");

  // Chữ chính
  const word = words[Math.floor(Math.random() * words.length)];
  const label = document.createElement("span");
  label.className = "label";
  label.textContent = word;

  // 🎯 Font-size ngẫu nhiên 1.3rem → 2rem
  const fontSizeRem = (1.5 + Math.random() * 0.7).toFixed(2) + "rem";
  label.style.fontSize = fontSizeRem;

  el.appendChild(label);

  el.addEventListener("animationend", () => {
    const idx = textLayers.indexOf(el);
    if (idx >= 0) textLayers.splice(idx, 1);
  });

  container.appendChild(el);

  textLayers.unshift(el);
  if (textLayers.length > MAX_VISIBLE_TEXT_ITEMS) {
    textLayers.length = MAX_VISIBLE_TEXT_ITEMS;
  }
  rebalanceTextLayers();
}



function startContentRain() {
  const container = document.querySelector("#thirdContent .content-rain");
  if (!container) return;
  stopContentRain();      // tránh tạo trùng
  activeBottomCount = 0;

  // Khởi động: bơm đủ 10 chữ đầu tiên rơi tới đáy (spacing nhẹ)
  for (let i = 0; i < BOTTOM_QUOTA; i++) {
    setTimeout(() => spawnRainItem(container), i * 120);
  }

  // Sau đó mưa liên tục (≈ 180–280ms/chữ)
  rainTimer = setInterval(() => {
    spawnRainItem(container);
  }, 100 + Math.random() * 100);
}

function stopContentRain() {
  if (rainTimer) clearInterval(rainTimer);
  rainTimer = null;
}


// ===== Update goToThirdContent to stop hearts + start rain =====
function goToThirdContent() {
  const second = document.getElementById("secondContent");
  const third  = document.getElementById("thirdContent");

  // Dừng trái tim bay nếu còn
  if (typeof heartIntervalId !== "undefined" && heartIntervalId) {
    clearInterval(heartIntervalId);
    heartIntervalId = null;
  }

  second.classList.add("fade-out");
  setTimeout(() => {
    second.style.display = "none";
    third.style.display = "flex";
    third.classList.add("fade-in");

    // Bắt đầu mưa chữ
    startContentRain();
    startMediaRain();
  }, 1500);
}


// ===== Config mưa media (ảnh + video) =====
const IMAGES_COUNT = 20; // số file img1..imgN
const IMG_PATH_PREFIX = "/assets/images/img";
const IMG_PATH_SUFFIX = ".jpg";

const VIDEOS_COUNT = 6;  // số file video1..videoN
const VIDEO_PATH_PREFIX = "/assets/video/video";
const VIDEO_PATH_SUFFIX = ".mp4";

// tỉ lệ xuất hiện video so với ảnh (0..1): 0.3 = 30% video, 70% ảnh
const VIDEO_PROBABILITY = 0.35;

const IMAGE_LIST = Array.from({length: IMAGES_COUNT}, (_, i) =>
  `${IMG_PATH_PREFIX}${i+1}${IMG_PATH_SUFFIX}`
);
const VIDEO_LIST = Array.from({length: VIDEOS_COUNT}, (_, i) =>
  `${VIDEO_PATH_PREFIX}${i+1}${VIDEO_PATH_SUFFIX}`
);

function pickMedia() {
  const isVideo = Math.random() < VIDEO_PROBABILITY && VIDEO_LIST.length > 0;
  if (isVideo) {
    return { type: "video", src: VIDEO_LIST[Math.floor(Math.random() * VIDEO_LIST.length)] };
  }
  return { type: "img", src: IMAGE_LIST[Math.floor(Math.random() * IMAGE_LIST.length)] };
}

// ===== Rain media unified =====
let mediaRainTimer = null;
const MEDIA_MAX_NODES = 300;                 // giới hạn DOM tổng
const MEDIA_SPAWN_INTERVAL_MIN = 180;        // ms
const MEDIA_SPAWN_INTERVAL_MAX = 320;        // ms

function spawnRainMedia(container){
  if (container.childElementCount > MEDIA_MAX_NODES) {
    container.firstElementChild?.remove();   // xóa item cũ nhất để tránh phình DOM
  }

  const wrap = document.createElement("span");
  wrap.className = "rain-media";

  // chọn ảnh hoặc video
  const media = pickMedia();
  let node;
  if (media.type === "video") {
    node = document.createElement("video");
    node.src = media.src;
    node.autoplay = true;
    node.muted = true;        // cần muted để autoplay
    node.loop = true;
    node.playsInline = true;  // iOS
    node.preload = "none";    // giảm tải
    node.controls = false;
  } else {
    node = document.createElement("img");
    node.src = media.src;
    node.alt = "rain-media";
    node.decoding = "async";
    node.loading = "lazy";
  }
  wrap.appendChild(node);

  // Kích thước ngẫu nhiên — giữ tỷ lệ “card dọc”
  const w = 100 + Math.floor(Math.random()*61);  // 100..160 px
  const h = Math.floor(w * (1.35 + Math.random()*0.15)); // ~1.35–1.5
  wrap.style.setProperty("--w", w + "px");
  wrap.style.setProperty("--h", h + "px");

  // Vị trí ngang: cho phép tràn 2 mép
  wrap.style.left = (-5 + Math.random()*110) + "vw";

  // Thời lượng rơi
  wrap.style.setProperty("--dur", (2.2 + Math.random()*2.0) + "s");

  // Rơi vượt đáy 110–140vh
  const endVH = 110 + Math.random()*30;
  wrap.style.setProperty("--endY", endVH + "vh");

  // Khi kết thúc animation: không remove để media “đậu” ở đáy
  wrap.addEventListener("animationend", () => {
    // Tối ưu: nếu rơi quá sâu, pause video để giảm CPU
    if (media.type === "video" && endVH > 125) node.pause();
  });

  container.appendChild(wrap);
}

function startMediaRain(){
  const container = document.querySelector("#thirdContent .media-rain");
  if (!container) return;
  stopMediaRain();

  // bơm một ít item ban đầu
  for (let i=0;i<12;i++){
    setTimeout(()=>spawnRainMedia(container), i*90);
  }

  // vòng lặp sinh liên tục với nhịp ngẫu nhiên
  const tick = () => {
    spawnRainMedia(container);
    const next = MEDIA_SPAWN_INTERVAL_MIN + Math.random()*(MEDIA_SPAWN_INTERVAL_MAX - MEDIA_SPAWN_INTERVAL_MIN);
    mediaRainTimer = setTimeout(tick, next);
  };
  tick();
}
function stopMediaRain(){
  if (mediaRainTimer){ clearTimeout(mediaRainTimer); mediaRainTimer = null; }
}
