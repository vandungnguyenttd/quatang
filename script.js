const starField = document.getElementById("star-field");
const starCount = 300;

const starTypes = ["", "star-4", "star-5", "star-6"];
const twinkleClasses = [
    "twinkle1",
    "twinkle2",
    "twinkle3",
    "twinkle4",
    "twinkle5",
];
const CAPTIONS = {
  thutay: "Chúc mừng năm mới! 🎉\nMột năm mới lại đến, mang theo biết bao hy vọng, ước mơ và những khởi đầu tươi sáng. Mong rằng năm nay sẽ là hành trình đầy niềm vui, sức khỏe dồi dào và thành công rực rỡ cho bạn và những người thân yêu. Hãy để quá khứ khép lại, giữ lại những kỷ niệm đẹp và bài học quý giá, để rồi tự tin bước tiếp với tâm thế tích cực và lạc quan. Chúc bạn luôn mỉm cười trước mọi thử thách, luôn tìm thấy niềm hạnh phúc trong từng khoảnh khắc, và biến mọi ước mơ thành hiện thực. Một năm an khang, thịnh vượng, vạn sự như ý! 🌸🍀", // xuống hàng thêm \n vào giữa
  // img43: "Bìa sách kỷ niệm",
};
let bgAudioEl = null;

for (let i = 0; i < starCount; i++) {
    const star = document.createElement("div");
    star.classList.add("star");

    // Random loại ngôi sao
    const type = starTypes[Math.floor(Math.random() * starTypes.length)];
    if (type) star.classList.add(type);

    // Random animation nhấp nháy
    const twinkle =
        twinkleClasses[Math.floor(Math.random() * twinkleClasses.length)];
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
    const ctx = canvas.getContext("2d");
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
        const count =
            Math.floor(
                Math.random() *
                    (opts.maxCountPerBatch - opts.minCountPerBatch + 1)
            ) + opts.minCountPerBatch;

        for (let i = 0; i < count; i++) {
            const fromEdge = Math.random() < 0.5 ? "left" : "top";
            let startX, startY;

            if (fromEdge === "left") {
                startX = -100;
                startY = Math.random() * height * opts.maxYRatio;
            } else {
                startX = Math.random() * width;
                startY = -100;
            }

            const angle = opts.angle;
            const length =
                Math.random() * (opts.maxLength - opts.minLength) +
                opts.minLength;
            const speed =
                Math.random() * (opts.maxSpeed - opts.minSpeed) + opts.minSpeed;

            shootingStars.push({
                x: startX,
                y: startY,
                length,
                speed,
                angle,
                opacity: 1,
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

    const main = document.getElementById("mainContent");
    if (main && getComputedStyle(main).display !== "none") {
        startDirectedHearts(380); // bắn 1 tim ~ mỗi 0.38s
    }
    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
});

function createHeart() {
    const container = document.getElementById("heart-container");
    const heart = document.createElement("div");
    heart.classList.add("heart");
    heart.textContent = "💗";

    // Vị trí ngang ngẫu nhiên
    const pos = Math.random() * 90 + 5;
    heart.style.left = `${pos}%`;

    // Kích thước ngẫu nhiên
    const scale = Math.random() * 0.5 + 1;
    heart.style.fontSize = `${24 * scale}px`;

    // Độ cao bay lên: 40vh - 70vh
    const offsetY = Math.random() * 30 + 40; // 40–70
    heart.style.setProperty("--offsetY", `-${offsetY}vh`);

    container.appendChild(heart);

    heart.addEventListener("animationend", () => {
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

window.addEventListener("DOMContentLoaded", () => {
    ensureHeartsRunning();
});

function handleStart() {
  // ⛔️ chống double-click
  if (handleStart._running) return;
  handleStart._running = true;

  stopDirectedHearts(); // tắt tim bay có hướng

  // 🔊 phát nhạc nền (kèm resume AudioContext cho iOS)
  try {
    const bgAudioEl = document.getElementById('bgAudio');
    if (bgAudioEl) {
      // resume AudioContext nếu có
      if (window.AudioContext || window.webkitAudioContext) {
        try {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          if (!handleStart._ac) handleStart._ac = new Ctx();
          if (handleStart._ac.state === 'suspended') {
            handleStart._ac.resume().catch(()=>{});
          }
        } catch {}
      }
      bgAudioEl.muted = false;
      bgAudioEl.currentTime = 0;
      bgAudioEl.play().catch(err => console.warn('Không phát được audio:', err));
    }
  } catch (e) { console.warn(e); }

  const main = document.getElementById("mainContent");
  const second = document.getElementById("secondContent");

  if (typeof heartIntervalId !== "undefined" && heartIntervalId) {
    clearInterval(heartIntervalId);
    heartIntervalId = null;
  }
  main.classList.add("fade-out");

  setTimeout(() => {
    main.style.display = "none";
    second.style.display = "block";
    second.classList.add("fade-in");

    // ✅ Sau khi màn 2 đã HIỆN → đảm bảo video1 auto play trên mobile
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const v = document.querySelector('#secondContent video[data-asset="video1"]');
        if (v) {
          // gán src nếu chưa
          if (!v.src) v.src = Assets.url('video1');

          // Đảm bảo đủ điều kiện iOS
          v.muted = true;                         // property
          v.setAttribute('muted', '');            // attribute
          v.playsInline = true;
          v.setAttribute('playsinline', '');
          v.setAttribute('webkit-playsinline', '');
          v.autoplay = true;
          v.loop = true;
          v.preload = v.preload || 'metadata';

          // iOS đôi khi cần load() trước
          try { if (v.readyState === 0) v.load(); } catch {}

          v.play().catch(err => {
            console.warn('Video autoplay bị chặn, sẽ thử lại khi có tương tác:', err);
          });

          // Bảo hiểm: lần chạm/kích tiếp theo sẽ play lại nếu bị chặn
          const retryOnce = () => {
            v.play().catch(()=>{});
            document.removeEventListener('touchstart', retryOnce);
            document.removeEventListener('click', retryOnce);
          };
          document.addEventListener('touchstart', retryOnce, { once: true, passive: true });
          document.addEventListener('click', retryOnce, { once: true });
        }
      });
    });

    // Preload third.js sau 1.2s
    setTimeout(() => {
      try {
        const link = document.createElement("link");
        link.rel = "modulepreload";
        link.href = "./third.js";
        document.head.appendChild(link);
      } catch (err) {
        console.warn("Modulepreload third.js failed:", err);
      }
    }, 1200);

  }, 1500);
}
(function ensureVideoAfterTouch(){
  const playOnce = () => {
    const v = document.querySelector('#secondContent video[data-asset="video1"]');
    if (v) v.play().catch(()=>{});
    document.removeEventListener('touchstart', playOnce);
    document.removeEventListener('click', playOnce);
  };
  document.addEventListener('touchstart', playOnce, { once:true, passive:true });
  document.addEventListener('click', playOnce, { once:true });
})();

// Đưa hàm ra global
window.handleStart = handleStart;

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
                elBook.style.translate = "0% 100%"; // ép về phải
                if (nextButton) nextButton.classList.add("visible");
            } else {
                elBook.classList.remove("snap-center");
                elBook.style.removeProperty("translate");
                if (nextButton) nextButton.classList.remove("visible");
            }
        });
    });
};

