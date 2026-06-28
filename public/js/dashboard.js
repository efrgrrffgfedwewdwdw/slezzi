/* ===== Dashboard logic ===== */

// Redirect if not logged in
if (!getToken()) {
  window.location.href = '/login';
}

const PLATFORMS = {
  discord:   { label: 'Discord',     icon: '🟦' },
  twitter:   { label: 'Twitter / X', icon: '🐦' },
  github:    { label: 'GitHub',      icon: '⚫' },
  instagram: { label: 'Instagram',   icon: '📷' },
  tiktok:    { label: 'TikTok',      icon: '🎵' },
  youtube:   { label: 'YouTube',     icon: '▶' },
  twitch:    { label: 'Twitch',      icon: '🟣' },
  steam:     { label: 'Steam',       icon: '🎮' },
  spotify:   { label: 'Spotify',     icon: '🎧' },
  website:   { label: 'Website',     icon: '🌐' },
  email:     { label: 'Email',       icon: '✉' }
};

let profileState = {
  displayName: '',
  bio: '',
  avatarUrl: '',
  background: { color1: '#a855f7', color2: '#3b82f6', direction: '135deg' },
  links: [],
  music: { title: '', url: '' },
  discord: { username: '', userId: '', serverId: '', serverName: '', inviteUrl: '' },
  views: 0
};

let profileUrl = '';
let previewAudioEl = document.getElementById('previewAudio');
let isPreviewPlaying = false;

// Set up profile URL display
const username = getUsername();
if (username) {
  profileUrl = `https://slezzi.bio/${username}`;
  const link = document.getElementById('profileUrlLink');
  if (link) { link.textContent = `slezzi.bio/${username}`; link.href = profileUrl; }
  const viewLink = document.getElementById('viewProfileLink');
  if (viewLink) { viewLink.href = profileUrl; }
  const usernameEl = document.getElementById('previewUsername');
  if (usernameEl) usernameEl.textContent = `@${username}`;
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('bl_token');
  localStorage.removeItem('bl_username');
  window.location.href = '/';
});

// Load existing profile
async function loadProfile() {
  const res = await authFetch('/api/me');
  if (!res) return;
  const data = await res.json();
  if (!res.ok) return;

  profileState = { ...profileState, ...data.profile };

  // Populate fields
  document.getElementById('displayName').value = profileState.displayName || '';
  document.getElementById('bio').value = profileState.bio || '';
  document.getElementById('avatarUrl').value = profileState.avatarUrl || '';
  document.getElementById('bgColor1').value = profileState.background.color1 || '#a855f7';
  document.getElementById('bgColor1Text').value = profileState.background.color1 || '#a855f7';
  document.getElementById('bgColor2').value = profileState.background.color2 || '#3b82f6';
  document.getElementById('bgColor2Text').value = profileState.background.color2 || '#3b82f6';
  document.getElementById('bgDirection').value = profileState.background.direction || '135deg';
  document.getElementById('musicTitle').value = profileState.music?.title || '';
  document.getElementById('musicUrl').value = profileState.music?.url || '';

  // Discord fields
  const d = profileState.discord || {};
  document.getElementById('discordUsername').value = d.username || '';
  document.getElementById('discordUserId').value = d.userId || '';
  document.getElementById('discordServerName').value = d.serverName || '';
  document.getElementById('discordInviteUrl').value = d.inviteUrl || '';

  updateBioCount();
  renderLinks();
  updatePreview();
}

// Bio char counter
document.getElementById('bio').addEventListener('input', updateBioCount);
function updateBioCount() {
  const val = document.getElementById('bio').value;
  document.getElementById('bioCount').textContent = `${val.length}/150`;
}

// Live preview updates on any input change
['displayName', 'bio', 'avatarUrl', 'bgColor1', 'bgColor2', 'bgDirection', 'musicTitle', 'musicUrl',
 'discordUsername', 'discordUserId', 'discordServerName', 'discordInviteUrl'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', collectAndPreview);
});

