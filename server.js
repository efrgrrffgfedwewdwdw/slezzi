const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
// Render.com sets PORT env variable — always use it
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'slezzi-secret-key-change-in-production';
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const PROFILE_TEMPLATE = path.join(__dirname, 'views', 'profile.html');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: read users
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// Helper: write users
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Helper: verify JWT middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Reserved usernames that cannot be used as profile slugs
const RESERVED = ['api', 'login', 'register', 'dashboard', 'public', 'static', 'admin', 'me'];

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'Username must be 3-20 characters, letters, numbers, underscores only' });
  }
  if (RESERVED.includes(username.toLowerCase())) {
    return res.status(400).json({ error: 'That username is reserved' });
  }
  const users = readUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'Username already taken' });
  }
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: uuidv4(),
    username,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
    profile: {
      displayName: username,
      bio: '',
      avatarUrl: '',
      background: { color1: '#a855f7', color2: '#3b82f6', direction: '135deg' },
      links: [],
      music: { title: '', url: '' },
      discord: { username: '', userId: '', serverId: '', serverName: '', inviteUrl: '' },
      views: 0
    }
  };
  users.push(newUser);
  writeUsers(users);
  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '30d' });
  res.status(201).json({ token, username: newUser.username });
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const users = readUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, username: user.username });
});

// GET /api/me
app.get('/api/me', authMiddleware, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash, ...safe } = user;
  res.json(safe);
});

// GET /api/profile/:username
app.get('/api/profile/:username', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.username.toLowerCase() === req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: 'Profile not found' });
  const { passwordHash, email, ...safe } = user;
  res.json(safe);
});

// PUT /api/profile
app.put('/api/profile', authMiddleware, (req, res) => {
  const users = readUsers();
  const idx = users.findIndex(u => u.id === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  const { displayName, bio, avatarUrl, background, links, music } = req.body;

  if (displayName !== undefined) {
    users[idx].profile.displayName = String(displayName).slice(0, 50);
  }
  if (bio !== undefined) {
    users[idx].profile.bio = String(bio).slice(0, 150);
  }
  if (avatarUrl !== undefined) {
    users[idx].profile.avatarUrl = String(avatarUrl).slice(0, 500);
  }
  if (background !== undefined) {
    users[idx].profile.background = {
      color1: background.color1 || '#a855f7',
      color2: background.color2 || '#3b82f6',
      direction: background.direction || '135deg'
    };
  }
  if (links !== undefined && Array.isArray(links)) {
    users[idx].profile.links = links.slice(0, 10).map(l => ({
      platform: String(l.platform || 'website'),
      label: String(l.label || '').slice(0, 50),
      url: String(l.url || '').slice(0, 500)
    }));
  }
  if (music !== undefined) {
    users[idx].profile.music = {
      title: String(music.title || '').slice(0, 100),
      url: String(music.url || '').slice(0, 500)
    };
  }
  if (req.body.discord !== undefined) {
    users[idx].profile.discord = {
      username: String(req.body.discord.username || '').slice(0, 50),
      userId:   String(req.body.discord.userId   || '').slice(0, 30),
      serverId: String(req.body.discord.serverId || '').slice(0, 30),
      serverName: String(req.body.discord.serverName || '').slice(0, 80),
      inviteUrl:  String(req.body.discord.inviteUrl  || '').slice(0, 200)
    };
  }

  writeUsers(users);
  const { passwordHash, ...safe } = users[idx];
  res.json(safe);
});

// Serve dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Serve login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve register
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Public profile route — must come last
app.get('/:username', (req, res) => {
  const { username } = req.params;
  if (RESERVED.includes(username.toLowerCase())) {
    return res.status(404).send('Not found');
  }

  const users = readUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  }

  // Increment view count
  const idx = users.findIndex(u => u.id === user.id);
  users[idx].profile.views = (users[idx].profile.views || 0) + 1;
  writeUsers(users);

  const profileData = {
    username: user.username,
    profile: users[idx].profile
  };

  let template = fs.readFileSync(PROFILE_TEMPLATE, 'utf8');
  const html = template.replace('__PROFILE_DATA__', JSON.stringify(profileData));
  res.send(html);
});

// Start server — works on Render.com and locally
app.listen(PORT, () => {
  console.log(`✦ Slezzi running on port ${PORT}`);
  console.log(`  Local: http://localhost:${PORT}`);
});
