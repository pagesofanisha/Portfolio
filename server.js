import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'data') : path.join(__dirname, 'data');
const UPLOADS_DIR = IS_VERCEL ? path.join('/tmp', 'uploads') : path.join(__dirname, 'public', 'uploads');

// Ensure directories exist
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Seed default data on serverless environments like Vercel
  if (IS_VERCEL) {
    const seedDataDir = path.join(__dirname, 'data');
    if (fs.existsSync(seedDataDir)) {
      const seedFiles = fs.readdirSync(seedDataDir);
      for (const file of seedFiles) {
        const destPath = path.join(DATA_DIR, file);
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(path.join(seedDataDir, file), destPath);
        }
      }
    }
  }
} catch (e) {
  console.warn('Directory initialization notice:', e.message);
}

// Middleware: allow large payloads for base64 photo uploads
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded user photos directly
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/public/uploads', express.static(UPLOADS_DIR));

const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');

// In-memory cache to guarantee instant, zero-delay responses across serverless cold starts
let memoryContentCache = null;

// Helper to read/write JSON files safely
function readJsonFile(filePath, defaultValue = {}) {
  try {
    if (filePath === CONTENT_FILE && memoryContentCache) {
      return memoryContentCache;
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      if (filePath === CONTENT_FILE) memoryContentCache = defaultValue;
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content || '{}');
    if (filePath === CONTENT_FILE) memoryContentCache = parsed;
    return parsed;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

function writeJsonFile(filePath, data) {
  try {
    if (filePath === CONTENT_FILE) {
      memoryContentCache = data;
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // Also sync to source data/ directory if running in dev or serverless with writable root
    const sourcePath = path.join(__dirname, 'data', path.basename(filePath));
    if (sourcePath !== filePath && fs.existsSync(path.join(__dirname, 'data'))) {
      try {
        fs.writeFileSync(sourcePath, JSON.stringify(data, null, 2));
      } catch (e) {}
    }
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

function getAdminPassword() {
  const config = readJsonFile(ADMIN_CONFIG_FILE, { password: 'Amlu611' });
  return process.env.ADMIN_PASSWORD || config.password || 'Amlu611';
}

function setAdminPassword(newPassword) {
  writeJsonFile(ADMIN_CONFIG_FILE, { password: newPassword });
}

function checkAdminAuth(req, res, next) {
  const clientPass = req.headers['x-admin-password'] || (req.body && req.body._adminPassword);
  const currentPass = getAdminPassword();
  if (clientPass && clientPass === currentPass) {
    return next();
  }
  return res.status(401).json({ success: false, error: 'Unauthorized: Incorrect Admin Password' });
}

// --------------------------------------------------------------------------
// 1. ADMIN DASHBOARD DIRECT ACCESS & AUTH
// --------------------------------------------------------------------------

// Direct clean access to Admin Dashboard at /admin, /backend, or /admin.html
app.use((req, res, next) => {
  const p = req.path.toLowerCase();
  if (p === '/admin' || p === '/admin.html' || p === '/backend' || p === '/studio-anisha-8020') {
    return res.sendFile('admin.html', { root: __dirname });
  }
  next();
});

// Password Verification / Login Endpoint
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const currentPass = getAdminPassword();
  if (password === currentPass) {
    return res.json({ success: true, message: 'Access granted' });
  }
  return res.status(401).json({ success: false, error: 'Incorrect admin password. Please try again.' });
});

// Password Changing Endpoint (Protected by current password)
app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const storedPass = getAdminPassword();

  if (!currentPassword || currentPassword !== storedPass) {
    return res.status(401).json({ success: false, error: 'Current password does not match!' });
  }

  if (!newPassword || newPassword.trim().length < 3) {
    return res.status(400).json({ success: false, error: 'New password must be at least 3 characters long.' });
  }

  setAdminPassword(newPassword.trim());
  console.log(`[SECURITY] Admin password successfully updated at ${new Date().toISOString()}`);

  return res.json({
    success: true,
    message: 'Password successfully updated! Please remember your new password.'
  });
});

// --------------------------------------------------------------------------
// 2. CONTENT CMS ENDPOINTS (READ & WRITE)
// --------------------------------------------------------------------------

// Get all frontend content, projects, skills & settings (Disabled cache so all users see updates instantly)
app.get('/api/content', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const content = readJsonFile(CONTENT_FILE, {});
  res.json(content);
});

