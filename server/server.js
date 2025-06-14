import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './config/mongodb.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';

const app = express();

app.use(express.json());
app.use(cors({
    origin: ['https://image-generator-mu-eight.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// Connect to MongoDB
connectDB()
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);
app.get('/', (req, res) => {
    res.json({ 
        status: 'success',
        message: 'Server is running'
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!' 
    });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
}

export default app;