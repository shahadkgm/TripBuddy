// middleware/upload.middleware.ts
import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3 } from '../config/s3';
import path from 'path';
import { logger } from '@/utils/logger';

const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME!,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const folder = file.fieldname === 'avatar' ? 'guides' : (file.fieldname === 'gallery' ? 'gallery' : (file.fieldname === 'chat' ? 'chat' : 'kyc'));
    cb(null, `${folder}/${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.jfif'];
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

                const extension = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  const isExtensionValid = allowedExtensions.includes(extension);
           const isMimeTypeValid = allowedMimeTypes.includes(mimetype);

  logger.info(`File upload check: originalname="${file.originalname}", mimetype="${mimetype}", extension="${extension}", isExtensionValid=${isExtensionValid}, isMimeTypeValid=${isMimeTypeValid}`);

  if (isExtensionValid && isMimeTypeValid) {
    cb(null, true);
  } else {
    logger.error(`File upload rejected: originalname="${file.originalname}", mimetype="${mimetype}", extension="${extension}"`);
    cb(new Error(`Only images (${allowedExtensions.join(', ')}) are allowed!`));
  }
};

export const upload = multer({
  storage: s3Storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});
