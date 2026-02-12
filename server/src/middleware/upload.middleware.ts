// middleware/upload.middleware.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  console.log('Incoming file mimetype:', file.mimetype);

  const allowedTypes = /jpeg|jpg|png|gif/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images allowed'));
  }
};


export const upload = multer({ 
    storage,
    fileFilter, 
    limits: { fileSize: 5 * 1024 * 1024 } 
});
