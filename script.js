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
