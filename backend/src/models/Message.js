import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    text : {
        type : String,
        required : true,
    },
    sender : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    },
    serverPort : {
        type : String,
        default : 'unknown',
    },
}, {
    timestamps : true,
})

export default mongoose.model('Message', messageSchema);