import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'data') : path.join(__dirname, 'data');
const UPLOADS_DIR = IS_VERCEL ? path.join('/tmp', 'uploads') : path.join(__dirname, 'public', 'uploads');

// Supabase Cloud Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://atbxlkehmwjvzymqjimw.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Ynhsa2VobXdqdnp5bXFqaW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNjA1OTAsImV4cCI6MjEwNTgzNjU5MH0.APDnLMFbqLeTwJCQ0nHNCyH5hKUNOyukfWpzS3jP-Qo';
const SUPABASE_BUCKET = process.env.VITE_SUPABASE_BUCKET || process.env.SUPABASE_BUCKET || 'future-events';

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log(`[SUPABASE] Connected to ${SUPABASE_URL} (Bucket: ${SUPABASE_BUCKET})`);
  } catch (err) {
    console.warn('[SUPABASE] Initialization error:', err.message);
  }
}

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

// Middleware: allow large payloads for photo uploads
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded user photos directly as local fallback
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/public/uploads', express.static(UPLOADS_DIR));

const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');

// In-memory cache to guarantee instant, zero-delay responses
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

/* ==========================================================================
   SUPABASE CLOUD SYNC HELPERS
   ========================================================================== */

/**
 * Upload an image buffer directly into Supabase Cloud Storage bucket
 * Returns the permanent public CDN URL
 */
async function uploadToSupabase(buffer, safeName, mimeType = 'image/jpeg') {
  if (!supabase) return null;
  try {
    const remotePath = `portfolio_uploads/${safeName}`;
    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(remotePath, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.warn('[SUPABASE STORAGE WARNING]:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(remotePath);

    console.log(`[SUPABASE STORAGE] Successfully uploaded: ${urlData?.publicUrl}`);
    return urlData?.publicUrl || null;
  } catch (err) {
    console.warn('[SUPABASE STORAGE EXCEPTION]:', err.message);
    return null;
  }
}

/**
 * Permanently save content to Supabase database & storage
 */
async function saveContentToSupabase(content) {
  if (!supabase) return false;
  let success = false;

  // 1. Try table 'portfolio_content'
  try {
    const { error: dbError } = await supabase
      .from('portfolio_content')
      .upsert({ id: 'primary', data: content, updated_at: new Date().toISOString() });
    if (!dbError) {
      console.log('[SUPABASE DATABASE] Content upserted to portfolio_content table');
      success = true;
    }
  } catch (e) {}

  // 2. Also save to Supabase Cloud Storage bucket as JSON
  try {
    const jsonBuffer = Buffer.from(JSON.stringify(content, null, 2), 'utf-8');
    const { error: storageError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload('portfolio_data/content.json', jsonBuffer, {
        contentType: 'application/json',
        upsert: true
      });
    if (!storageError) {
      console.log('[SUPABASE STORAGE] Content saved to portfolio_data/content.json');
      success = true;
    }
  } catch (e) {
    console.warn('[SUPABASE STORAGE JSON NOTICE]:', e.message);
  }

  return success;
}

/**
 * Fetch content from Supabase cloud (Storage first, then table) with timeout protection
 */
async function getContentFromSupabase(timeoutMs = 3000) {
  if (!supabase) return null;

  try {
    const downloadPromise = (async () => {
      // 1. Try Supabase storage (fastest and most reliable)
      try {
        const { data, error } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .download('portfolio_data/content.json');
        if (!error && data) {
          const text = await data.text();
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            return parsed;
          }
        }
      } catch (e) {}

      // 2. Try Supabase table if available
      try {
        const { data, error } = await supabase
          .from('portfolio_content')
          .select('data')
          .eq('id', 'primary')
          .single();
        if (!error && data && data.data && Object.keys(data.data).length > 0) {
          return data.data;
        }
      } catch (e) {}

      return null;
    })();

    const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), timeoutMs));
    return await Promise.race([downloadPromise, timeoutPromise]);
  } catch (err) {
    return null;
  }
}

// Initial warm-up: Sync Supabase cloud content to local cache if available
(async () => {
  try {
    const cloudContent = await getContentFromSupabase(4000);
    if (cloudContent && Object.keys(cloudContent).length > 0) {
      memoryContentCache = cloudContent;
      writeJsonFile(CONTENT_FILE, cloudContent);
      console.log('[SUPABASE] Hydrated initial portfolio content from Supabase cloud.');
    }
  } catch (e) {
    console.log('[SUPABASE] Bootstrapping with local profile content.');
  }
})();

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

