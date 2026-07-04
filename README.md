# Distributed Chat System

> Final Project Mata Kuliah **Komputasi Paralel dan Terdistribusi**  
> Program Studi Informatika  
> Universitas Pembangunan Nasional Veteran Jakarta

![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![Express](https://img.shields.io/badge/Express.js-Backend-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-white)
![License](https://img.shields.io/badge/License-Academic-blue)

---

## Deskripsi

**Distributed Chat System** merupakan aplikasi chat berbasis web yang menerapkan konsep **client-server terdistribusi**. Sistem memisahkan frontend dan backend sehingga komunikasi real-time dapat dilakukan secara efisien menggunakan **Socket.IO**, sedangkan backend bertanggung jawab terhadap autentikasi pengguna, penyimpanan data, dan pengelolaan pesan.

---

## Fitur

- Login & Register
- Real-Time Chat
- Upload Gambar
- Drag & Drop Upload
- Lightbox Preview
- Download Gambar
- Live Clock
- Total Registered Users
- Responsive Design
- Glassmorphism UI
- Bento Grid Layout

---

## Arsitektur Sistem

```
                Internet
                    │
                    │
             ┌─────────────┐
             │   Frontend  │
             │ HTML/CSS/JS │
             └──────┬──────┘
                    │
             HTTP / WebSocket
                    │
          ┌─────────▼─────────┐
          │   Nginx (VPS)     │
          │ Reverse Proxy     │
          └─────────┬─────────┘
                    │
             Node.js + Express
                    │
          Socket.IO Server
                    │
               MongoDB
```

---

## Tech Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Socket.IO Client

### Backend

- Node.js
- Express.js
- Socket.IO
- JWT
- Multer

### Database

- MongoDB
- Mongoose

### Deployment

- VPS
- PM2
- Nginx

---

## Struktur Folder

```
distributed-chat-system
│
├── backend
│   ├── src
│   ├── uploads
│   ├── package.json
│   └── .env
│
├── frontend
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets
│
└── README.md
```

---

# Instalasi

## Clone Repository

```bash
git clone https://github.com/adnanz19/distributed-chat-system.git
cd distributed-chat-system
```

---

## Backend

```bash
cd backend
npm install
```

Buat file **.env**

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/chat_db
JWT_SECRET=your_secret_key
```

Jalankan server

```bash
npm run dev
```

atau

```bash
pm2 start src/server.js --name chat-backend
```

---

## Frontend

Buka

```
frontend/script.js
```

Ubah URL backend

```javascript
const BACKEND_URL = "http://localhost:3001";
```

Lalu jalankan menggunakan Live Server atau deploy ke VPS.

---

## Screenshot
**Tampilan awal login**
<img width="1917" height="865" alt="Screenshot 2026-07-04 222415" src="https://github.com/user-attachments/assets/82384ba4-1420-403e-af1b-25796b5252ec" />

**Tampilan chat**
<img width="1917" height="867" alt="Screenshot 2026-07-04 223240" src="https://github.com/user-attachments/assets/cbaa8b4e-3976-4fde-8536-139e4ee3aa06" />

---

## Tim Pengembang

| Nama | NIM |
|------|------|
| Ahmad Zayn Usman | 2310511001 |
| Fandi Yakub |  2310511005 |
| Fauzio Yunus Alim | 2310511020 |
| Muhammad Hanif | 2310511038 |
| Bima Adnandita  | 2310511039|

---

## Mata Kuliah

**Komputasi Paralel dan Terdistribusi**

Universitas Pembangunan Nasional Veteran Jakarta

---

## Lisensi

Project ini dibuat untuk keperluan akademik sebagai Final Project mata kuliah **Komputasi Paralel dan Terdistribusi**.
