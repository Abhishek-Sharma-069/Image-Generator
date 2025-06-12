import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import Razorpay from "razorpay";
import crypto from 'crypto';

// Initialize Razorpay
const razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please fill all fields" });
        }

        if(!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({success: false, message: "Password must be at least 8 characters long"});
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newuser = new userModel(userData);
        const user = await newuser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.status(201).json({
            success: true,
            token,
            user: {
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: error.message 
        });
    }
} 


const loginUser = async (req, res) => {
    try { 
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({ success: false, message: "Please fill all fields" });
        }


        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

        res.json({
            success: true,
            token,
            user: {
                name: user.name,
            }
        });

        }
        else {
            return res.json({ success: false, message: "Invalid details" });
        }
    }
    catch(error){}
}

const userCredits = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            credits: user.creditBalance,
            user: {
                name: user.name
            }
        });
    } catch (error) {
        console.error("Error in userCredits:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: error.message 
        });
    }
};

const paymentRazorpay = async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.body.userId;

        if (!planId || !userId) {
            return res.status(400).json({ success: false, message: "Missing details" });
        }

        // Define credit plans
        const plans = {
            1: { credits: 5, amount: 99 },
            2: { credits: 15, amount: 199 },
            3: { credits: 30, amount: 299 }
        };

        const plan = plans[planId];
        if (!plan) {
            return res.status(400).json({ success: false, message: "Invalid plan" });
        }

        const options = {
            amount: plan.amount * 100, // Convert to paisa
            currency: process.env.CURRENCY || "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpayClient.orders.create(options);

        res.json({
            success: true,
            order,
            planDetails: plan
        });

    } catch (error) {
        console.error("Error in payment:", error);
        res.status(500).json({ success: false, message: "Payment failed", error: error.message });
    }
};

const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const userId = req.body.userId;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
            return res.status(400).json({ success: false, message: "Missing payment details" });
        }

        // Verify signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // Get order details to know how many credits to add
        const order = await razorpayClient.orders.fetch(razorpay_order_id);
        const creditPlans = {
            9900: 5,
            19900: 15,
            29900: 30
        };

        const creditsToAdd = creditPlans[order.amount];
        if (!creditsToAdd) {
            return res.status(400).json({ success: false, message: "Invalid order amount" });
        }

        // Add credits to user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.creditBalance += creditsToAdd;
        await user.save();

        res.json({
            success: true,
            message: "Payment verified and credits added",
            credits: user.creditBalance
        });

    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: "Payment verification failed", error: error.message });
    }
};

export { registerUser, loginUser, userCredits, verifyRazorpay, paymentRazorpay };