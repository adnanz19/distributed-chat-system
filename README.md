# 💬 Final Project Komputasi Paralel dan Terdistribusi

> **Kelompok 1**  
> Aplikasi Chat Terdistribusi berbasis Web

## 📖 Deskripsi

Aplikasi **Chat Terdistribusi** merupakan aplikasi obrolan **real-time** berbasis web yang dibangun menggunakan arsitektur **client-server terdistribusi**. Proyek ini memisahkan **frontend** yang ringan dengan **backend** yang ditempatkan pada **Virtual Private Server (VPS)** untuk menangani autentikasi, penyimpanan data, serta komunikasi real-time menggunakan WebSocket.

---

## ✨ Fitur Utama

- 🔐 **Autentikasi Pengguna**
  - Login dan Register
  - Penyimpanan akun menggunakan MongoDB

- 💬 **Obrolan Real-Time**
  - Pengiriman pesan secara instan menggunakan Socket.io
  - Tidak memerlukan refresh halaman

- 🖼️ **Berbagi Gambar**
  - Upload gambar melalui tombol
  - Mendukung fitur **Drag & Drop**
  - Overlay otomatis ketika file diseret ke halaman chat

- 🔍 **Preview & Download Gambar**
  - Lightbox bergaya WhatsApp Desktop
  - Download gambar secara langsung menggunakan Blob Fetching

- 📊 **Informasi Sistem**
  - Live Clock
  - Menampilkan jumlah total pengguna yang terdaftar

- 📱 **UI Modern & Responsif**
  - Bento Grid Layout
  - Glassmorphism Design
  - Responsive untuk Desktop maupun Mobile

---

## 🛠️ Teknologi yang Digunakan

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Socket.io Client

### Backend

- Node.js
- Express.js (REST API)
- Socket.io
- Multer
- JWT Authentication

### Database

- MongoDB
- Mongoose

### Infrastruktur

- Virtual Private Server (VPS)
- Nginx
- PM2

---

# 🚀 Instalasi

## 1. Clone Repository

```bash
git clone https://github.com/username/repo-chat-terdistribusi.git
cd repo-chat-terdistribusi
```

---

## 2. Konfigurasi Backend

Pastikan sudah menginstall:

- Node.js
- MongoDB

Masuk ke folder backend:

```bash
cd backend
npm install
```

Buat file **`.env`**

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/chat_db
JWT_SECRET=rahasia_super_aman
```

Jalankan backend:

### Mode Development

```bash
npm run dev
```

### Mode Production (PM2)

```bash
pm2 start src/server.js --name chat-backend
```

---

## 3. Konfigurasi Frontend

Buka file:

```
frontend/script.js
```

Sesuaikan URL backend.

### Development

```javascript
const BACKEND_URL = "http://localhost:3001";
```

### Production

```javascript
const BACKEND_URL = "https://chat.domainanda.com";
```

Jalankan frontend menggunakan:

- Live Server (VS Code)
- Hosting statis (Netlify, Vercel, GitHub Pages)
- atau letakkan pada folder web server VPS seperti:

```
/var/www/
```

---

# 📁 Struktur Project

```
chat-terdistribusi/
│
├── backend/
│   ├── src/
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── ...
│
└── README.md
```

---

# 👥 Pengembang

Proyek ini dikembangkan oleh mahasiswa **Program Studi Informatika**  
**Universitas Pembangunan Nasional Veteran Jakarta**

| Nama | NIM |
|------|------|
| Ahmad Zayn Usman | 2310511001 |
| Nama Anggota 2 | xxxxxxxxxx |
| Nama Anggota 3 | xxxxxxxxxx |
| Nama Anggota 4 | xxxxxxxxxx |

---

# 📚 Mata Kuliah

**Komputasi Paralel dan Terdistribusi**

---

# 📄 Lisensi

Project ini dibuat untuk keperluan akademik sebagai tugas mata kuliah **Komputasi Paralel dan Terdistribusi**.

© Kelompok 1 - Universitas Pembangunan Nasional Veteran Jakarta
