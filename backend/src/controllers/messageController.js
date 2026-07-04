import Message from '../models/Message.js';

export const getMessages = async (req, res) => {
    try {
        // 1. Tambahkan .populate('sender', 'username') untuk menyedot nama user berdasarkan ID-nya
        const messages = await Message.find()
            .populate('sender', 'username') 
            .sort({ createdAt: 1 })
            .limit(50);

        // 2. Format ulang datanya agar sesuai dengan yang diharapkan Frontend (data.username)
        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            text: msg.text,
            // Ambil username dari relasi sender, jika terhapus/kosong beri nilai "Anonim"
            imageUrl: msg.imageUrl, // Tambahkan baris ini
            username: msg.sender ? msg.sender.username : "Anonim", 
            createdAt: msg.createdAt
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error("Gagal mengambil riwayat pesan:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};