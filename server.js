import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware: allow large payloads for base64 photo uploads
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded user photos directly
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/public/uploads', express.static(UPLOADS_DIR));

const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const WAITLIST_FILE = path.join(DATA_DIR, 'waitlist.json');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');

// Helper to read/write JSON files safely
function readJsonFile(filePath, defaultValue = {}) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '{}');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'anisha8020';

function checkAdminAuth(req, res, next) {
  const clientPass = req.headers['x-admin-password'] || (req.body && req.body._adminPassword);
  if (clientPass !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Incorrect Admin Password' });
  }
  next();
}

// --------------------------------------------------------------------------
// 1. CONTENT CMS ENDPOINTS (READ & WRITE FROM ADMIN DASHBOARD)
// --------------------------------------------------------------------------

// Password Verification Endpoint
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, message: 'Access granted' });
  }
  return res.status(401).json({ success: false, error: 'Incorrect password' });
});

// Get all frontend content, colors & settings
app.get('/api/content', (req, res) => {
  const content = readJsonFile(CONTENT_FILE, {});
  res.json(content);
});

// Save modified content & colors from Admin Dashboard (Password Protected)
app.post('/api/content', checkAdminAuth, (req, res) => {
  try {
    const updatedContent = req.body;
    if (!updatedContent || typeof updatedContent !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid content data payload' });
    }

    // Clean internal password field before saving
    delete updatedContent._adminPassword;

    writeJsonFile(CONTENT_FILE, updatedContent);
    console.log(`[CMS UPDATE] Content & theme successfully updated at ${new Date().toISOString()}`);

    return res.json({
      success: true,
      message: 'All changes saved successfully! Frontend is now updated.',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error saving content:', err);
    return res.status(500).json({ success: false, error: 'Failed to save changes.' });
  }
});

// Photo / Image Upload (Base64 file uploader, Password Protected)
app.post('/api/upload', checkAdminAuth, (req, res) => {
  try {
    const { filename, base64Data } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    // Clean base64 data
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(base64Data, 'base64');
    
    const ext = path.extname(filename || 'photo.png') || '.png';
    const safeName = `photo_${Date.now()}${ext}`;
    const targetPath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(targetPath, buffer);

    // Also copy to root assets/uploads for dev server consistency
    const devUploadDir = path.join(__dirname, 'assets', 'uploads');
    if (!fs.existsSync(devUploadDir)) fs.mkdirSync(devUploadDir, { recursive: true });
    fs.writeFileSync(path.join(devUploadDir, safeName), buffer);

    // Also copy to dist/uploads if production build exists
    const distUploadDir = path.join(__dirname, 'dist', 'uploads');
    if (fs.existsSync(distUploadDir)) {
      fs.writeFileSync(path.join(distUploadDir, safeName), buffer);
    }

    const publicUrl = `/uploads/${safeName}`;
    console.log(`[PHOTO UPLOAD] New image saved: ${publicUrl}`);

    return res.json({
      success: true,
      url: publicUrl,
      message: 'Image uploaded successfully!'
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, error: 'Failed to upload photo.' });
  }
});

// --------------------------------------------------------------------------
// 2. HEALTH & MESSAGING ENDPOINTS
// --------------------------------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'Anisha Vanjinathan Portfolio API & CMS',
    institution: 'SRM IST Ramapuram - B.Tech CSBS',
    startup: 'SkillPulse AI (EdTech)',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Contact Form Submission
app.post('/api/contact', (req, res) => {
  const { name, email, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'Please provide name, email, and message.'
    });
  }

  const messages = readJsonFile(MESSAGES_FILE, []);
  const newMessage = {
    id: `msg_${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    service: service || 'General Inquiry',
    message: message.trim(),
    receivedAt: new Date().toISOString(),
    status: 'unread'
  };

  messages.unshift(newMessage);
  writeJsonFile(MESSAGES_FILE, messages);

  console.log(`[CONTACT INQUIRY] From: ${name} (${email}) | Service: ${service}`);

  return res.status(201).json({
    success: true,
    message: `Thank you, ${name}! Your inquiry has been received. Anisha will reply soon.`,
    inquiryId: newMessage.id
  });
});

// View Received Messages
app.get('/api/contact/messages', (req, res) => {
  const messages = readJsonFile(MESSAGES_FILE, []);
  res.json({
    count: messages.length,
    messages
  });
});

// Delete a message by ID
app.delete('/api/contact/messages/:id', (req, res) => {
  const { id } = req.params;
  let messages = readJsonFile(MESSAGES_FILE, []);
  messages = messages.filter(m => m.id !== id);
  writeJsonFile(MESSAGES_FILE, messages);
  res.json({ success: true, message: 'Message deleted.' });
});

// Startup Waitlist Sign-up
app.post('/api/waitlist', (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address.'
    });
  }

  const waitlist = readJsonFile(WAITLIST_FILE, []);
  const normalizedEmail = email.trim().toLowerCase();

  const alreadySubscribed = waitlist.some(entry => entry.email === normalizedEmail);
  if (alreadySubscribed) {
    return res.status(200).json({
      success: true,
      message: "You're already on the SkillPulse AI waitlist! We'll reach out soon."
    });
  }

  const newEntry = {
    id: `waitlist_${Date.now()}`,
    email: normalizedEmail,
    joinedAt: new Date().toISOString()
  };

  waitlist.unshift(newEntry);
  writeJsonFile(WAITLIST_FILE, waitlist);

  console.log(`[WAITLIST SIGNUP] SkillPulse AI: ${normalizedEmail}`);

  return res.status(201).json({
    success: true,
    message: `Welcome to the SkillPulse AI early-access list! Confirmation sent to ${email}.`,
    position: waitlist.length
  });
});

// View Waitlist Subscribers
app.get('/api/waitlist/subscribers', (req, res) => {
  const waitlist = readJsonFile(WAITLIST_FILE, []);
  res.json({
    count: waitlist.length,
    subscribers: waitlist
  });
});

// --------------------------------------------------------------------------
// 3. ADMIN DASHBOARD & STATIC SERVING
// --------------------------------------------------------------------------

// Serve the Visual Admin CMS Dashboard directly at /admin
app.get('/admin', (req, res) => {
  const adminPath = path.join(__dirname, 'admin.html');
  if (fs.existsSync(adminPath)) {
    return res.sendFile('admin.html', { root: __dirname });
  }
  return res.status(404).send('Admin dashboard file not found.');
});

// Serve frontend static files
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  // Asset 404 guard so broken images never return 200 index.html
  app.use(['/uploads', '/assets'], (req, res) => {
    res.status(404).send('Asset not found');
  });
  app.use((req, res) => {
    res.sendFile('index.html', { root: DIST_DIR });
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Portfolio Backend API running on: http://localhost:${PORT}`);
  console.log(`🎛️  VISUAL ADMIN CMS DASHBOARD:     http://localhost:${PORT}/admin`);
  console.log(`📡 Health Check:                    http://localhost:${PORT}/api/health`);
  console.log(`✉️  Contact Messages:                http://localhost:${PORT}/api/contact/messages`);
  console.log(`🎯 Waitlist Signups:                http://localhost:${PORT}/api/waitlist/subscribers`);
  console.log(`======================================================\n`);
});
