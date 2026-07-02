import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const getUserCount = async (req, res) => {
    try {
        // Menghitung total dokumen yang ada di dalam collection User
        const count = await User.countDocuments();
        res.json({ success: true, count: count });
    } catch (error) {
        console.error("Gagal menghitung user:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil data" });
    }
};

export const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Pengecekan manual di awal
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username dan Password wajib diisi' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ success: false, message: 'Username sudah terpakai' });

        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ success: true, message: 'Registrasi berhasil, silakan login' });
        
    } catch (error) {
        // Menangkap error validasi dari Mongoose secara eksplisit dan memberikan flag success: false
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: `Gagal: ${messages.join(', ')}` });
        }

        // 🚨 TAMBAHKAN BARIS INI UNTUK MELIHAT ERROR ASLINYA DI TERMINAL
        console.error("\n=== DETAIL ERROR INTERNAL ===");
        console.error(error);
        console.error("=============================\n");
        
        res.status(500).json({ success: false, message: 'Error server internal', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username dan Password wajib diisi' });
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Password salah' });

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ success: true, token, username: user.username });
        
    } catch (error) {
        console.error("\n=== DETAIL ERROR LOGIN ===");
        console.error(error);
        console.error("==========================\n");
        res.status(500).json({ success: false, message: 'Error server internal', error: error.message });
    }
};