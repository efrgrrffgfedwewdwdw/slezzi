/* ===== Slezzi Dashboard — Ultra Edition ===== */

if (!getToken()) { window.location.href = '/login'; }

const PLATFORMS = {
  discord:   { label: 'Discord' },   twitter:   { label: 'Twitter / X' },
  github:    { label: 'GitHub' },    instagram: { label: 'Instagram' },
  tiktok:    { label: 'TikTok' },    youtube:   { label: 'YouTube' },
  twitch:    { label: 'Twitch' },    steam:     { label: 'Steam' },
  spotify:   { label: 'Spotify' },   website:   { label: 'Website' },
  email:     { label: 'Email' }
};

let profileState = {
  displayName: '', bio: '', avatarUrl: '', songCover: '', badge: '', effects: 'particles', avatarRing: 'ring-gradient',
  background: { color1: '#a855f7', color2: '#3b82f6', direction: '135deg', imageUrl: '', blur: 0 },
  links: [], music: { title: '', url: '' },
  discord: { username: '', userId: '', serverName: '', inviteUrl: '' },
  views: 0
};

let profileUrl = '';
const previewAudioEl = document.getElementById('previewAudio');
let isPreviewPlaying = false;

// ── URL setup ──
const username = getUsername();
if (username) {
  profileUrl = `${location.origin}/${username}`;
  const lnk = document.getElementById('profileUrlLink');
  if (lnk) { lnk.textContent = `${location.host}/${username}`; lnk.href = profileUrl; }
  const vl = document.getElementById('viewProfileLink');
  if (vl) vl.href = profileUrl;
  const un = document.getElementById('previewUsername');
  if (un) un.textContent = `@${username}`;
}

// ── Logout ──
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('bl_token'); localStorage.removeItem('bl_username');
  window.location.href = '/';
});

// ── Load profile ──
async function loadProfile() {
  const res = await authFetch('/api/me');
  if (!res) return;
  const data = await res.json();
  if (!res.ok) return;
  profileState = { ...profileState, ...data.profile };
  if (!profileState.background) profileState.background = { color1:'#a855f7', color2:'#3b82f6', direction:'135deg', imageUrl:'', blur:0 };

  const g = id => document.getElementById(id);
  g('displayName').value        = profileState.displayName || '';
  g('bio').value                = profileState.bio || '';
  g('avatarUrl').value          = profileState.avatarUrl || '';
  g('songCover').value          = profileState.songCover || '';
  g('bgColor1').value           = profileState.background.color1 || '#a855f7';
  g('bgColor1Text').value       = profileState.background.color1 || '#a855f7';
  g('bgColor2').value           = profileState.background.color2 || '#3b82f6';
  g('bgColor2Text').value       = profileState.background.color2 || '#3b82f6';
  g('bgDirection').value        = profileState.background.direction || '135deg';
  g('bgImageUrl').value         = profileState.background.imageUrl || '';
  g('bgBlur').value             = profileState.background.blur || 0;
  g('bgBlurVal').textContent    = profileState.background.blur || 0;
  g('profileEffect').value      = profileState.effects || 'particles';
  g('avatarRing').value         = profileState.avatarRing || 'ring-gradient';
  g('profileBadge').value       = profileState.badge || '';
  g('musicTitle').value         = profileState.music?.title || '';
  g('musicUrl').value           = profileState.music?.url || '';
  const d = profileState.discord || {};
  g('discordUsername').value    = d.username || '';
  g('discordUserId').value      = d.userId || '';
  g('discordServerName').value  = d.serverName || '';
  g('discordInviteUrl').value   = d.inviteUrl || '';

  updateBioCount(); renderLinks(); updatePreview();
}

// ── Bio counter ──
document.getElementById('bio').addEventListener('input', updateBioCount);
function updateBioCount() {
  const v = document.getElementById('bio').value;
  document.getElementById('bioCount').textContent = `${v.length}/150`;
}

// ── Blur slider live label ──
document.getElementById('bgBlur').addEventListener('input', function() {
  document.getElementById('bgBlurVal').textContent = this.value;
  collectAndPreview();
});

