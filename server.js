const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const cors     = require('cors');
const fs       = require('fs');
const path     = require('path');
const mongoose = require('mongoose');

const app  = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET      = process.env.JWT_SECRET || 'slezzi-secret-key-change-in-production';
const MONGO_URI       = process.env.MONGO_URI  || '';
const PROFILE_TEMPLATE = path.join(__dirname, 'views', 'profile.html');

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── MongoDB Schema ──
const profileSchema = new mongoose.Schema({
  displayName: String, bio: String, avatarUrl: String,
  songCover: String, badge: String, effects: String, avatarRing: String,
  background: {
    color1: String, color2: String, direction: String, imageUrl: String, blur: Number
  },
  links: [{ platform: String, label: String, url: String }],
  music: { title: String, url: String },
  discord: { username: String, userId: String, serverId: String, serverName: String, inviteUrl: String },
  views: { type: Number, default: 0 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  id:           { type: String, default: uuidv4 },
  username:     { type: String, required: true, unique: true },
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt:    { type: Date, default: Date.now },
  profile:      { type: profileSchema, default: () => ({
    displayName: '', bio: '', avatarUrl: '', songCover: '', badge: '',
    effects: 'particles', avatarRing: 'ring-gradient',
    background: { color1: '#a855f7', color2: '#3b82f6', direction: '135deg', imageUrl: '', blur: 0 },
    links: [], music: { title: '', url: '' },
    discord: { username: '', userId: '', serverId: '', serverName: '', inviteUrl: '' },
    views: 0
  })}
});
const User = mongoose.model('User', userSchema);

// ── JSON file fallback (local dev without MongoDB) ──
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
function readUsersFile() {
  try {
    if (!fs.existsSync(USERS_FILE)) { fs.writeFileSync(USERS_FILE, '[]'); return []; }
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch { return []; }
}
function writeUsersFile(users) {
  try { fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); } catch {}
}

// ── DB mode flag ──
let useDB = false;

// ── Auth middleware ──
const RESERVED = ['api','login','register','dashboard','public','static','admin','me','profiles'];

function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try {
    req.userId = jwt.verify(h.split(' ')[1], JWT_SECRET).userId;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ── Safe user object (no passwordHash) ──
function safeUser(u) {
  const obj = u.toObject ? u.toObject() : { ...u };
  delete obj.passwordHash; delete obj.__v;
  return obj;
}

// ────────────────────────────────────────────────────────────
// ROUTES
// ────────────────────────────────────────────────────────────

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Alle Felder erforderlich' });
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return res.status(400).json({ error: 'Username: 3-20 Zeichen, nur Buchstaben/Zahlen/_' });
  if (RESERVED.includes(username.toLowerCase())) return res.status(400).json({ error: 'Dieser Username ist reserviert' });

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    if (useDB) {
      const exists = await User.findOne({ $or: [{ username: new RegExp(`^${username}$`, 'i') }, { email: email.toLowerCase() }] });
      if (exists) return res.status(409).json({ error: exists.username.toLowerCase() === username.toLowerCase() ? 'Username bereits vergeben' : 'E-Mail bereits registriert' });
      const user = await User.create({ id: uuidv4(), username, email: email.toLowerCase(), passwordHash, profile: { displayName: username } });
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
      return res.status(201).json({ token, username: user.username });
    } else {
      const users = readUsersFile();
      if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) return res.status(409).json({ error: 'Username bereits vergeben' });
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return res.status(409).json({ error: 'E-Mail bereits registriert' });
      const newUser = { id: uuidv4(), username, email, passwordHash, createdAt: new Date().toISOString(), profile: { displayName: username, bio:'', avatarUrl:'', songCover:'', badge:'', effects:'particles', avatarRing:'ring-gradient', background:{ color1:'#a855f7', color2:'#3b82f6', direction:'135deg', imageUrl:'', blur:0 }, links:[], music:{ title:'', url:'' }, discord:{ username:'', userId:'', serverId:'', serverName:'', inviteUrl:'' }, views:0 } };
      users.push(newUser); writeUsersFile(users);
      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '30d' });
      return res.status(201).json({ token, username: newUser.username });
    }
  } catch (e) { console.error(e); res.status(500).json({ error: 'Serverfehler' }); }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username und Passwort erforderlich' });
  try {
    let user;
    if (useDB) {
      user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
    } else {
      user = readUsersFile().find(u => u.username.toLowerCase() === username.toLowerCase());
    }
    if (!user) return res.status(401).json({ error: 'Falscher Username oder Passwort' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Falscher Username oder Passwort' });
    const token = jwt.sign({ userId: user.id || user._id?.toString() }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, username: user.username });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Serverfehler' }); }
});

