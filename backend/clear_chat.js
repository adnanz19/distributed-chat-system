import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const namaKoleksi = 'messages'; 

async function eksekusiPembersihan() {
    try {
        console.log("⏳ Menyambungkan ke MongoDB...");
        // INI BAGIAN YANG KITA UBAH MENJADI MONGODB_URL
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("✅ Berhasil terhubung!");

        const db = mongoose.connection.db;
        const hasil = await db.collection(namaKoleksi).deleteMany({});

        console.log(`🧹 CLEAR CHAT BERHASIL: ${hasil.deletedCount} pesan telah dihapus dari basis data.`);

    } catch (error) {
        console.error("❌ Terjadi kesalahan saat menghapus:", error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

eksekusiPembersihan();