// ── All live-preview inputs ──
['displayName','bio','avatarUrl','songCover','bgColor1','bgColor2','bgDirection',
 'bgImageUrl','profileEffect','avatarRing','profileBadge',
 'musicTitle','musicUrl','discordUsername','discordUserId','discordServerName','discordInviteUrl'
].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', collectAndPreview);
  if (el && el.tagName === 'SELECT') el.addEventListener('change', collectAndPreview);
});

// ── Color picker sync ──
['1','2'].forEach(n => {
  document.getElementById(`bgColor${n}`).addEventListener('input', function() {
    document.getElementById(`bgColor${n}Text`).value = this.value; collectAndPreview();
  });
  document.getElementById(`bgColor${n}Text`).addEventListener('input', function() {
    if (/^#[0-9a-fA-F]{6}$/.test(this.value)) {
      document.getElementById(`bgColor${n}`).value = this.value; collectAndPreview();
    }
  });
});

// ── Collect state ──
function collectAndPreview() {
  const g = id => document.getElementById(id)?.value || '';
  profileState.displayName  = g('displayName').trim();
  profileState.bio          = g('bio');
  profileState.avatarUrl    = g('avatarUrl').trim();
  profileState.songCover    = g('songCover').trim();
  profileState.effects      = g('profileEffect') || 'particles';
  profileState.avatarRing   = g('avatarRing') || 'ring-gradient';
  profileState.badge        = g('profileBadge');
  profileState.background   = {
    color1:   g('bgColor1'),
    color2:   g('bgColor2'),
    direction: g('bgDirection'),
    imageUrl: g('bgImageUrl').trim(),
    blur:     Number(document.getElementById('bgBlur')?.value) || 0
  };
  profileState.music = { title: g('musicTitle').trim(), url: g('musicUrl').trim() };
  profileState.discord = {
    username:   g('discordUsername').trim(),
    userId:     g('discordUserId').trim(),
    serverName: g('discordServerName').trim(),
    inviteUrl:  g('discordInviteUrl').trim()
  };
  updatePreview();
}

// ── Links ──
function addLink() {
  profileState.links.push({ platform: 'website', label: '', url: '' });
  renderLinks(); updatePreview();
}
function removeLink(idx) {
  profileState.links.splice(idx, 1); renderLinks(); updatePreview();
}
function updateLink(idx, field, value) {
  profileState.links[idx][field] = value; updatePreview();
}
function renderLinks() {
  const list = document.getElementById('linksList');
  list.innerHTML = '';
  profileState.links.forEach((link, idx) => {
    const item = document.createElement('div');
    item.className = 'link-item';
    const opts = Object.entries(PLATFORMS).map(([v,i]) =>
      `<option value="${v}" ${link.platform===v?'selected':''}>${i.label}</option>`).join('');
    item.innerHTML = `
      <select onchange="updateLink(${idx},'platform',this.value)">${opts}</select>
      <div class="link-item-fields">
        <input type="text" placeholder="Label" value="${esc(link.label)}" oninput="updateLink(${idx},'label',this.value)" maxlength="50"/>
        <input type="url"  placeholder="https://..." value="${esc(link.url)}" oninput="updateLink(${idx},'url',this.value)" maxlength="500"/>
      </div>
      <button class="btn-remove" onclick="removeLink(${idx})">×</button>`;
    list.appendChild(item);
  });
  const btn = document.getElementById('addLinkBtn');
  if (btn) btn.style.display = profileState.links.length >= 10 ? 'none' : '';
}
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ── Live Preview ──
function updatePreview() {
  const s = profileState;
  const card = document.getElementById('previewCard');
  if (!card) return;

  // Background in preview card
  if (s.background.imageUrl) {
    card.style.background = `url(${s.background.imageUrl}) center/cover`;
  } else {
    card.style.background = `linear-gradient(${s.background.direction},${s.background.color1},${s.background.color2})`;
  }

  // Avatar small sidebar preview
  const sm = document.getElementById('avatarPreviewSmall');
  if (sm) {
    sm.innerHTML = s.avatarUrl
      ? `<img src="${s.avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.outerHTML='<span>🙂</span>'" />`
      : '<span>🙂</span>';
  }

  // Avatar in preview card
  const av = document.getElementById('previewAvatar');
  if (av) {
    av.innerHTML = s.avatarUrl
      ? `<img src="${s.avatarUrl}" onerror="this.outerHTML='<span>🙂</span>'" />`
      : '<span>🙂</span>';
  }

  // Text
  const pn = document.getElementById('previewName');
  if (pn) pn.textContent = s.displayName || 'Ihr Name';
  const pv = document.getElementById('previewViews');
  if (pv) pv.textContent = `👁 ${s.views||0} Aufrufe`;
  const pb = document.getElementById('previewBio');
  if (pb) { pb.textContent = s.bio||''; pb.style.display = s.bio ? '' : 'none'; }

  // Links
  const pl = document.getElementById('previewLinks');
  if (pl) {
    pl.innerHTML = '';
    s.links.forEach(link => {
      if (!link.label && !link.url) return;
      const a = document.createElement('a');
      a.className = 'preview-link-btn';
      a.href = link.url||'#'; a.target='_blank'; a.rel='noopener noreferrer';
      const info = PLATFORMS[link.platform]||PLATFORMS.website;
      a.innerHTML = `<span class="preview-link-icon">${info.label[0]}</span><span>${link.label||link.url}</span>`;
      pl.appendChild(a);
    });
  }

  // Music
  const mc = document.getElementById('previewMusic');
  if (mc) {
    if (s.music?.title || s.music?.url) {
      mc.style.display = '';
      const mt = document.getElementById('previewMusicTitle');
      if (mt) mt.textContent = s.music.title || 'Unbekannt';
      if (previewAudioEl && s.music.url && s.music.url !== previewAudioEl.src) {
        previewAudioEl.src = s.music.url; previewAudioEl.load();
        isPreviewPlaying = false;
        const pb2 = document.getElementById('previewPlayBtn');
        if (pb2) pb2.textContent = '▶';
        const pf = document.getElementById('previewProgressFill');
        if (pf) pf.style.width = '0%';
        const pt = document.getElementById('previewMusicTime');
        if (pt) pt.textContent = '0:00 / 0:00';
      }
    } else {
      mc.style.display = 'none';
      if (previewAudioEl) { previewAudioEl.pause(); isPreviewPlaying = false; }
    }
  }
}