document.querySelectorAll(".book").forEach(flipBook);

function isPortrait() {
    return window.innerHeight > window.innerWidth;
}

function checkOrientation() {
    const warning = document.getElementById("rotate-warning");
    const cat = document.querySelector(".meo-bantim");

    if (isPortrait()) {
        document.body.classList.add("rotate-lock");
        if (warning) warning.style.display = "flex";

        // Ẩn gif mèo (phòng CSS bị override) + dừng tim bay
        if (cat) cat.style.display = "none";
        if (typeof stopDirectedHearts === "function") stopDirectedHearts();
    } else {
        document.body.classList.remove("rotate-lock");
        if (warning) warning.style.display = "none";

        // Hiện lại gif mèo và bật tim bay khi màn 1 đang hiển thị
        if (cat) cat.style.display = "";
        if (
            typeof isMainVisible === "function" &&
            typeof startDirectedHearts === "function" &&
            isMainVisible()
        ) {
            startDirectedHearts(500);
        }
    }
}

window.addEventListener("load", checkOrientation);
window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);

// ===== Update goToThirdContent to stop hearts + start rain =====
// script.js (module)
export {}; // (để file là module; hoặc chỉ cần có 'type="module"' trong HTML)

function goToThirdContent() {
    const second = document.getElementById("secondContent");
    const third = document.getElementById("thirdContent");
    const backBtn = document.getElementById("backButton");

    // Ẩn nút Back ban đầu
    if (backBtn) {
        backBtn.classList.remove("visible");
        if (backBtnTimer) clearTimeout(backBtnTimer);
    }

    // Clear hiệu ứng trái tim nếu đang chạy
    if (typeof heartIntervalId !== "undefined" && heartIntervalId) {
        clearInterval(heartIntervalId);
        heartIntervalId = null;
    }

    // Bắt đầu fade-out giao diện 2
    second.classList.remove("fade-in");
    second.classList.add("fade-out");

    // Chờ 1.5s rồi mới ẩn giao diện 2 và hiện giao diện 3
    setTimeout(async () => {
        second.style.display = "none";

        // Hiện giao diện 3 với fade-in
        third.style.display = "flex";
        third.classList.remove("fade-out");
        third.classList.add("fade-in");

        // Nạp code giao diện 3
        const mod = await import("./third.js");
        thirdModuleRef = mod;
        mod.startContentRain();
        mod.startMediaRain();

        // Hiện nút Back sau 10s
        if (backBtn) {
            backBtnTimer = setTimeout(() => {
                backBtn.classList.add("visible");
            }, 10000);
        }
    }, 1500); // khớp với thời gian fade-out
}
window.goToThirdContent = goToThirdContent;

