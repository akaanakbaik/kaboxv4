import validator from 'validator';
import xss from 'xss';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const allowedExtensions = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico', 'tiff', 'tif',
  'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v', 'mpg', 'mpeg',
  'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'opus',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp',
  'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz',
  'json', 'xml', 'csv', 'yaml', 'yml', 'toml', 'ini',
  'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt',
  'html', 'css', 'scss', 'sass', 'less',
  'md', 'markdown',
  'sql', 'db', 'sqlite', 'mdb',
  'psd', 'ai', 'eps', 'sketch', 'fig', 'xd',
  'ttf', 'otf', 'woff', 'woff2', 'eot',
  'apk', 'ipa', 'exe', 'dmg', 'deb', 'rpm',
  'iso', 'img', 'vdi', 'vmdk',
  'stl', 'obj', 'fbx', 'blend', '3ds', 'dae',
  'dwg', 'dxf', 'step', 'stp', 'iges', 'igs'
];

const dangerousExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js'];

export function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'File tidak valid' };
  }

  if (!file.name) {
    return { valid: false, error: 'Nama file tidak valid' };
  }

  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return { valid: false, error: `Ekstensi file .${fileExtension} tidak didukung` };
  }

  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: `Ukuran file terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB` };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File kosong' };
  }

  const sanitizedName = sanitizeFilename(file.name);
  if (sanitizedName.length === 0) {
    return { valid: false, error: 'Nama file tidak valid setelah sanitasi' };
  }

  if (dangerousExtensions.includes(fileExtension)) {
    const hash = calculateFileHash(file.data);
    console.warn(`⚠️ Potentially dangerous file uploaded: ${file.name} (${hash})`);
  }

  return { valid: true };
}

export function sanitizeFilename(filename) {
  let sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  sanitized = sanitized.replace(/\.{2,}/g, '.');
  sanitized = sanitized.replace(/_{2,}/g, '_');
  sanitized = sanitized.substring(0, 255);
  
  return sanitized;
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = xss(input, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style']
  });

  sanitized = validator.trim(sanitized);
  sanitized = validator.escape(sanitized);

  return sanitized;
}

export function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  if (!validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true
  })) {
    return false;
  }

  const parsedUrl = new URL(url);
  const forbiddenHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  
  if (forbiddenHosts.includes(parsedUrl.hostname)) {
    return false;
  }

  if (parsedUrl.hostname.startsWith('192.168.') || 
      parsedUrl.hostname.startsWith('10.') ||
      parsedUrl.hostname.startsWith('172.')) {
    return false;
  }

  return true;
}

export function calculateFileHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

export function validateIpAddress(ip) {
  if (!ip) return false;
  
  return validator.isIP(ip, 4) || validator.isIP(ip, 6);
}

export function sanitizeHeaders(headers) {
  const sanitized = {};
  const allowedHeaders = [
    'content-type',
    'content-length',
    'user-agent',
    'accept',
    'accept-language',
    'accept-encoding'
  ];

  for (const key in headers) {
    if (allowedHeaders.includes(key.toLowerCase())) {
      sanitized[key] = sanitizeInput(headers[key]);
    }
  }

  return sanitized;
}

export function checkSqlInjection(input) {
  if (typeof input !== 'string') return false;

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(UNION\s+SELECT)/i,
    /(OR\s+1\s*=\s*1)/i,
    /(AND\s+1\s*=\s*1)/i,
    /('|\"|;|--|\*|\/\*|\*\/)/,
    /(0x[0-9A-F]+)/i
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

export function checkXssAttempt(input) {
  if (typeof input !== 'string') return false;

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /eval\(/gi,
    /expression\(/gi
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

export function validateMimeType(mimetype) {
  if (!mimetype) return false;

  const allowedTypes = [
    'image/',
    'video/',
    'audio/',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/json',
    'application/xml',
    'text/',
    'font/',
    'application/x-font',
    'application/octet-stream'
  ];

  return allowedTypes.some(type => mimetype.startsWith(type));
}

export function rateLimit(ip, limit = 10, window = 1000) {
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const now = Date.now();
  const key = `${ip}:${Math.floor(now / window)}`;

  const current = global.rateLimitStore.get(key) || 0;
  
  if (current >= limit) {
    return { allowed: false, remaining: 0 };
  }

  global.rateLimitStore.set(key, current + 1);

  setTimeout(() => {
    global.rateLimitStore.delete(key);
  }, window * 2);

  return { allowed: true, remaining: limit - current - 1 };
}