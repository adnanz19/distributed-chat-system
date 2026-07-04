import express from 'express';
import { getMessages } from '../controllers/messageController.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Konfigurasi Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', getMessages); 

// Rute baru untuk menerima gambar
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Tidak ada file' });
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

export default router;