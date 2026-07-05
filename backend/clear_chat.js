import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const namaKoleksi = 'messages'; 
const folderUploads = './uploads'; // <-- SIFATNYA FLEKSIBEL: Sesuaikan dengan nama folder upload Anda

async function eksekusiPembersihan() {
    try {
        // ==========================================
        // 1. BERSIHKAN DATA CHAT DI MONGODB
        // ==========================================
        console.log("⏳ Menyambungkan ke MongoDB...");
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("✅ Berhasil terhubung!");

        const db = mongoose.connection.db;
        const hasil = await db.collection(namaKoleksi).deleteMany({});
        console.log(`🧹 CLEAR CHAT BERHASIL: ${hasil.deletedCount} pesan telah dihapus dari basis data.`);

        // ==========================================
        // 2. BERSIHKAN FILE FOTO DI SERVER
        // ==========================================
        console.log("⏳ Membersihkan file foto di folder server...");
        
        try {
            const files = await fs.readdir(folderUploads);
            let jumlahFotoDihapus = 0;

            for (const file of files) {
                // Mengabaikan file sistem tersembunyi seperti .gitkeep jika ada
                if (file !== '.gitkeep') {
                    await fs.unlink(path.join(folderUploads, file));
                    jumlahFotoDihapus++;
                }
            }
            console.log(`📸 CLEAR FOTO BERHASIL: ${jumlahFotoDihapus} file gambar telah dihapus dari folder '${folderUploads}'.`);
        } catch (folderError) {
            console.log(`⚠️ Catatan: Folder '${folderUploads}' tidak ditemukan atau kosong.`);
        }

    } catch (error) {
        console.error("❌ Terjadi kesalahan saat menghapus:", error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

eksekusiPembersihan();