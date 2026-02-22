// middleware/upload.middleware.ts
import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3 } from '../config/s3';
import path from 'path';

const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME!,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const folder = file.fieldname === 'avatar' ? 'guides' : 'kyc';
    cb(null, `${folder}/${uniqueSuffix}${path.extname(file.originalname)}`);
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
  storage: s3Storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