// ── Music preview controls ──
function toggleMusicPreview() {
  if (!previewAudioEl?.src) return;
  if (isPreviewPlaying) { previewAudioEl.pause(); document.getElementById('previewPlayBtn').textContent='▶'; }
  else { previewAudioEl.play().catch(()=>{}); document.getElementById('previewPlayBtn').textContent='⏸'; }
  isPreviewPlaying = !isPreviewPlaying;
}
if (previewAudioEl) {
  previewAudioEl.addEventListener('timeupdate', () => {
    const pct = previewAudioEl.duration ? (previewAudioEl.currentTime/previewAudioEl.duration*100) : 0;
    const pf = document.getElementById('previewProgressFill');
    if (pf) pf.style.width = pct+'%';
    const pt = document.getElementById('previewMusicTime');
    if (pt) pt.textContent = `${fmt(previewAudioEl.currentTime)} / ${fmt(previewAudioEl.duration||0)}`;
  });
  previewAudioEl.addEventListener('ended', () => {
    isPreviewPlaying = false;
    const pb = document.getElementById('previewPlayBtn');
    if (pb) pb.textContent = '▶';
  });
}
function fmt(s){ if(isNaN(s)) return '0:00'; return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`; }

// ── Save ──
async function saveProfile() {
  collectAndPreview();
  const btn = document.getElementById('saveBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Speichern...';
  const payload = {
    displayName:  profileState.displayName,
    bio:          profileState.bio,
    avatarUrl:    profileState.avatarUrl,
    songCover:    profileState.songCover,
    badge:        profileState.badge,
    effects:      profileState.effects,
    avatarRing:   profileState.avatarRing,
    background:   profileState.background,
    links:        profileState.links,
    music:        profileState.music,
    discord:      profileState.discord
  };
  try {
    const res = await authFetch('/api/profile', { method:'PUT', body: JSON.stringify(payload) });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) throw new Error(data.error||'Fehler');
    showToast('Profil gespeichert! ✦', 'success');
    const lnk = document.getElementById('profileUrlLink');
    if (lnk) { lnk.style.color='#4ade80'; setTimeout(()=>{ lnk.style.color=''; },2000); }
  } catch(e) { showToast(e.message,'error'); }
  finally { btn.disabled=false; btn.innerHTML='Änderungen speichern'; }
}

// ── Init ──
loadProfile();