// GET /api/me
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    if (useDB) {
      const user = await User.findOne({ id: req.userId });
      if (!user) return res.status(404).json({ error: 'User nicht gefunden' });
      return res.json(safeUser(user));
    } else {
      const user = readUsersFile().find(u => u.id === req.userId);
      if (!user) return res.status(404).json({ error: 'User nicht gefunden' });
      const { passwordHash, ...safe } = user; return res.json(safe);
    }
  } catch (e) { res.status(500).json({ error: 'Serverfehler' }); }
});

// GET /api/profile/:username
app.get('/api/profile/:username', async (req, res) => {
  try {
    if (useDB) {
      const user = await User.findOne({ username: new RegExp(`^${req.params.username}$`, 'i') });
      if (!user) return res.status(404).json({ error: 'Profil nicht gefunden' });
      const obj = safeUser(user); delete obj.email; return res.json(obj);
    } else {
      const user = readUsersFile().find(u => u.username.toLowerCase() === req.params.username.toLowerCase());
      if (!user) return res.status(404).json({ error: 'Profil nicht gefunden' });
      const { passwordHash, email, ...safe } = user; return res.json(safe);
    }
  } catch (e) { res.status(500).json({ error: 'Serverfehler' }); }
});

// PUT /api/profile
app.put('/api/profile', authMiddleware, async (req, res) => {
  const { displayName, bio, avatarUrl, background, links, music, effects, badge, songCover, discord, avatarRing } = req.body;
  try {
    if (useDB) {
      const user = await User.findOne({ id: req.userId });
      if (!user) return res.status(404).json({ error: 'User nicht gefunden' });
      const p = user.profile;
      if (displayName !== undefined) p.displayName = String(displayName).slice(0, 50);
      if (bio !== undefined)         p.bio          = String(bio).slice(0, 150);
      if (avatarUrl !== undefined)   p.avatarUrl    = String(avatarUrl).slice(0, 500);
      if (songCover !== undefined)   p.songCover    = String(songCover).slice(0, 500);
      if (badge !== undefined)       p.badge        = String(badge).slice(0, 20);
      if (effects !== undefined)     p.effects      = String(effects).slice(0, 20);
      if (avatarRing !== undefined)  p.avatarRing   = String(avatarRing).slice(0, 30);
      if (background !== undefined)  p.background   = { color1: background.color1||'#a855f7', color2: background.color2||'#3b82f6', direction: background.direction||'135deg', imageUrl: String(background.imageUrl||'').slice(0,500), blur: Number(background.blur)||0 };
      if (Array.isArray(links))      p.links        = links.slice(0,10).map(l=>({ platform:String(l.platform||'website'), label:String(l.label||'').slice(0,50), url:String(l.url||'').slice(0,500) }));
      if (music !== undefined)       p.music        = { title: String(music.title||'').slice(0,100), url: String(music.url||'').slice(0,500) };
      if (discord !== undefined)     p.discord      = { username:String(discord.username||'').slice(0,50), userId:String(discord.userId||'').slice(0,30), serverId:String(discord.serverId||'').slice(0,30), serverName:String(discord.serverName||'').slice(0,80), inviteUrl:String(discord.inviteUrl||'').slice(0,200) };
      user.markModified('profile');
      await user.save();
      return res.json(safeUser(user));
    } else {
      const users = readUsersFile();
      const idx = users.findIndex(u => u.id === req.userId);
      if (idx === -1) return res.status(404).json({ error: 'User nicht gefunden' });
      const p = users[idx].profile;
      if (displayName !== undefined) p.displayName = String(displayName).slice(0, 50);
      if (bio !== undefined)         p.bio          = String(bio).slice(0, 150);
      if (avatarUrl !== undefined)   p.avatarUrl    = String(avatarUrl).slice(0, 500);
      if (songCover !== undefined)   p.songCover    = String(songCover).slice(0, 500);
      if (badge !== undefined)       p.badge        = String(badge).slice(0, 20);
      if (effects !== undefined)     p.effects      = String(effects).slice(0, 20);
      if (avatarRing !== undefined)  p.avatarRing   = String(avatarRing).slice(0, 30);
      if (background !== undefined)  p.background   = { color1: background.color1||'#a855f7', color2: background.color2||'#3b82f6', direction: background.direction||'135deg', imageUrl: String(background.imageUrl||'').slice(0,500), blur: Number(background.blur)||0 };
      if (Array.isArray(links))      p.links        = links.slice(0,10).map(l=>({ platform:String(l.platform||'website'), label:String(l.label||'').slice(0,50), url:String(l.url||'').slice(0,500) }));
      if (music !== undefined)       p.music        = { title: String(music.title||'').slice(0,100), url: String(music.url||'').slice(0,500) };
      if (discord !== undefined)     p.discord      = { username:String(discord.username||'').slice(0,50), userId:String(discord.userId||'').slice(0,30), serverId:String(discord.serverId||'').slice(0,30), serverName:String(discord.serverName||'').slice(0,80), inviteUrl:String(discord.inviteUrl||'').slice(0,200) };
      writeUsersFile(users);
      const { passwordHash, ...safe } = users[idx]; return res.json(safe);
    }
  } catch (e) { console.error(e); res.status(500).json({ error: 'Serverfehler' }); }
});

