import i18n from 'i18n';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initI18n() {
  i18n.configure({
    locales: ['id', 'en'],
    defaultLocale: 'id',
    directory: path.join(__dirname, '../locales'),
    autoReload: true,
    updateFiles: false,
    syncFiles: false,
    objectNotation: true,
    register: global
  });

  return i18n;
}

export const translations = {
  id: {
    upload: {
      title: 'Upload File',
      description: 'Drag & drop file atau klik untuk memilih',
      button: 'Mulai Upload',
      maxFiles: 'Maksimal 5 file per upload',
      success: 'Upload berhasil!',
      error: 'Upload gagal',
      processing: 'Memproses...',
      selectFiles: 'Pilih File'
    },
    result: {
      title: 'Hasil Upload',
      download: 'Unduh',
      copy: 'Salin',
      copied: 'Tersalin!',
      open: 'Buka Link'
    },
    navigation: {
      home: 'Beranda',
      docs: 'Dokumentasi API',
      terms: 'Syarat & Ketentuan'
    },
    footer: {
      createdBy: 'dibuat oleh',
      with: 'dengan',
      and: 'dan',
      code: 'kode'
    },
    errors: {
      fileTooBig: 'Ukuran file terlalu besar',
      tooManyFiles: 'Terlalu banyak file',
      invalidType: 'Tipe file tidak valid',
      uploadFailed: 'Upload gagal',
      networkError: 'Kesalahan jaringan'
    }
  },
  en: {
    upload: {
      title: 'Upload Files',
      description: 'Drag & drop files or click to select',
      button: 'Start Upload',
      maxFiles: 'Maximum 5 files per upload',
      success: 'Upload successful!',
      error: 'Upload failed',
      processing: 'Processing...',
      selectFiles: 'Select Files'
    },
    result: {
      title: 'Upload Results',
      download: 'Download',
      copy: 'Copy',
      copied: 'Copied!',
      open: 'Open Link'
    },
    navigation: {
      home: 'Home',
      docs: 'API Documentation',
      terms: 'Terms & Conditions'
    },
    footer: {
      createdBy: 'created by',
      with: 'with',
      and: 'and',
      code: 'code'
    },
    errors: {
      fileTooBig: 'File size too large',
      tooManyFiles: 'Too many files',
      invalidType: 'Invalid file type',
      uploadFailed: 'Upload failed',
      networkError: 'Network error'
    }
  }
};

export function getTranslation(lang, key) {
  const keys = key.split('.');
  let value = translations[lang] || translations['en'];
  
  for (const k of keys) {
    value = value[k];
    if (!value) return key;
  }
  
  return value;
}