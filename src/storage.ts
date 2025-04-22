import fs from 'fs';
import { diskStorage } from 'multer';
import path from 'path';

export const createStorage = (folder: string, subfolder: string) => {
  return diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads', folder);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${subfolder}-${Date.now()}${ext}`;
      cb(null, filename);
    },
  });
};
