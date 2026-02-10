import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  id: {
    translation: {
      header: {
        brand: 'domku box'
      },
      nav: {
        home: 'Beranda',
        docs: 'Dokumentasi API',
        terms: 'Syarat & Ketentuan'
      },
      upload: {
        title: 'Upload File Anda',
        subtitle: 'Gratis, cepat, dan aman dengan multi-cloud CDN',
        dragDrop: 'Seret & Lepas file di sini',
        or: 'atau',
        clickSelect: 'Klik untuk memilih file',
        maxFiles: 'Maksimal 5 file, 100MB per file',
        startButton: 'Mulai Upload',
        uploading: 'Mengunggah...',
        processing: 'Memproses...',
        selectFiles: 'Pilih File'
      },
      results: {
        title: 'File Berhasil Diupload',
        downloadUrl: 'Link Download',
        copy: 'Salin',
        copied: 'Tersalin!',
        open: 'Buka',
        download: 'Unduh',
        storage: 'Storage',
        size: 'Ukuran'
      },
      footer: {
        created: 'dibuat oleh',
        with: 'dengan',
        and: 'dan',
        code: 'kode'
      },
      errors: {
        uploadFailed: 'Upload gagal',
        networkError: 'Kesalahan jaringan',
        fileTooBig: 'File terlalu besar',
        tooManyFiles: 'Terlalu banyak file',
        invalidType: 'Tipe file tidak valid',
        selectFile: 'Pilih file terlebih dahulu'
      },
      docs: {
        title: 'Dokumentasi API',
        subtitle: 'Panduan lengkap menggunakan Kabox API',
        upload: 'Upload File',
        uploadDesc: 'Upload file ke CDN',
        getFile: 'Informasi File',
        getFileDesc: 'Dapatkan informasi file',
        download: 'Download File',
        downloadDesc: 'Download file dari CDN',
        status: 'Status Upload',
        statusDesc: 'Cek status upload file',
        endpoint: 'Endpoint',
        method: 'Method',
        parameters: 'Parameter',
        response: 'Response',
        example: 'Contoh',
        curlExample: 'Contoh cURL',
        responseExample: 'Contoh Response'
      },
      terms: {
        title: 'Syarat dan Ketentuan',
        subtitle: 'Ketentuan penggunaan layanan Kabox',
        updated: 'Terakhir diperbarui',
        acceptance: 'Penerimaan Ketentuan',
        acceptanceText: 'Dengan menggunakan layanan Kabox, Anda setuju untuk terikat dengan syarat dan ketentuan ini. Jika Anda tidak setuju dengan ketentuan ini, mohon untuk tidak menggunakan layanan kami.',
        service: 'Layanan',
        serviceText: 'Kabox menyediakan layanan hosting file dan Content Delivery Network (CDN) gratis untuk pengguna. Kami berhak untuk mengubah, menangguhkan, atau menghentikan layanan kapan saja tanpa pemberitahuan sebelumnya.',
        usage: 'Penggunaan yang Diizinkan',
        usageText: 'Pengguna hanya diperbolehkan mengunggah file yang legal dan tidak melanggar hak cipta. Dilarang mengunggah konten ilegal, berbahaya, atau melanggar hukum yang berlaku.',
        prohibited: 'Konten yang Dilarang',
        prohibitedItems: [
          'Malware, virus, atau kode berbahaya',
          'Konten pornografi atau eksplisit',
          'Materi yang melanggar hak cipta',
          'Konten yang mengandung kebencian atau diskriminasi',
          'Informasi pribadi orang lain tanpa izin',
          'Spam atau konten promosi berlebihan'
        ],
        limits: 'Batasan Layanan',
        limitsText: 'Setiap upload dibatasi maksimal 5 file dengan ukuran maksimal 100MB per file. Kami menerapkan rate limiting untuk mencegah penyalahgunaan layanan.',
        privacy: 'Privasi',
        privacyText: 'Kami menghormati privasi Anda. File yang diunggah disimpan dengan aman di multi-cloud storage. Kami tidak membagikan informasi pribadi Anda kepada pihak ketiga tanpa persetujuan Anda.',
        liability: 'Batasan Tanggung Jawab',
        liabilityText: 'Kabox tidak bertanggung jawab atas kehilangan data, kerusakan, atau kerugian yang timbul dari penggunaan layanan ini. Layanan disediakan sebagaimana adanya tanpa jaminan apapun.',
        termination: 'Penghentian Akses',
        terminationText: 'Kami berhak untuk memblokir atau menghapus file yang melanggar ketentuan ini tanpa pemberitahuan. IP address yang melakukan penyalahgunaan dapat diblokir secara permanen.',
        changes: 'Perubahan Ketentuan',
        changesText: 'Kami berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan akan berlaku segera setelah dipublikasikan di halaman ini.',
        contact: 'Kontak',
        contactText: 'Jika Anda memiliki pertanyaan tentang ketentuan ini, silakan hubungi kami melalui email atau Telegram yang tersedia di footer.'
      }
    }
  },
  en: {
    translation: {
      header: {
        brand: 'domku box'
      },
      nav: {
        home: 'Home',
        docs: 'API Documentation',
        terms: 'Terms & Conditions'
      },
      upload: {
        title: 'Upload Your Files',
        subtitle: 'Free, fast, and secure with multi-cloud CDN',
        dragDrop: 'Drag & Drop files here',
        or: 'or',
        clickSelect: 'Click to select files',
        maxFiles: 'Maximum 5 files, 100MB per file',
        startButton: 'Start Upload',
        uploading: 'Uploading...',
        processing: 'Processing...',
        selectFiles: 'Select Files'
      },
      results: {
        title: 'Files Uploaded Successfully',
        downloadUrl: 'Download Link',
        copy: 'Copy',
        copied: 'Copied!',
        open: 'Open',
        download: 'Download',
        storage: 'Storage',
        size: 'Size'
      },
      footer: {
        created: 'created by',
        with: 'with',
        and: 'and',
        code: 'code'
      },
      errors: {
        uploadFailed: 'Upload failed',
        networkError: 'Network error',
        fileTooBig: 'File too large',
        tooManyFiles: 'Too many files',
        invalidType: 'Invalid file type',
        selectFile: 'Please select a file first'
      },
      docs: {
        title: 'API Documentation',
        subtitle: 'Complete guide to using Kabox API',
        upload: 'Upload File',
        uploadDesc: 'Upload files to CDN',
        getFile: 'File Information',
        getFileDesc: 'Get file information',
        download: 'Download File',
        downloadDesc: 'Download file from CDN',
        status: 'Upload Status',
        statusDesc: 'Check file upload status',
        endpoint: 'Endpoint',
        method: 'Method',
        parameters: 'Parameters',
        response: 'Response',
        example: 'Example',
        curlExample: 'cURL Example',
        responseExample: 'Response Example'
      },
      terms: {
        title: 'Terms and Conditions',
        subtitle: 'Terms of service for Kabox',
        updated: 'Last updated',
        acceptance: 'Acceptance of Terms',
        acceptanceText: 'By using Kabox services, you agree to be bound by these terms and conditions. If you do not agree with these terms, please do not use our services.',
        service: 'Service',
        serviceText: 'Kabox provides free file hosting and Content Delivery Network (CDN) services for users. We reserve the right to change, suspend, or discontinue the service at any time without prior notice.',
        usage: 'Acceptable Use',
        usageText: 'Users are only allowed to upload legal files that do not infringe on copyrights. Uploading illegal, harmful, or unlawful content is prohibited.',
        prohibited: 'Prohibited Content',
        prohibitedItems: [
          'Malware, viruses, or harmful code',
          'Pornographic or explicit content',
          'Copyright infringing material',
          'Hateful or discriminatory content',
          'Personal information of others without permission',
          'Spam or excessive promotional content'
        ],
        limits: 'Service Limits',
        limitsText: 'Each upload is limited to a maximum of 5 files with a maximum size of 100MB per file. We implement rate limiting to prevent service abuse.',
        privacy: 'Privacy',
        privacyText: 'We respect your privacy. Uploaded files are stored securely in multi-cloud storage. We do not share your personal information with third parties without your consent.',
        liability: 'Limitation of Liability',
        liabilityText: 'Kabox is not responsible for any data loss, damage, or losses arising from the use of this service. The service is provided as-is without any warranties.',
        termination: 'Access Termination',
        terminationText: 'We reserve the right to block or delete files that violate these terms without notice. IP addresses that abuse the service may be permanently blocked.',
        changes: 'Changes to Terms',
        changesText: 'We reserve the right to change these terms and conditions at any time. Changes will take effect immediately upon publication on this page.',
        contact: 'Contact',
        contactText: 'If you have questions about these terms, please contact us via email or Telegram available in the footer.'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'id',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['path', 'navigator'],
      lookupFromPathIndex: 0
    }
  });

export default i18n;