// Save modified content from Admin Dashboard
app.post('/api/content', checkAdminAuth, (req, res) => {
  try {
    const updatedContent = req.body;
    if (!updatedContent || typeof updatedContent !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid content data payload' });
    }

    delete updatedContent._adminPassword;

    writeJsonFile(CONTENT_FILE, updatedContent);
    console.log(`[CMS UPDATE] Content successfully updated at ${new Date().toISOString()}`);

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

// Photo / Image Upload (Base64 file uploader)
app.post('/api/upload', checkAdminAuth, (req, res) => {
  try {
    const { filename, base64Data } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    // On Vercel / serverless: return base64 directly so the photo displays instantly everywhere
    // without depending on ephemeral serverless container storage or read-only filesystem
    if (IS_VERCEL) {
      return res.json({
        success: true,
        url: base64Data,
        message: 'Image uploaded successfully!'
      });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(base64Data, 'base64');
    
    const ext = path.extname(filename || 'photo.png') || '.png';
    const safeName = `photo_${Date.now()}${ext}`;
    const targetPath = path.join(UPLOADS_DIR, safeName);

    try {
      fs.writeFileSync(targetPath, buffer);

      const devUploadDir = path.join(__dirname, 'assets', 'uploads');
      if (!fs.existsSync(devUploadDir)) fs.mkdirSync(devUploadDir, { recursive: true });
      fs.writeFileSync(path.join(devUploadDir, safeName), buffer);

      const distUploadDir = path.join(__dirname, 'dist', 'uploads');
      if (fs.existsSync(distUploadDir)) {
        fs.writeFileSync(path.join(distUploadDir, safeName), buffer);
      }
    } catch (e) {
      console.warn('Local upload file write notice:', e.message);
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
    // Never fail the user: fall back to returning the base64 data URL
    if (req.body && req.body.base64Data) {
      return res.json({
        success: true,
        url: req.body.base64Data,
        message: 'Image loaded as data URL'
      });
    }
    return res.status(500).json({ success: false, error: 'Failed to upload photo.' });
  }
});

// --------------------------------------------------------------------------
// 3. HEALTH & CONTACT INQUIRIES ENDPOINTS
// --------------------------------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'Anisha Vanjinathan Premium Portfolio CMS',
    institution: 'SRM IST Ramapuram - B.Tech CSBS',
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
    service: service || 'General Inquiry / Project Collaboration',
    message: message.trim(),
    receivedAt: new Date().toISOString(),
    status: 'unread'
  };

  messages.unshift(newMessage);
  writeJsonFile(MESSAGES_FILE, messages);

  console.log(`[CONTACT INQUIRY] From: ${name} (${email}) | Subject: ${newMessage.service}`);

  return res.status(201).json({
    success: true,
    message: `Thank you, ${name}! Your inquiry has been sent to Anisha. She will get back to you shortly!`,
    inquiryId: newMessage.id
  });
});

// View Received Messages (Admin Inbox)
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
  res.json({ success: true, message: 'Message deleted successfully.' });
});

// --------------------------------------------------------------------------
// 4. SERVE FRONTEND STATIC FILES
// --------------------------------------------------------------------------

// Serve root static files like style.css, main.js, assets in dev or dist
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Fallback to index.html for SPA routing
app.use((req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  if (fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    return res.sendFile('index.html', { root: DIST_DIR });
  }
  return res.sendFile('index.html', { root: __dirname });
});

// Export app for serverless platforms like Vercel
export default app;

// Start Server when running directly
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Portfolio Live Frontend:    http://localhost:${PORT}`);
    console.log(`🛠️  Editable Backend CMS:       http://localhost:${PORT}/admin`);
    console.log(`📁 Local Project Directory:     ${__dirname}`);
    console.log(`📡 Health Check:               http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}
