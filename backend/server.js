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
import fs from 'fs';

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