// ===== Tim bay có hướng (chỉ cho giao diện 1) =====
let heartTimer = null;
let directedHeartsEnabled = false; // cờ cho phép ở màn 1

function isMainVisible() {
    const main = document.getElementById("mainContent");
    return (
        main &&
        getComputedStyle(main).display !== "none" &&
        !main.classList.contains("fade-out")
    );
}

function elementsReady() {
    const cat = document.querySelector(".meo-bantim");
    const btn = document.querySelector(".start-button");
    if (!cat || !btn || !isMainVisible()) return false;
    const rc = cat.getBoundingClientRect();
    const rb = btn.getBoundingClientRect();
    return rc.width > 0 && rc.height > 0 && rb.width > 0 && rb.height > 0;
}

function startDirectedHearts(intervalMs = 500) {
    if (heartTimer) return;
    directedHeartsEnabled = true;

    // 1) BẮN NGAY LẬP TỨC 2 TIM ĐẦU
    spawnDirectedHeart();
    setTimeout(spawnDirectedHeart, 150);

    // 2) SAU ĐÓ mới vào chu kỳ: mỗi lượt bắn 2 tim
    heartTimer = setInterval(() => {
        if (!directedHeartsEnabled || !elementsReady()) return;
        spawnDirectedHeart();
        setTimeout(() => {
            if (directedHeartsEnabled && elementsReady()) spawnDirectedHeart();
        }, 150);
    }, intervalMs);
}

function stopDirectedHearts() {
    directedHeartsEnabled = false;
    if (heartTimer) {
        clearInterval(heartTimer);
        heartTimer = null;
    }
}

