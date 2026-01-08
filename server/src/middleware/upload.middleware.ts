// middleware/upload.middleware.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the directory
const uploadDir = 'uploads/';

// logic to ensure the directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    // Log this to see what the server is actually receiving
    console.log("Incoming file mimetype:", file.mimetype);

    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        // This is what triggered your error
        cb(new Error('Error: Only images (jpeg, jpg, png, gif) are allowed!'), false);
    }
};

export const upload = multer({ 
    storage,
    fileFilter, // Add the filter here
    limits: { fileSize: 5 * 1024 * 1024 } 
});