// Supabase Status Endpoint
app.get('/api/supabase/status', async (req, res) => {
  let bucketAccessible = false;
  let filesCount = 0;
  if (supabase) {
    try {
      const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).list('portfolio_uploads');
      if (!error) {
        bucketAccessible = true;
        filesCount = data ? data.length : 0;
      }
    } catch (e) {}
  }

  return res.json({
    configured: !!supabase,
    connected: bucketAccessible,
    url: SUPABASE_URL,
    bucket: SUPABASE_BUCKET,
    filesCount,
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------------------------------------
// 2. CONTENT CMS ENDPOINTS (READ & WRITE)
// --------------------------------------------------------------------------

// Get all frontend content, projects, skills & settings
app.get('/api/content', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Load from Supabase cloud first so that changes on Supabase or other devices are instantly reflected
  try {
    const cloud = await getContentFromSupabase(2500);
    if (cloud && cloud.personal) {
      memoryContentCache = cloud;
      writeJsonFile(CONTENT_FILE, cloud);
      return res.json(cloud);
    }
  } catch (e) {
    console.warn('[CMS] Supabase live read notice:', e.message);
  }

  const content = readJsonFile(CONTENT_FILE, {});
  res.json(content);
});

// Save modified content from Admin Dashboard
app.post('/api/content', checkAdminAuth, async (req, res) => {
  try {
    const updatedContent = req.body;
    if (!updatedContent || typeof updatedContent !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid content data payload' });
    }

    delete updatedContent._adminPassword;

    // 1. Save to local disk & memory cache
    writeJsonFile(CONTENT_FILE, updatedContent);

    // 2. Permanently persist to Supabase cloud (Storage & DB)
    const supabaseSynced = await saveContentToSupabase(updatedContent);

    console.log(`[CMS UPDATE] Content successfully updated (Supabase synced: ${supabaseSynced}) at ${new Date().toISOString()}`);

    return res.json({
      success: true,
      supabaseSynced,
      message: supabaseSynced
        ? 'All changes permanently saved to Supabase Cloud & Local Storage!'
        : 'All changes saved locally and will sync to Supabase when connected.',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error saving content:', err);
    return res.status(500).json({ success: false, error: 'Failed to save changes.' });
  }
});

// Photo / Image Upload (Direct to Supabase Storage + Local fallback)
app.post('/api/upload', checkAdminAuth, async (req, res) => {
  try {
    const { filename, base64Data, isHero } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : 'image/jpeg';
    const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(base64Data, 'base64');

    const ext = path.extname(filename || 'photo.jpg') || (mimeType.includes('png') ? '.png' : '.jpg');
    const safeName = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    
    // 1. Always attempt upload to Supabase Storage Cloud first
    let permanentUrl = null;
    let storageType = 'local';

    if (supabase) {
      permanentUrl = await uploadToSupabase(buffer, safeName, mimeType);
      if (permanentUrl) {
        storageType = 'supabase';
      }
    }

    // 2. Also save to local disk for development & offline backup
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

    // Fall back to local URL if Supabase was unavailable
    if (!permanentUrl) {
      permanentUrl = `/uploads/${safeName}`;
    }

    // 3. If flagged as hero, automatically update content and sync to Supabase Cloud
    let heroUpdated = false;
    if (isHero) {
      try {
        const currentContent = readJsonFile(CONTENT_FILE, {});
        currentContent.personal = currentContent.personal || {};
        currentContent.personal.heroImage = permanentUrl;
        writeJsonFile(CONTENT_FILE, currentContent);
        await saveContentToSupabase(currentContent);
        heroUpdated = true;
        console.log(`[PHOTO UPLOAD] Auto-synced new hero photo to Supabase content: ${permanentUrl}`);
      } catch (syncErr) {
        console.warn('[PHOTO UPLOAD] Auto-sync notice:', syncErr.message);
      }
    }

    console.log(`[PHOTO UPLOAD] New image saved (${storageType}): ${permanentUrl}`);

    return res.json({
      success: true,
      url: permanentUrl,
      storage: storageType,
      heroUpdated,
      message: storageType === 'supabase'
        ? (heroUpdated ? 'Photo permanently uploaded to Supabase Cloud and set as active Hero Photo!' : 'Image uploaded permanently to Supabase Cloud Storage!')
        : 'Image saved locally.'
    });
  } catch (err) {
    console.error('Upload error:', err);
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

// Dedicated endpoint: Push any photo URL directly to Supabase Cloud & activate immediately on frontend
app.post('/api/hero-photo', checkAdminAuth, async (req, res) => {
  try {
    const { photoUrl } = req.body;
    if (!photoUrl || typeof photoUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'No photo URL provided' });
    }

    const trimmedUrl = photoUrl.trim();
    const currentContent = readJsonFile(CONTENT_FILE, {});
    currentContent.personal = currentContent.personal || {};
    currentContent.personal.heroImage = trimmedUrl;

    writeJsonFile(CONTENT_FILE, currentContent);
    const supabaseSynced = await saveContentToSupabase(currentContent);

    console.log(`[HERO PHOTO] Pushed to cloud: ${trimmedUrl} (Supabase synced: ${supabaseSynced})`);

    return res.json({
      success: true,
      heroImage: trimmedUrl,
      supabaseSynced,
      message: 'Photo URL successfully pushed to Supabase Cloud & active on frontend!'
    });
  } catch (err) {
    console.error('Error updating hero photo:', err);
    return res.status(500).json({ success: false, error: 'Failed to update hero photo.' });
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
    supabaseConnected: !!supabase,
    supabaseBucket: SUPABASE_BUCKET,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Contact Form Submission
app.post('/api/contact', async (req, res) => {
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

  // Sync inquiry to Supabase if available
  if (supabase) {
    try {
      await supabase.from('portfolio_messages').insert({
        id: newMessage.id,
        name: newMessage.name,
        email: newMessage.email,
        service: newMessage.service,
        message: newMessage.message,
        received_at: newMessage.receivedAt
      });
    } catch (e) {}
  }

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

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Portfolio Live Frontend:    http://localhost:${PORT}`);
    console.log(`🛠️  Editable Backend CMS:       http://localhost:${PORT}/admin`);
    console.log(`⚡ Supabase Integration:       ACTIVE (${SUPABASE_URL})`);
    console.log(`🗄️  Supabase Storage Bucket:    ${SUPABASE_BUCKET}`);
    console.log(`📁 Local Project Directory:     ${__dirname}`);
    console.log(`======================================================\n`);
  });
}
