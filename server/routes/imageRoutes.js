import express from 'express';
import { user } from '../middleware/auth.js';
import { generateImage } from '../controllers/imageController.js';

const imageRouter = express.Router();


imageRouter.get('/generate-image', user, generateImage);

export default imageRouter;
// This code defines the image routes for generating images in an Express application.
