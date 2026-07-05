import "dotenv/config";
import cors from 'cors';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

import connectDB from './src/db.js';
import { connectRedis } from './src/redis.js';
import { setupSocket } from './src/socket.js';
import authRoutes from './src/routes/authRoutes.js';
import messageRoutes from './src/routes/messageoutes.js';
import User from './src/models/User.js';
import fs from 'fs';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Mengizinkan semua frontend terhubung
        methods: ["GET", "POST"]
    }
});

// Konfigurasi Multer yang benar untuk mempertahankan ekstensi gambar (.jpg/.png)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Ambil ekstensi file aslinya (misal: .jpg)
        const ext = path.extname(file.originalname);
        // Buat nama unik ditambah dengan ekstensi aslinya
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

app.post('/api/update-profile', upload.single('profilePic'), async (req, res) => {
    try {
        // KITA UBAH: Tangkap currentUsername, bukan userId
        const { currentUsername, newUsername } = req.body;
        let updateData = {};
        
        if (newUsername) {
            updateData.username = newUsername;
        }

        if (req.file) {
            updateData.profilePic = `/uploads/${req.file.filename}`;
        }

        // KITA UBAH: Cari pengguna berdasarkan 'username' lamanya
        const updatedUser = await User.findOneAndUpdate(
            { username: currentUsername }, 
            updateData, 
            { returnDocument: 'after' }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
        }

        io.emit("user_profile_updated", {
            userId: updatedUser._id,
            username: updatedUser.username,
            profilePic: updatedUser.profilePic
        });

        res.json({ success: true, message: "Profil berhasil diperbarui", user: updatedUser });
    } catch (error) {
        console.error("Gagal memperbarui profil:", error);
        res.status(500).json({ success: false, message: "Terjadi kesalahan pada peladen." });
    }
});

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Buat folder jika belum ada
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Buka folder uploads agar bisa diakses publik
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROUTES ---
app.use('/api', authRoutes);
app.use('/api/messages', messageRoutes); 

// Fallback port ke 3001 jika process.env.PORT kosong (untuk lokal)
const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        await connectDB();
        await connectRedis();
        setupSocket(io);
        
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Gagal menjalankan server:", error);
    }
}

startServer();