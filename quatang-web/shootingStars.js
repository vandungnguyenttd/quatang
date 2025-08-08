// shootingStars.js
export function initShootingStars(canvas, userOptions = {}) {
  const ctx = canvas.getContext('2d');
  let rafId = null;
  let tickId = null;
  let running = false;

  const shootingStars = [];

  const opts = {
    angle: Math.PI / 4,         // Góc bay ~45°
    minLength: 150,
    maxLength: 400,
    minSpeed: 5,
    maxSpeed: 12,
    thickness: 2.5,
    spawnInterval: 1500,
    opacityDecay: 0.005,
    maxYRatio: 0.5,             // Chỉ sinh trong nửa trên
    minTravelRatio: 0.3,        // Tối thiểu bay qua 30% chiều rộng
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
        startX = -100; // bắt đầu ngoài rìa trái
        startY = Math.random() * height * opts.maxYRatio;
      } else {
        startX = Math.random() * width;
        startY = -100; // bắt đầu ngoài rìa trên
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
    createShootingStar(); // đảm bảo luôn có 1 sao băng
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
