import mongose from 'mongoose';
import bcrypt, { compare } from 'bcryptjs';

const userSchema = new mongose.Schema({
    username : {
        type : String,
        required : true,
        trim : true,
        minlength : 3,
    },
    password : {
        type : String,
        required : true,
        minlength : 8
    },
    // === INI TAMBAHANNYA ===
    profilePic : {
        type : String,
        default : "" // Default kosong jika user belum pernah upload foto
    }
    // =======================
})

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

export default mongose.model('User', userSchema);