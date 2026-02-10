import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import geoip from 'geoip-lite';
import TelegramBot from 'node-telegram-bot-api';
import { nanoid } from 'nanoid';
import { initializeDatabases, saveFileToDatabase, getFileFromDatabase, getFileStatus } from './database.js';
import { uploadToStorage, getStorageUrl } from './storage.js';
import { validateFile, sanitizeInput } from './security.js';
import { initI18n } from './i18n.js';
import { initTelegramBot } from './telegram.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(fileUpload({
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 },
  abortOnLimit: true,
  responseOnLimit: 'Ukuran file terlalu besar',
  useTempFiles: true,
  tempFileDir: '/tmp/',
  debug: false
}));

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 1000,
  max: parseInt(process.env.RATE_LIMIT_REQUESTS) || 10,
  message: { success: false, error: 'Terlalu banyak request, coba lagi nanti' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    await sendTelegramAlert(`⚠️ Rate limit exceeded\nIP: ${ip}\nPath: ${req.path}`);
    res.status(429).json({ success: false, error: 'Terlalu banyak request, coba lagi nanti' });
  }
});

app.use('/api', apiLimiter);

async function sendTelegramAlert(message) {
  try {
    await bot.sendMessage(process.env.TELEGRAM_CHANNEL_ID, message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Telegram error:', error);
  }
}

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const geo = geoip.lookup(ip);
  const country = geo ? geo.country : 'Unknown';
  const lang = country === 'ID' ? 'id' : 'en';
  req.userLang = lang;
  req.userCountry = country;
  req.userIp = ip;
  next();
});

app.get('/', (req, res) => {
  const lang = req.userLang || 'en';
  res.redirect(`/${lang}/~`);
});

app.post('/api/upload', async (req, res) => {
  try {
    const startTime = Date.now();
    const ip = req.userIp || req.ip || 'unknown';

    console.log('Upload request received from IP:', ip);

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('No files in request');
      return res.status(400).json({
        author: process.env.AUTHOR_NAME,
        email: process.env.AUTHOR_EMAIL,
        success: false,
        error: 'Tidak ada file yang diupload'
      });
    }

    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    console.log(`Processing ${files.length} files`);

    if (files.length > parseInt(process.env.MAX_FILES_PER_UPLOAD || 5)) {
      return res.status(400).json({
        author: process.env.AUTHOR_NAME,
        email: process.env.AUTHOR_EMAIL,
        success: false,
        error: `Maksimal ${process.env.MAX_FILES_PER_UPLOAD || 5} file per upload`
      });
    }

    const uploadResults = [];

    for (const file of files) {
      const fileId = nanoid(12);
      
      console.log(`Validating file: ${file.name}`);
      const validation = validateFile(file);
      if (!validation.valid) {
        console.log(`Validation failed for ${file.name}:`, validation.error);
        uploadResults.push({
          success: false,
          filename: file.name,
          error: validation.error
        });
        continue;
      }

      try {
        console.log(`Uploading ${file.name} to storage...`);
        const uploadResult = await uploadToStorage(file, fileId);
        console.log(`Upload successful to ${uploadResult.storage}`);
        
        console.log(`Saving ${fileId} to database...`);
        await saveFileToDatabase({
          id: fileId,
          name: file.name,
          size: file.size,
          mimeType: file.mimetype,
          storage: uploadResult.storage,
          url: uploadResult.url,
          ip: ip
        });

        const fileUrl = `${process.env.VITE_APP_URL || 'https://kabox.my.id'}/files/${fileId}/download`;

        uploadResults.push({
          success: true,
          id: fileId,
          name: file.name,
          size: file.size,
          downloadUrl: fileUrl,
          storage: uploadResult.storage
        });

        await sendTelegramAlert(
          `📤 <b>Upload Baru</b>\n\n` +
          `ID: <code>${fileId}</code>\n` +
          `File: ${file.name}\n` +
          `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB\n` +
          `Storage: ${uploadResult.storage}\n` +
          `IP: ${ip}\n` +
          `Time: ${Date.now() - startTime}ms`
        );
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        uploadResults.push({
          success: false,
          filename: file.name,
          error: error.message || 'Upload failed'
        });
      }
    }

    console.log('Upload complete, sending response');
    res.json({
      author: process.env.AUTHOR_NAME,
      email: process.env.AUTHOR_EMAIL,
      success: true,
      data: uploadResults
    });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      author: process.env.AUTHOR_NAME,
      email: process.env.AUTHOR_EMAIL,
      success: false,
      error: error.message || 'Terjadi kesalahan saat upload'
    });
  }
});

