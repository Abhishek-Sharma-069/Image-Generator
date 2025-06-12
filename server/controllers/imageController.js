import userModel from "../models/userModel.js";
import FormData from "form-data";
import axios from "axios";

export const generateImage = async (req, res) => { 
    try {
        const userId = req.body.userId; // From auth middleware
        const { prompt } = req.query; // Get prompt from query params

        if (!userId || !prompt) {
            return res.status(400).json({ success: false, message: "Missing Details" });  
        }

        const user = await userModel.findById(userId);

        if (!user || user.creditBalance === 0) {
            return res.status(400).json({ success: false, message: "Insufficient credits" });
        }

        const formData = new FormData();
        formData.append("prompt", prompt);
        
        const response = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
                ...formData.getHeaders()
            },
            responseType: 'arraybuffer'
        });

        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        const resultImage = `data:image/png;base64,${base64Image}`;

        // Deduct credit
        user.creditBalance -= 1;
        await user.save();

        return res.json({
            success: true,
            resultImage,
            creditBalance: user.creditBalance
        });

    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error generating image",
            error: error.message 
        });
    }
};