// Color picker sync
document.getElementById('bgColor1').addEventListener('input', function() {
  document.getElementById('bgColor1Text').value = this.value;
  collectAndPreview();
});
document.getElementById('bgColor1Text').addEventListener('input', function() {
  if (/^#[0-9a-fA-F]{6}$/.test(this.value)) {
    document.getElementById('bgColor1').value = this.value;
    collectAndPreview();
  }
});
document.getElementById('bgColor2').addEventListener('input', function() {
  document.getElementById('bgColor2Text').value = this.value;
  collectAndPreview();
});
document.getElementById('bgColor2Text').addEventListener('input', function() {
  if (/^#[0-9a-fA-F]{6}$/.test(this.value)) {
    document.getElementById('bgColor2').value = this.value;
    collectAndPreview();
  }
});

function collectAndPreview() {
  profileState.displayName = document.getElementById('displayName').value.trim();
  profileState.bio = document.getElementById('bio').value;
  profileState.avatarUrl = document.getElementById('avatarUrl').value.trim();
  profileState.background.color1 = document.getElementById('bgColor1').value;
  profileState.background.color2 = document.getElementById('bgColor2').value;
  profileState.background.direction = document.getElementById('bgDirection').value;
  profileState.music = {
    title: document.getElementById('musicTitle').value.trim(),
    url: document.getElementById('musicUrl').value.trim()
  };
  profileState.discord = {
    username:   document.getElementById('discordUsername').value.trim(),
    userId:     document.getElementById('discordUserId').value.trim(),
    serverName: document.getElementById('discordServerName').value.trim(),
    inviteUrl:  document.getElementById('discordInviteUrl').value.trim()
  };
  updatePreview();
}

// Links
function addLink(linkData) {
  const link = linkData || { platform: 'website', label: '', url: '' };
  profileState.links.push(link);
  renderLinks();
  updatePreview();
}

function removeLink(idx) {
  profileState.links.splice(idx, 1);
  renderLinks();
  updatePreview();
}

function renderLinks() {
  const list = document.getElementById('linksList');
  list.innerHTML = '';
  profileState.links.forEach((link, idx) => {
    const item = document.createElement('div');
    item.className = 'link-item';

    const platformOptions = Object.entries(PLATFORMS).map(([val, info]) =>
      `<option value="${val}" ${link.platform === val ? 'selected' : ''}>${info.label}</option>`
    ).join('');

    item.innerHTML = `
      <select class="link-platform" onchange="updateLink(${idx}, 'platform', this.value)">
        ${platformOptions}
      </select>
      <div class="link-item-fields">
        <input type="text" placeholder="Label (e.g. My GitHub)" value="${escHtml(link.label)}"
          oninput="updateLink(${idx}, 'label', this.value)" maxlength="50" />
        <input type="url" placeholder="https://..." value="${escHtml(link.url)}"
          oninput="updateLink(${idx}, 'url', this.value)" maxlength="500" />
      </div>
      <button class="btn-remove" onclick="removeLink(${idx})" title="Remove">×</button>
    `;
    list.appendChild(item);
  });

  const addBtn = document.getElementById('addLinkBtn');
  if (addBtn) addBtn.style.display = profileState.links.length >= 10 ? 'none' : '';
}

