export interface S3File extends Express.Multer.File {
  location: string;
  bucket: string;
  key: string;
  acl: string;
  contentType: string;
}
