import Message from '../models/Message.js';

export const getMessages = async (req, res) => {
    try {
        // 1. Ambil 50 pesan TERBARU dari database (gunakan -1)
        const messages = await Message.find()
            .populate('sender', 'username') 
            .sort({ createdAt: -1 }) // <--- UBAH JADI -1 (Dari baru ke lama)
            .limit(500);

        // 2. Putar balik urutan array-nya agar tampil rapi dari atas ke bawah di layar
        messages.reverse(); // <--- TAMBAHKAN BARIS INI

        // 3. Format ulang datanya agar sesuai dengan yang diharapkan Frontend
        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            text: msg.text,
            imageUrl: msg.imageUrl,
            // Ambil username dari relasi sender, jika terhapus/kosong beri nilai "Anonim"
            username: msg.sender ? msg.sender.username : "Anonim", 
            createdAt: msg.createdAt
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error("Gagal mengambil riwayat pesan:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};