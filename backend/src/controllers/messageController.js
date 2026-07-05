import Message from '../models/Message.js';

export const getMessages = async (req, res) => {
    try {
        // 1. Ambil 500 pesan TERBARU dari database
        const messages = await Message.find()
            // === UBAH BARIS INI: Tambahkan 'profilePic' setelah 'username' ===
            .populate('sender', 'username profilePic') 
            .sort({ createdAt: -1 }) 
            .limit(500);

        // 2. Putar balik urutan array-nya agar tampil rapi dari atas ke bawah di layar
        messages.reverse(); 

        // 3. Format ulang datanya agar sesuai dengan yang diharapkan Frontend
        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            text: msg.text,
            imageUrl: msg.imageUrl,
            username: msg.sender ? msg.sender.username : "Anonim", 
            // === TAMBAHKAN BARIS INI: Ekstrak foto profilnya ===
            profilePic: msg.sender ? msg.sender.profilePic : "",
            createdAt: msg.createdAt
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error("Gagal mengambil riwayat pesan:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};