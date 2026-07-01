import jwt from 'jsonwebtoken';

// Pastikan parameter (socket, next) tertulis dengan benar di sini
export const verifySocketToken = (socket, next) => {
    // Menggunakan optional chaining (?.) agar tidak langsung crash jika struktur datanya tidak lengkap
    const token = socket.handshake?.auth?.token;

    if (!token) {
        return next(new Error('Akses ditolak. Token tidak ditemukan.'));
    }

    try {
        // Kita berikan nilai cadangan yang sama persis dengan yang ada di authController
        const secretKey = process.env.JWT_SECRET || 'tugas_akhir_komputasi_paralel';
        
        const decoded = jwt.verify(token, secretKey);
        socket.user = decoded; // Menyisipkan data user ke dalam socket
        next(); // Melanjutkan proses koneksi
    } catch (error) {
        return next(new Error('Token tidak valid atau kedaluwarsa.'));
    }
};