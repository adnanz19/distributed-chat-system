import "dotenv/config"

import connectDB from './src/db.js';
import { connectRedis } from './src/redis.js';
import { setupSocket } from './src/socket.js';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import authRoutes from './src/routes/authRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', authRoutes);

const PORT = process.env.PORT;

const startServer = async () => {
    try {
        await connectDB();
        await connectRedis();
        setupSocket(io);
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
}

startServer();  