app.get('/api/upload', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        author: process.env.AUTHOR_NAME,
        email: process.env.AUTHOR_EMAIL,
        success: false,
        error: 'URL parameter diperlukan'
      });
    }

    const sanitizedUrl = sanitizeInput(url);
    
    res.json({
      author: process.env.AUTHOR_NAME,
      email: process.env.AUTHOR_EMAIL,
      success: true,
      message: 'Fitur upload dari URL akan segera hadir',
      url: sanitizedUrl
    });
  } catch (error) {
    res.status(500).json({
      author: process.env.AUTHOR_NAME,
      email: process.env.AUTHOR_EMAIL,
      success: false,
      error: 'Terjadi kesalahan'
    });
  }
});

app.get('/files/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const file = await getFileFromDatabase(id);

    if (!file) {
      return res.status(404).json({
        author: process.env.AUTHOR_NAME,
        email: process.env.AUTHOR_EMAIL,
        success: false,
        error: 'File tidak ditemukan'
      });
    }

    res.json({
      author: process.env.AUTHOR_NAME,
      email: process.env.AUTHOR_EMAIL,
      success: true,
      data: {
        id: file.id,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        createdAt: file.createdAt,
        downloadUrl: `${process.env.VITE_APP_URL}/files/${id}/download`
      }
    });
  } catch (error) {
    res.status(500).json({
      author: process.env.AUTHOR_NAME,
      email: process.env.AUTHOR_EMAIL,
      success: false,
      error: 'Terjadi kesalahan'
    });
  }
});

app.get('/files/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const status = await getFileStatus(id);

    if (!status) {
      return res.status(404).json({
        author: process.env.AUTHOR_NAME,
        email: process.env.AUTHOR_EMAIL,
        success: false,
        error: 'File tidak ditemukan'
      });
    }

    res.json({
      author: process.env.AUTHOR_NAME,
      email: process.env.AUTHOR_EMAIL,
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      author: process.env.AUTHOR_NAME,
      email: process.env.AUTHOR_EMAIL,
      success: false,
      error: 'Terjadi kesalahan'
    });
  }
});

app.get('/files/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const file = await getFileFromDatabase(id);

    if (!file) {
      return res.status(404).json({
        author: process.env.AUTHOR_NAME,
        email: process.env.AUTHOR_EMAIL,
        success: false,
        error: 'File tidak ditemukan'
      });
    }

    const storageUrl = await getStorageUrl(file);
    
    res.redirect(storageUrl);

    await sendTelegramAlert(
      `📥 <b>Download</b>\n\n` +
      `ID: <code>${id}</code>\n` +
      `File: ${file.name}\n` +
      `IP: ${req.userIp}`
    );
  } catch (error) {
    res.status(500).json({
      author: process.env.AUTHOR_NAME,
      email: process.env.AUTHOR_EMAIL,
      success: false,
      error: 'Terjadi kesalahan'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

initializeDatabases().then(() => {
  console.log('✅ Databases initialized');
}).catch(err => {
  console.error('❌ Database initialization failed:', err);
});

initTelegramBot(bot);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  sendTelegramAlert(`🚀 <b>Server Started</b>\n\nPort: ${PORT}\nTime: ${new Date().toISOString()}`);
});

export default app;