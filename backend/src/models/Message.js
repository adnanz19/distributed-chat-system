import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    text : {
        type : String,
        default : "", // Tidak lagi required
    },
    imageUrl: {
        type : String,
        default: null, // Menyimpan tautan gambar
    },
    sender : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    },
}, {
    timestamps : true,
})

export default mongoose.model('Message', messageSchema);