import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    plan: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    creadits:{ type: Number, required: true },
    paymant: { type: Boolean, default: false },
    date: { type: number, default: Date.now },
})

const transactionModel = mongoose.model.transactionModel||mongoose.model('transaction', transactionSchema);

export default transactionModelModel;
// This code defines a Mongoose schema for a user model in a MongoDB database.