// GET /api/profiles
app.get('/api/profiles', async (req, res) => {
  try {
    let list;
    if (useDB) {
      const users = await User.find({}).select('username profile.displayName profile.bio profile.avatarUrl profile.background profile.views');
      list = users.map(u => ({ username: u.username, displayName: u.profile.displayName, bio: u.profile.bio, avatarUrl: u.profile.avatarUrl, background: u.profile.background, views: u.profile.views || 0 }));
    } else {
      list = readUsersFile().map(u => ({ username: u.username, displayName: u.profile.displayName, bio: u.profile.bio, avatarUrl: u.profile.avatarUrl, background: u.profile.background, views: u.profile.views || 0 }));
    }
    res.json(list);
  } catch { res.json([]); }
});

// Static pages
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/login',     (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));

// Public profile route — LAST
app.get('/:username', async (req, res) => {
  const { username } = req.params;
  if (RESERVED.includes(username.toLowerCase())) return res.status(404).send('Not found');
  try {
    let user, profileData;
    if (useDB) {
      user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
      if (!user) return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
      user.profile.views = (user.profile.views || 0) + 1;
      user.markModified('profile');
      await user.save();
      profileData = { username: user.username, profile: user.profile.toObject ? user.profile.toObject() : user.profile };
    } else {
      const users = readUsersFile();
      const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
      if (idx === -1) return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
      users[idx].profile.views = (users[idx].profile.views || 0) + 1;
      writeUsersFile(users);
      profileData = { username: users[idx].username, profile: users[idx].profile };
    }
    const template = fs.readFileSync(PROFILE_TEMPLATE, 'utf8');
    res.send(template.replace('__PROFILE_DATA__', JSON.stringify(profileData)));
  } catch (e) { console.error(e); res.status(500).send('Fehler'); }
});

// ── Start ──
async function start() {
  if (MONGO_URI) {
    try {
      await mongoose.connect(MONGO_URI);
      useDB = true;
      console.log('✦ MongoDB verbunden');
    } catch (e) {
      console.warn('⚠ MongoDB Verbindung fehlgeschlagen, nutze JSON-Datei:', e.message);
    }
  } else {
    console.log('ℹ  Kein MONGO_URI — nutze lokale JSON-Datei');
    console.log('   Für persistente Daten auf Render: MONGO_URI Env-Variable setzen');
  }
  app.listen(PORT, () => {
    console.log(`✦ Slezzi läuft auf Port ${PORT}`);
  });
}
start();
