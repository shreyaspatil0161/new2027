// ==========================================
// 1. SYNTHESIZED FIREWORK SOUND ENGINE
// ==========================================
let soundEnabled = false;
let audioCtx = null;

const soundToggleBtn = document.getElementById("sound-toggle");

soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        soundToggleBtn.innerText = "🔊 Sound On";
    } else {
        soundToggleBtn.innerText = "🔇 Sound Off";
    }
});

function playExplosionSound() {
    if (!soundEnabled || !audioCtx) return;

    const bufferSize = audioCtx.sampleRate * 0.4;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.4);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start();
}

// ==========================================
// 2. PERSONALIZED SENDER NAME FROM URL
// ==========================================
const urlParams = new URLSearchParams(window.location.search);
const senderName = urlParams.get("from");
const senderBadge = document.getElementById("sender-badge");

if (senderName) {
    senderBadge.innerText = `🎊 Warm Wishes from ${senderName} 🎊`;
    senderBadge.classList.remove("hidden");
}

const nameInput = document.getElementById("name-input");
const shareBtn = document.getElementById("share-btn");
const copyStatus = document.getElementById("copy-status");

shareBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) {
        copyStatus.innerText = "Please enter your name first!";
        return;
    }

    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?from=${encodeURIComponent(name)}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
        copyStatus.innerText = `Link copied! Send it to your friends to show wishes from ${name}.`;
        senderBadge.innerText = `🎊 Warm Wishes from ${name} 🎊`;
        senderBadge.classList.remove("hidden");
    });
});

// ==========================================
// 3. COUNTDOWN TIMER LOGIC
// ==========================================
const targetDate = new Date("January 1, 2027 00:00:00").getTime();

const timer = setInterval(function () {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days < 10 ? "0" + days : days;
    document.getElementById("hours").innerText = hours < 10 ? "0" + hours : hours;
    document.getElementById("minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
    document.getElementById("seconds").innerText = seconds < 10 ? "0" + seconds : seconds;

    if (distance < 0) {
        clearInterval(timer);
        document.getElementById("main-heading").innerText = "🎉 Happy New Year 2027! 🎉";
        document.getElementById("countdown").innerHTML = "<h2>Welcome to 2027! Let the celebrations begin!</h2>";
        triggerMegaFireworks();
    }
}, 1000);

// ==========================================
// 4. NEW YEAR WISHES LOGIC
// ==========================================
const wishes = [
    "May 2027 bring you endless opportunities, good health, and happiness!",
    "Wishing you 12 months of success, 52 weeks of laughter, and 365 days of joy in 2027.",
    "Cheers to a new year and another chance for us to get it right. Happy New Year 2027!",
    "May your dreams take flight and your worries fade away in the coming year.",
    "Sending warm wishes to you and your family for a bright and prosperous 2027!",
    "Out with the old, in with the new! May 2027 be your brightest year yet."
];

const wishText = document.getElementById("wish-text");
const newWishBtn = document.getElementById("new-wish-btn");
const burstBtn = document.getElementById("burst-btn");

newWishBtn.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * wishes.length);
    wishText.innerText = wishes[randomIndex];
    launchRocket();
});

burstBtn.addEventListener("click", triggerMegaFireworks);

function triggerMegaFireworks() {
    for (let i = 0; i < 6; i++) {
        setTimeout(() => launchRocket(), i * 220);
    }
}

// ==========================================
// 5. ROCKETS & FIRECRACKERS ENGINE
// ==========================================
const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
let rockets = [];
const colors = ["#ffd700", "#ff4d4d", "#00ffcc", "#ff66ff", "#ffffff", "#ffae00", "#33ccff"];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Rocket {
    constructor(targetX, targetY) {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.targetX = targetX || Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
        this.targetY = targetY || Math.random() * (canvas.height * 0.45) + 50;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speed = 7;
        const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.exploded = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.y <= this.targetY) {
            this.exploded = true;
            createExplosion(this.x, this.y, this.color);
        }
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5.5 + 1.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.012;
        this.gravity = 0.05;
    }

    update() {
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }
}

function createExplosion(x, y, color) {
    playExplosionSound();
    for (let i = 0; i < 55; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function launchRocket(targetX, targetY) {
    rockets.push(new Rocket(targetX, targetY));
}

function animate() {
    ctx.fillStyle = "rgba(0, 20, 44, 0.22)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = rockets.length - 1; i >= 0; i--) {
        rockets[i].update();
        rockets[i].draw();
        if (rockets[i].exploded) {
            rockets.splice(i, 1);
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

setInterval(() => {
    launchRocket();
}, 1400);

window.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON" && e.target.tagName !== "INPUT") {
        launchRocket(e.clientX, e.clientY);
    }
});

animate();
