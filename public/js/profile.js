/* ===== Slezzi — Public Profile Renderer ===== */

// ── SVG Icons (no emojis) ──
const SVG_ICONS = {
  discord:   `<svg viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>`,
  twitter:   `<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  github:    `<svg viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`,
  tiktok:    `<svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
  youtube:   `<svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  twitch:    `<svg viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>`,
  steam:     `<svg viewBox="0 0 24 24"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.455 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z"/></svg>`,
  spotify:   `<svg viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`,
  website:   `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
  email:     `<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
  link:      `<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`
};

// Platforms that show as ICON buttons (round, no label) vs full link buttons
const ICON_ONLY_PLATFORMS = new Set(['discord','twitter','github','instagram','tiktok','youtube','twitch','steam','spotify']);

// Read injected profile data
let profileData = null;
try {
  profileData = JSON.parse(document.getElementById('profile-data').textContent);
} catch(e) { showNotFound(); }

if (profileData) { renderProfile(profileData); initParticles(); initCursor(); }

// ── CURSOR GLOW ──
function initCursor() {
  const glow = document.getElementById('cursor-glow');
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

// ── RENDER ──
function renderProfile(data) {
  const { username, profile: p } = data;
  document.title = `${p.displayName || username} — Slezzi.bio`;

  // Background
  const bg = document.getElementById('bgGrad');
  const c1 = p.background?.color1 || '#a855f7';
  const c2 = p.background?.color2 || '#3b82f6';
  const dir = p.background?.direction || '135deg';
  bg.style.background = `linear-gradient(${dir}, ${c1}, ${c2})`;

  const container = document.getElementById('profileContainer');

  // ── Profile card ──
  const iconLinks  = (p.links||[]).filter(l => l.url && ICON_ONLY_PLATFORMS.has(l.platform));
  const fullLinks  = (p.links||[]).filter(l => l.url && !ICON_ONLY_PLATFORMS.has(l.platform));

  const iconLinksHtml = iconLinks.map(l => `
    <a class="icon-btn" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" title="${esc(l.label||l.platform)}">
      ${SVG_ICONS[l.platform] || SVG_ICONS.link}
    </a>`).join('');

  const fullLinksHtml = fullLinks.map(l => `
    <a class="link-btn" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">
      ${SVG_ICONS[l.platform] || SVG_ICONS.link}
      <span class="link-btn-label">${esc(l.label || l.url)}</span>
      <span class="link-btn-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></span>
    </a>`).join('');

  const avatarContent = p.avatarUrl
    ? `<img src="${esc(p.avatarUrl)}" alt="avatar" onerror="this.outerHTML='👤'" />`
    : `<svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" width="40" height="40"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`;

  const card = document.createElement('div');
  card.className = 'profile-card';
  card.innerHTML = `
    <div class="card-header" id="cardHeader" style="background:linear-gradient(${dir},${c1},${c2})">
      <div class="views-badge">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
        ${p.views || 0}
      </div>
      <div class="avatar-wrap">
        <div class="avatar-outer">
          <div class="avatar-inner">${avatarContent}</div>
        </div>
      </div>
    </div>
    <div class="card-body">
      <div class="display-name">${esc(p.displayName || username)}</div>
      <div class="username-tag">@${esc(username)}</div>
      ${p.bio ? `<div class="bio">${esc(p.bio)}</div>` : ''}
      ${iconLinksHtml ? `<div class="icon-links">${iconLinksHtml}</div>` : ''}
      ${fullLinksHtml ? `<div class="link-btns">${fullLinksHtml}</div>` : ''}
    </div>
  `;
  container.appendChild(card);

  // ── Music card ──
  if (p.music?.title || p.music?.url) {
    const mc = document.createElement('div');
    mc.className = 'music-card';
    mc.innerHTML = `
      <div class="music-top">
        <div class="music-art" id="musicArt">${SVG_ICONS.spotify}</div>
        <div class="music-meta">
          <div class="music-title">${esc(p.music.title || 'Unknown Track')}</div>
          <div class="music-sub" id="musicSub">Klicke Play</div>
        </div>
      </div>
      <div class="music-bottom">
        <div class="m-vol-icon">${SVG_ICONS.spotify.replace('viewBox="0 0 24 24"','viewBox="0 0 24 24" width="14" height="14"')}</div>
        <div class="m-progress-wrap">
          <div class="m-progress-track" id="mTrack" onclick="seekAudio(event)">
            <div class="m-progress-fill" id="mFill"></div>
            <div class="m-progress-thumb" id="mThumb"></div>
          </div>
          <div class="m-times"><span id="mElapsed">0:00</span><span id="mDur">0:00</span></div>
        </div>
        <div class="m-controls">
          <button class="m-btn" onclick="prevTrack()" title="Restart">
            <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button class="m-btn play-main" id="playBtn" onclick="togglePlay()">
            <svg id="playIcon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button class="m-btn" onclick="nextTrack()" title="End">
            <svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zm2.5-6l5.5 4v-8l-5.5 4zm7.5 6h2V6h-2v12z"/></svg>
          </button>
        </div>
      </div>
    `;
    container.appendChild(mc);
    if (p.music.url) initAudio(p.music.url);
  }

  // ── Footer ──
  const footer = document.createElement('div');
  footer.className = 'slezzi-footer';
  footer.innerHTML = `Powered by <a href="/">✦ Slezzi.bio</a> &nbsp;·&nbsp; <a href="/register">Erstelle dein Profil →</a>`;
  container.appendChild(footer);
}

// ── AUDIO PLAYER ──
let audio = null, playing = false;
function initAudio(url) {
  audio = new Audio(url);
  audio.preload = 'metadata';
  audio.addEventListener('loadedmetadata', () => {
    document.getElementById('mDur').textContent = fmt(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    const pct = audio.duration ? audio.currentTime / audio.duration * 100 : 0;
    document.getElementById('mFill').style.width = pct + '%';
    document.getElementById('mThumb').style.left = pct + '%';
    document.getElementById('mElapsed').textContent = fmt(audio.currentTime);
  });
  audio.addEventListener('ended', () => { setPlay(false); });
}
function togglePlay() {
  if (!audio) return;
  playing ? audio.pause() : audio.play().catch(()=>{});
  setPlay(!playing);
}
function setPlay(v) {
  playing = v;
  const icon = document.getElementById('playIcon');
  const art  = document.getElementById('musicArt');
  if (icon) icon.innerHTML = v ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>' : '<path d="M8 5v14l11-7z"/>';
  if (art)  { art.classList.toggle('playing', v); document.getElementById('musicSub').textContent = v ? 'Wird abgespielt' : 'Pausiert'; }
}
function prevTrack() { if (audio) { audio.currentTime = 0; } }
function nextTrack()  { if (audio) { audio.currentTime = audio.duration || 0; } }
function seekAudio(e) {
  if (!audio || !audio.duration) return;
  const t = document.getElementById('mTrack');
  const r = t.getBoundingClientRect();
  audio.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * audio.duration;
}
function fmt(s) {
  if (!isFinite(s)) return '0:00';
  return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
}

// ── PARTICLES ──
function initParticles() {
  const cv = document.getElementById('particles-canvas');
  const cx = cv.getContext('2d');
  let W, H, pts = [];
  const resize = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
  addEventListener('resize', resize); resize();
  for (let i=0; i<70; i++) pts.push(mkPt(W,H));
  function mkPt(W,H) {
    return { x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35-.15,
      r:Math.random()*1.8+.4, o:Math.random()*.45+.08, life:1,
      decay:Math.random()*.0025+.0008 };
  }
  (function loop() {
    cx.clearRect(0,0,W,H);
    pts.forEach(p => {
      p.x+=p.vx; p.y+=p.vy; p.life-=p.decay;
      if(p.life<=0||p.y<-5) Object.assign(p, mkPt(W,H), {y:H+5});
      cx.beginPath(); cx.arc(p.x,p.y,p.r,0,Math.PI*2);
      cx.fillStyle=`rgba(255,255,255,${p.o*p.life})`; cx.fill();
    });
    requestAnimationFrame(loop);
  })();
}

function showNotFound() {
  document.body.innerHTML = `<div class="not-found"><h1>404</h1><p>Profil nicht gefunden</p><a href="/" style="color:#a855f7;margin-top:16px;display:inline-block;">← Zurück zu Slezzi.bio</a></div>`;
}
function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
