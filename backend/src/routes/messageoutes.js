import express from 'express';
import { getMessages } from '../controllers/messageController.js';

const router = express.Router();

// Ini otomatis akan menjadi /api/messages karena kita atur awalan di server.js
router.get('/', getMessages); 

export default router;