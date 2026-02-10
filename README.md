# Kabox - Multi-Cloud CDN File Hosting

Platform upload dan hosting file gratis dengan CDN multi-cloud tercepat. Dibangun dengan Vite, React, Express.js, dan TailwindCSS.

![Kabox Logo](https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/logokaboxnobg.png)

## Fitur Utama

- 🚀 Upload file cepat dengan drag & drop
- ☁️ Multi-cloud storage (Cloudinary, ImageKit, Supabase)
- 🗄️ Multi-database (Supabase, Neon, Turso)
- 🌍 Internasionalisasi (Indonesia & English)
- 🔒 Keamanan tingkat tinggi (Rate limiting, XSS protection, SQL injection prevention)
- 📱 Mobile-friendly dan responsive
- 🎨 Modern UI dengan animasi smooth
- 🤖 Telegram bot untuk monitoring
- 📊 Real-time upload progress
- 🔗 Direct download links

## Tech Stack

### Frontend
- Vite
- React 18
- React Router DOM
- TailwindCSS
- Framer Motion
- Radix UI
- shadcn/ui
- i18next
- React Dropzone
- Axios
- Lucide Icons

### Backend
- Express.js
- Multi-database (PostgreSQL via Supabase & Neon, SQLite via Turso)
- Multi-storage (Cloudinary, ImageKit, Supabase Storage)
- Node Telegram Bot API
- Helmet (Security)
- Express Rate Limit
- XSS & Validator

## Setup & Installation

### 1. Clone Repository

```bash
git clone https://github.com/akaanakbaik/kabox.git
cd kabox
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy `.env.example` ke `.env` dan isi dengan credentials Anda:

```env
VITE_APP_NAME=kabox
VITE_APP_URL=https://kabox.my.id
PORT=3000

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_CONNECTION=your_connection_string

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint

# Neon Database
NEON_CONNECTION=your_neon_connection

# Turso Database
TURSO_TOKEN=your_turso_token
TURSO_URL=your_turso_url

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_OWNER_ID=your_owner_id
TELEGRAM_CHANNEL_ID=your_channel_id

# Author
AUTHOR_NAME=aka
AUTHOR_EMAIL=akaanakbaik17@proton.me
```

### 4. Setup Database

Jalankan SQL berikut di masing-masing database:

#### Supabase & Neon (PostgreSQL)

```sql
CREATE TABLE IF NOT EXISTS files (
  id VARCHAR(255) PRIMARY KEY,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type VARCHAR(255),
  storage VARCHAR(50),
  url TEXT,
  ip VARCHAR(45),
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Turso (SQLite)

```sql
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT,
  storage TEXT,
  url TEXT,
  ip TEXT,
  status TEXT DEFAULT 'completed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Development

Jalankan frontend dan backend secara bersamaan:

```bash
npm run dev
```

Atau jalankan terpisah:

```bash
npm run dev
npm run server
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

### 6. Build untuk Production

```bash
npm run build
```

## Deployment ke Vercel

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login ke Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

### 4. Set Environment Variables

Di dashboard Vercel, tambahkan semua environment variables dari file `.env`.

### 5. Deploy Production

```bash
vercel --prod
```

## API Documentation

### Upload File

```bash
POST /api/upload
Content-Type: multipart/form-data

curl -X POST https://kabox.my.id/api/upload \
  -F "files=@image.jpg" \
  -F "files=@document.pdf"
```

Response:
```json
{
  "author": "aka",
  "email": "akaanakbaik17@proton.me",
  "success": true,
  "data": [
    {
      "success": true,
      "id": "abc123xyz456",
      "name": "image.jpg",
      "size": 1048576,
      "downloadUrl": "https://kabox.my.id/files/abc123xyz456/download",
      "storage": "cloudinary"
    }
  ]
}
```

### Get File Info

```bash
GET /files/:id

curl https://kabox.my.id/files/abc123xyz456
```

### Download File

```bash
GET /files/:id/download

curl -OJ https://kabox.my.id/files/abc123xyz456/download
```

### Check Upload Status

```bash
GET /files/:id/status

curl https://kabox.my.id/files/abc123xyz456/status
```

## Telegram Bot Commands

Bot dapat dikontrol oleh owner dengan commands berikut:

- `/start` - Mulai bot
- `/help` - Daftar perintah
- `/stats` - Statistik upload & download
- `/system` - Info sistem server
- `/database` - Status database
- `/storage` - Info penyimpanan
- `/logs` - Log aktivitas
- `/uptime` - Waktu server online
- `/memory` - Penggunaan memory
- `/cpu` - Penggunaan CPU
- `/health` - Health check lengkap
- `/monitor` - Toggle monitoring
- `/users` - Statistik pengguna
- `/files` - Daftar file

## Security Features

- XSS Protection
- SQL Injection Prevention
- Rate Limiting (10 requests per second)
- CORS Configuration
- Helmet Security Headers
- File Type Validation
- File Size Limits
- IP Blocking
- Sanitization & Validation

## Limits

- Maximum 5 files per upload
- Maximum 100MB per file
- Rate limit: 10 requests per second per IP
- Supported: All common file formats

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT License - see LICENSE file for details

## Author

**aka**
- Email: akaanakbaik17@proton.me
- Website: https://akadev.me
- Telegram: @akamodebaik
- GitHub: @akaanakbaik

## Support

Untuk bantuan atau pertanyaan:
- Email: akaanakbaik17@proton.me
- Telegram: https://t.me/akamodebaik
- Channel: https://t.me/annountandmonitkabox

---

Made with ❤️ and code by aka