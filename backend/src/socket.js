import { pubClient, subClient } from './redis.js';
import { verifySocketToken } from './middleware/authMiddleware.js';
import Message from './models/Message.js';
import User from './models/User.js'; // 🚨 Tambahan baru: Panggil model User

export const setupSocket = (io) => {
    io.use(verifySocketToken);

    subClient.subscribe('chat_channel', (message) => {
        const parsedMessage = JSON.parse(message);
        io.emit('receive_message', parsedMessage);
    });

    io.on('connection', (socket) => {
        console.log(`🔌 User terkoneksi: ${socket.user.username} (${socket.id})`);

        socket.on('send_message', async (data) => {
            try {
                const userValid = await User.findOne({ username: socket.user.username });
                
                if (!userValid) {
                    console.error('❌ User tidak ditemukan di database saat mengirim pesan');
                    return;
                }

                const newMessage = new Message({
                    sender: userValid._id, 
                    text: data.text,
                    serverPort: process.env.PORT || 3001
                });
                await newMessage.save();

                const payload = {
                    username: socket.user.username,
                    text: data.text,
                    server: process.env.PORT || 3001,
                    timestamp: newMessage.createdAt
                };

                await pubClient.publish('chat_channel', JSON.stringify(payload));
            } catch (error) {
                console.error('❌ Gagal memproses pesan:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ User terputus: ${socket.user.username}`);
        });
    });
};