// Bảo vệ trong chính hàm spawn (nếu timer chưa kịp tắt)
function spawnDirectedHeart() {
    if (!directedHeartsEnabled || !isMainVisible()) return;

    const cat = document.querySelector(".meo-bantim");
    const btn = document.querySelector(".start-button");
    if (!cat || !btn) return;

    // 1) Tọa độ start (s) và end (e)
    const rCat = cat.getBoundingClientRect();
    const rBtn = btn.getBoundingClientRect();
    const sx = rCat.left + rCat.width / 2 + 25;
    const sy = rCat.top + rCat.height / 2 + 10;
    const ex = rBtn.left + rBtn.width / 2 - 60;
    const ey = rBtn.top + rBtn.height / 2;

    // 2) Control point (c) đặt ở giữa, nhích về phía end và "nâng" lên trên
    const dx = ex - sx,
        dy = ey - sy;
    const dist = Math.hypot(dx, dy) || 1;
    const mx = sx + dx * 0.5,
        my = sy + dy * 0.5; // trung điểm
    const CURVE_TOWARD = 0.15; // kéo CP về phía đích
    const LIFT = Math.min(180, Math.max(70, dist * 0.28)); // độ nâng vòng cung (px)
    const cx = mx + dx * CURVE_TOWARD;
    const cy = my - LIFT; // 🔺 nâng lên trên (y giảm)

    // 3) Tạo node trái tim, hiển thị ngay tại điểm bắt đầu
    const heart = document.createElement("div");
    heart.className = "heart-flight";
    heart.textContent = "❤️";
    heart.style.fontSize = `${28 * (1.05 + Math.random() * 0.6)}px`;
    heart.style.transform = `translate(${sx}px, ${sy}px) translate(-50%,-50%) scale(0.9)`;
    heart.style.opacity = "1";
    document.body.appendChild(heart);

    // 4) Bezier bậc 2 + easing
    const quad = (t, p0, p1, p2) =>
        (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
    const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    // Thời lượng theo quãng đường (mượt, tự nhiên)
    const pxPerSec = 1000; // tốc độ “ảo”
    const dur = Math.max(800, Math.min(1700, (dist / pxPerSec) * 1000));
    const t0 = performance.now();

    function step(now) {
        if (!directedHeartsEnabled || !isMainVisible()) {
            heart.remove();
            return;
        }

        let t = (now - t0) / dur;
        if (t > 1) t = 1;

        const te = easeInOutQuad(t);
        const x = quad(te, sx, cx, ex);
        const y = quad(te, sy, cy, ey);

        const s = 0.9 + te * 0.22;
        heart.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%) scale(${s})`;
        heart.style.opacity = String(1 - te * 0.18);

        if (t < 1) {
            requestAnimationFrame(step);
        } else {
            heart.animate(
                [
                    { transform: heart.style.transform, opacity: 0.85 },
                    {
                        transform: heart.style.transform + " scale(0.6)",
                        opacity: 0,
                    },
                ],
                { duration: 220, easing: "ease-out" }
            ).onfinish = () => heart.remove();
        }
    }
    requestAnimationFrame(step);
}

// Hạ ưu tiên mặc định cho media màn 2 (sẽ nâng lại cho trang đang xem)
function setDefaultBookMediaPriority() {
    document.querySelectorAll("#secondContent img").forEach((img) => {
        img.loading = "lazy";
        img.decoding = "async";
        img.setAttribute("fetchpriority", "low");
    });
document.querySelectorAll('#secondContent video').forEach(v => {
  if (v.dataset.asset === 'video1') {
    v.preload = 'metadata'; // hoặc 'auto'
  } else {
    if (!v.preload) v.preload = 'none';
  }
});
}
document.addEventListener("DOMContentLoaded", setDefaultBookMediaPriority);

// --- START - Vùng nhấp xem ảnh --- */
import { Assets } from "./assets.js";

/**
 * Dùng rectPct: [left%, top%, width%, height%]
 * -> mọi giá trị là SỐ phần trăm (0..100), không kèm dấu %
 */
const HOTSPOTS = [
    {
        pageSelector: '.back:has([data-asset="book1"])',
        items: [
            { rectPct: [15, 11, 20, 24], asset: "img37" },
            { rectPct: [39, 11, 20, 24], asset: "img17" },
            { rectPct: [63, 11, 20, 24], asset: "img14" },
            { rectPct: [87, 11, 20, 24], asset: "img26" },

            { rectPct: [4,  38, 20, 24], asset: "img4" },
            { rectPct: [28, 38, 20, 24], asset: "img20" },
            { rectPct: [52, 38, 20, 24], asset: "img41" },
            { rectPct: [76, 38, 20, 24], asset: "img36" },

            { rectPct: [15, 65, 20, 24], asset: "img30" },
            { rectPct: [39, 65, 20, 24], asset: "img16" },
            { rectPct: [63, 65, 20, 24], asset: "img13" },
            { rectPct: [87, 65, 20, 24], asset: "img32" },
        ],
    },
    {
        pageSelector: '.front:has([data-asset="book2"])',
        items: [
            { rectPct: [9,  25, 28, 23], asset: "img56" },
            { rectPct: [15, 50, 23, 37], asset: "img54" },
            { rectPct: [39, 43, 22, 38], asset: "img55" },
            { rectPct: [63, 22, 22, 37], asset: "img37" },
            { rectPct: [64, 61, 29, 22], asset: "img41" },
        ],
    },
    {
        pageSelector: '.back:has([data-asset="book3"])',
        items: [
            { rectPct: [10, 12, 17, 23], asset: "img64" },
            { rectPct: [31, 12, 17, 23], asset: "img62" },
            { rectPct: [52, 12, 17, 23], asset: "img59" },
            { rectPct: [73, 12, 17, 23], asset: "img58" },

            { rectPct: [10, 38, 17, 23], asset: "img48" },
            { rectPct: [52, 38, 17, 23], asset: "img53" },
            { rectPct: [73, 38, 17, 23], asset: "img49" },

            { rectPct: [10, 65, 17, 23], asset: "img44" },
            { rectPct: [31, 65, 17, 23], asset: "img29" },
            { rectPct: [52, 65, 17, 23], asset: "img13" },
            { rectPct: [73, 65, 17, 23], asset: "img11" },
        ],
    },
    {
        pageSelector: '.front:has([data-asset="book4"])',
        items: [
            { rectPct: [65,  9, 28, 23], asset: "img20" },
            { rectPct: [67, 38, 28, 23], asset: "img12" },
            { rectPct: [69, 68, 28, 23], asset: "img26" },
        ],
    },
    {
        pageSelector: '.back:has([data-asset="book5"])',
        items: [
            { rectPct: [16, 13, 10, 13], asset: "img72" },
            { rectPct: [27, 9, 12, 17], asset: "img73" },
            { rectPct: [40, 15, 9, 12], asset: "img71" },
            { rectPct: [53, 15, 11, 11], asset: "img56" },
            { rectPct: [64, 9, 10, 20], asset: "img70" },
            { rectPct: [74, 10, 9, 13], asset: "img69" },
            { rectPct: [11, 26, 13, 8], asset: "img67" },
            { rectPct: [25, 26, 12, 8], asset: "img60" },
            { rectPct: [37, 26, 13, 12], asset: "img68" },
            { rectPct: [51, 26, 13, 12], asset: "img65" },
            { rectPct: [74, 23, 14, 7], asset: "img55" },
            { rectPct: [10, 34, 16, 14], asset: "img37" },
            { rectPct: [26, 34, 11, 14], asset: "img36" },
            { rectPct: [64, 29, 17, 14], asset: "img57" },
            { rectPct: [80, 29, 10, 14], asset: "img47" },
            { rectPct: [13, 48, 7, 10], asset: "img29" },
            { rectPct: [20, 48, 17, 18], asset: "img9" },
            { rectPct: [64, 42, 16, 13], asset: "img62" },
            { rectPct: [80, 42, 8, 13], asset: "img16" },
            { rectPct: [28, 65, 8, 7], asset: "img17" },
            { rectPct: [37, 62, 17, 12], asset: "img21" },
            { rectPct: [54, 62, 10, 12], asset: "img18" },
            { rectPct: [64, 55, 10, 12], asset: "img25" },
            { rectPct: [73, 55, 10, 9], asset: "img14" },
            { rectPct: [40, 75, 10, 10], asset: "img45" },
            { rectPct: [50, 75, 10, 10], asset: "img58" },
            { rectPct: [45, 85, 10, 8], asset: "img44" },
        ],
    },
    {
        pageSelector: '.front:has([data-asset="book6"])',
        items: [
            { rectPct: [10, 10, 28, 33], asset: "img41" },
            { rectPct: [60, 10, 33, 40], asset: "img70" },
            { rectPct: [37, 30, 23, 36], asset: "img56" },
            { rectPct: [10, 48, 28, 36], asset: "img40" },
            { rectPct: [57, 50, 33, 36], asset: "img48" },
        ],
    },
    {
        pageSelector: '.back:has([data-asset="book7"])',
        items: [
            { rectPct: [15, 19, 22, 37], asset: "img39" },
            { rectPct: [64, 19, 15, 32], asset: "img18" },
            { rectPct: [38, 28, 25, 44], asset: "img21" },
            { rectPct: [64, 55, 28, 25], asset: "img46" },
        ],
    },
    {
        pageSelector: '.front:has([data-asset="book8"])',
        items: [
            { rectPct: [5, 36, 27, 37], asset: "img12" },
            { rectPct: [38, 45, 24, 30], asset: "img19" },
            { rectPct: [67, 40, 27, 30], asset: "img6" },
        ],
    },
    {
        pageSelector: '.back:has([data-asset="book9"])',
        items: [
            { rectPct: [18, 24, 19, 30], asset: "img8" },
            { rectPct: [38, 18, 24, 16], asset: "img26" },
            { rectPct: [63, 22, 19, 19], asset: "img59" },
            { rectPct: [18, 55, 19, 22], asset: "img2" },
            { rectPct: [38, 35, 24, 36], asset: "img6" },
            { rectPct: [63, 40, 19, 22], asset: "img10" },
        ],
    },
    {
        pageSelector: '.front:has([data-asset="book10"])',
        items: [
            { rectPct: [29, 14, 33, 27], asset: "img67" },
            { rectPct: [38, 43, 25, 38], asset: "img19" },
        ],
    },
    {
        pageSelector: '.back:has([data-asset="book11"])',
        items: [{ rectPct: [50, 50, 30, 25], asset: "thutay" }],
    },
    {
        pageSelector: '.back:has([data-asset="book12"])',
        items: [
            { rectPct: [20, 25, 25, 30], asset: "img74" },
            { rectPct: [25, 60, 27, 30], asset: "img75" },
            { rectPct: [45, 40, 20, 20], asset: "img76" },
            { rectPct: [63,  0, 25, 40], asset: "img77" },
            { rectPct: [65, 40, 25, 38], asset: "img78" },
            { rectPct: [50, 78, 40, 38], asset: "img79" },
        ],
        
    },
]; /*[ left  , top   , width  , height ] */

/* Lightbox (giữ nguyên nếu bạn đã có) */
function openLightbox(assetName, opts = {}) {
  const box = document.getElementById('asset-lightbox');
  if (!box) return;
  const img = box.querySelector('img');
  const cap = document.getElementById('asset-caption');
  const closeBtn = box.querySelector('.close');

  // reset
  box.classList.remove('closing');
  img.classList.remove('show', 'rounded');
  cap?.classList.remove('on-rounded');

  // gán src/alt
  img.src = Assets.url(assetName);
  img.alt = assetName;

  // caption + typewriter (giữ \n)
  if (cap) {
    const text = (typeof CAPTIONS !== 'undefined' && CAPTIONS[assetName]) ? CAPTIONS[assetName] : "";
    cap.classList.toggle('has-text', !!text);
    if (text) {
      typeCaption(cap, text, 22);    // bạn đã có hàm typeCaption(...)
    } else {
      stopTypeCaption?.();
      cap.innerHTML = "";
    }
  }

  // bo góc nếu yêu cầu
  if (opts.rounded) {
    img.classList.add('rounded');
    cap?.classList.add('on-rounded');
  }

  // mở overlay
  box.classList.add('open');

  // 🛡️ miễn nhiễm click/keyup “lọt” vào overlay trong 300ms
  box.dataset.justOpened = '1';
  setTimeout(() => { delete box.dataset.justOpened; }, 300);

  // đưa focus về nút close (tránh phím Space kích hoạt lại button hotspot)
  closeBtn?.focus({ preventScroll: true });

  // bật fade-in ở frame kế tiếp
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      img.classList.add('show');
    });
  });
}

function closeLightbox(){
  const box = document.getElementById('asset-lightbox');
  if (!box) return;
  const img = box.querySelector('img');
  const cap = document.getElementById('asset-caption');

  img.classList.remove('show');

  const done = () => {
    box.classList.remove('open');
    img.src = '';
    img.classList.remove('rounded');       // <-- dọn class
    cap?.classList.remove('on-rounded');   // <-- dọn class
    img.removeEventListener('transitionend', done);
  };

  const t = setTimeout(done, 350);
  img.addEventListener('transitionend', () => { clearTimeout(t); done(); }, { once:true });
}
  
let _lbIgnoreUntil = 0;

function wireLightbox() {
  const box = document.getElementById('asset-lightbox');
  if (!box || box.dataset.wired) return;
  box.dataset.wired = '1';

  // chặn đóng khi bấm vào nội dung bên trong (img/figure/caption)
  const fig = box.querySelector('.lightbox-figure') || box;
  fig.addEventListener('click', (e) => e.stopPropagation(), { capture: true });

  // chỉ đóng khi bấm nền tối hoặc nút close
  box.addEventListener('click', (e) => {
    // miễn nhiễm click ngay sau khi mở
    if (Date.now() < _lbIgnoreUntil) return;

    if (e.target === box || e.target.closest('.close')) {
      closeLightbox();
    }
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  }, { passive: true });
}


function setupHotspotsPercent() {
    wireLightbox();

    HOTSPOTS.forEach((cfg) => {
        const page = document.querySelector(cfg.pageSelector);
        if (!page) return;

        if (getComputedStyle(page).position === "static") {
            page.style.position = "relative";
        }

        // Tránh tạo trùng
        if (page.dataset.hotspotsReady === "1") return;

        // Tạo hàng loạt bằng DocumentFragment (nhanh hơn)
        const frag = document.createDocumentFragment();

        cfg.items.forEach(({ rectPct, asset }) => {
            const [l, t, w, h] = rectPct;
            const spot = document.createElement("button");
            spot.type = "button";
            spot.className = "hotspot";
            spot.style.left = `${l}%`;
            spot.style.top = `${t}%`;
            spot.style.width = `${w}%`;
            spot.style.height = `${h}%`;
            spot.dataset.asset = asset; // dùng cho delegation
            spot.setAttribute("aria-label", `Xem ${asset}`);
            frag.appendChild(spot);
        });

        page.appendChild(frag);
        page.dataset.hotspotsReady = "1";

        // ✅ Event delegation: chỉ 1 listener cho cả trang
page.addEventListener('pointerup', (e) => {
  const btn = e.target.closest('.hotspot');
  if (!btn || !page.contains(btn)) return;
  e.preventDefault();      // chặn click “ảo” sau touchend
  e.stopPropagation();
  openLightbox(btn.dataset.asset, { rounded: true });
}, { passive: false });
    });
}

window.addEventListener("load", setupHotspotsPercent);
// --- END - Vùng nhấp xem ảnh --- */

// --- START - Nút BACK --- */
let backBtnTimer = null;
let thirdModuleRef = null; // lưu module third.js để dừng hiệu ứng khi back

function backToSecondContent() {
    const second = document.getElementById("secondContent");
    const third = document.getElementById("thirdContent");
    const backBtn = document.getElementById("backButton");

    // clear & ẩn nút Back
    if (backBtnTimer) {
        clearTimeout(backBtnTimer);
        backBtnTimer = null;
    }
    if (backBtn) {
        backBtn.classList.remove("visible");
    }

    // dừng hiệu ứng mưa nếu có
    try {
        if (thirdModuleRef) {
            thirdModuleRef.stopContentRain?.();
            thirdModuleRef.stopMediaRain?.();
        }
    } catch (e) {
        /* ignore */
    }

    third.classList.add("fade-out");
    setTimeout(() => {
        third.style.display = "none";
        second.style.display = "block";
        second.classList.add("fade-in");
    }, 800);
}

window.addEventListener("load", () => {
    const backBtn = document.getElementById("backButton");
    if (backBtn) {
        backBtn.addEventListener("click", backToSecondContent);
    }
});

// --- END - Nút BACK --- */

// --- START - NỘI DUNG --- */
let _captionTypeTimer = null;

function stopTypeCaption() {
  if (_captionTypeTimer) {
    clearTimeout(_captionTypeTimer);
    _captionTypeTimer = null;
  }
}

// (tuỳ chọn) escape để an toàn nếu text có kí tự HTML đặc biệt
function _escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, m => (
    { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m]
  ));
}

/**
 * Gõ chữ vào phần tử caption theo kiểu typewriter.
 * - Tự chuyển \n -> <br>
 * - speed: ms/ký tự (mặc định 22ms)
 */
function typeCaption(el, text, speed = 30) {
  stopTypeCaption();
  el.innerHTML = "";
  const safe = _escapeHTML(text || "");
  let i = 0;

  const step = () => {
    el.innerHTML = safe.slice(0, i).replace(/\n/g, "<br>");
    i++;
    if (i <= safe.length) {
      _captionTypeTimer = setTimeout(step, speed);
    } else {
      _captionTypeTimer = null;
    }
  };

  step();
}
// --- END - NỘI DUNG --- */
