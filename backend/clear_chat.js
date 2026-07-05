require('dotenv').config();
const mongoose = require('mongoose');

// Pastikan nama ini sesuai dengan nama koleksi di MongoDB Anda (biasanya 'messages' atau 'chats')
const namaKoleksi = 'messages'; 

async function eksekusiPembersihan() {
    try {
        console.log("⏳ Menyambungkan ke MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Berhasil terhubung!");

        // Mengeksekusi penghapusan massal
        const db = mongoose.connection.db;
        const hasil = await db.collection(namaKoleksi).deleteMany({});

        console.log(`🧹 CLEAR CHAT BERHASIL: ${hasil.deletedCount} pesan telah dihapus dari basis data.`);

    } catch (error) {
        console.error("❌ Terjadi kesalahan saat menghapus:", error.message);
    } finally {
        // Menutup koneksi agar terminal kembali siap digunakan
        await mongoose.disconnect();
        process.exit(0);
    }
}

eksekusiPembersihan();