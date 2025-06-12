// Middleware to check if the user is authenticated
import jwt from 'jsonwebtoken';

const user = async (req, res, next) => {
    const { token } = req.headers;
    if (!token){
        return res.json({ success:false, message: 'Unauthorized login again' });
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        if (token_decode.id) {
            req.body.userId = token_decode.id;
        } else {
            return res.json({ success: false, message: 'Unauthorized login again' });
        }

        next();
    } catch(error) {
        console.error('Error in user middleware:', error);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

export { user };