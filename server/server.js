import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './config/mongodb.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';

const port = process.env.PORT || 4000;
const app = express();

app.use(express.json());
app.use(cors(
    origin:'https://image-generator-mu-eight.vercel.app/'
));

// Routes
app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);
app.get('/', (req, res) => {
    res.send('Server is started');
});

// Start server and connect to MongoDB
const startServer = async () => {
    try {
        await connectDB();
        console.log('MongoDB connected successfully');
        
        app.listen(port, () => {
            console.log(`Server is running on port: ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();