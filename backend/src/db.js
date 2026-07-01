import { connect } from 'mongoose';

const connectDB = async () => {
    try {
        const url = process.env.MONGODB_URL;
        await connect(url);
        console.log('Connected to MongoDB');
    } 
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

export default connectDB;