function updateLink(idx, field, value) {
  profileState.links[idx][field] = value;
  updatePreview();
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Update live preview
function updatePreview() {
  const card = document.getElementById('previewCard');
  const s = profileState;

  // Background
  card.style.background = `linear-gradient(${s.background.direction}, ${s.background.color1}, ${s.background.color2})`;

  // Avatar
  const avatarEl = document.getElementById('previewAvatar');
  const avatarSmall = document.getElementById('avatarPreviewSmall');
  if (s.avatarUrl) {
    avatarEl.innerHTML = `<img src="${s.avatarUrl}" alt="avatar" onerror="this.parentElement.innerHTML='🙂'" />`;
    avatarSmall.innerHTML = `<img src="${s.avatarUrl}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.parentElement.innerHTML='<span>🙂</span>'" />`;
  } else {
    avatarEl.innerHTML = '<span>🙂</span>';
    avatarSmall.innerHTML = '<span id="avatarEmoji">🙂</span>';
  }

  // Name / username
  document.getElementById('previewName').textContent = s.displayName || 'Your Name';
  document.getElementById('previewViews').textContent = `👁 ${s.views || 0} views`;

  // Bio
  const bioEl = document.getElementById('previewBio');
  bioEl.textContent = s.bio || '';
  bioEl.style.display = s.bio ? '' : 'none';

  // Links
  const linksEl = document.getElementById('previewLinks');
  linksEl.innerHTML = '';
  s.links.forEach(link => {
    if (!link.label && !link.url) return;
    const info = PLATFORMS[link.platform] || PLATFORMS.website;
    const a = document.createElement('a');
    a.className = 'preview-link-btn';
    a.href = link.url || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.innerHTML = `<span class="preview-link-icon">${info.label}</span><span>${link.label || link.url}</span>`;
    linksEl.appendChild(a);
  });

  // Music
  const musicCard = document.getElementById('previewMusic');
  if (s.music?.title || s.music?.url) {
    musicCard.style.display = '';
    document.getElementById('previewMusicTitle').textContent = s.music.title || 'Unknown Track';
    if (previewAudioEl && s.music.url !== previewAudioEl.src) {
      previewAudioEl.src = s.music.url;
      previewAudioEl.load();
      isPreviewPlaying = false;
      document.getElementById('previewPlayBtn').textContent = '▶';
      document.getElementById('previewProgressFill').style.width = '0%';
      document.getElementById('previewMusicTime').textContent = '0:00 / 0:00';
    }
  } else {
    musicCard.style.display = 'none';
    if (previewAudioEl) { previewAudioEl.pause(); isPreviewPlaying = false; }
  }
}

// Music preview controls
function toggleMusicPreview() {
  if (!previewAudioEl || !previewAudioEl.src) return;
  if (isPreviewPlaying) {
    previewAudioEl.pause();
    document.getElementById('previewPlayBtn').textContent = '▶';
  } else {
    previewAudioEl.play().catch(() => {});
    document.getElementById('previewPlayBtn').textContent = '⏸';
  }
  isPreviewPlaying = !isPreviewPlaying;
}

if (previewAudioEl) {
  previewAudioEl.addEventListener('timeupdate', () => {
    const pct = previewAudioEl.duration ? (previewAudioEl.currentTime / previewAudioEl.duration) * 100 : 0;
    document.getElementById('previewProgressFill').style.width = pct + '%';
    document.getElementById('previewMusicTime').textContent = `${fmtTime(previewAudioEl.currentTime)} / ${fmtTime(previewAudioEl.duration || 0)}`;
  });
  previewAudioEl.addEventListener('ended', () => {
    isPreviewPlaying = false;
    document.getElementById('previewPlayBtn').textContent = '▶';
  });
}

function fmtTime(secs) {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Save profile
async function saveProfile() {
  collectAndPreview();
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner"></span> Speichern...';

  const payload = {
    displayName: profileState.displayName,
    bio: profileState.bio,
    avatarUrl: profileState.avatarUrl,
    background: profileState.background,
    links: profileState.links,
    music: profileState.music,
    discord: profileState.discord
  };

  try {
    const res = await authFetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Save failed');
    showToast('Profil gespeichert! 🎉', 'success');
    const link = document.getElementById('profileUrlLink');
    if (link) link.style.color = '#4ade80';
    setTimeout(() => { if (link) link.style.color = ''; }, 2000);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = 'Änderungen speichern';
  }
}

// Init
loadProfile();

