import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    creditBalance: { type: Number, default: 5 },
})

const userModel = mongoose.model('user', userSchema);

export default userModel;
// This code defines a Mongoose schema for a user model in a MongoDB database.