import express from 'express';
import { registerUser, loginUser, userCredits, paymentRazorpay, verifyRazorpay } from '../controllers/userController.js';
import { user } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser);
userRouter.get('/credits', user, userCredits);
userRouter.post('/pay-razor', user, paymentRazorpay)
userRouter.post('/verify-razor', user, verifyRazorpay)

export default userRouter;
// This code defines the user routes for registration and login in an Express application.