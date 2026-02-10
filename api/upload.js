import formidable from 'formidable';
import { nanoid } from 'nanoid';
import { v2 as cloudinary } from 'cloudinary';
import ImageKit from 'imagekit';
import { createClient } from '@supabase/supabase-js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const config = {
  api: {
    bodyParser: false,
  },
};

const storageProviders = ['cloudinary', 'imagekit', 'supabase'];
let currentStorageIndex = 0;

function getNextStorage() {
  const storage = storageProviders[currentStorageIndex];
  currentStorageIndex = (currentStorageIndex + 1) % storageProviders.length;
  return storage;
}

async function uploadToCloudinary(file, fileId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        public_id: fileId,
        resource_type: 'auto',
        folder: 'kabox'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, storage: 'cloudinary' });
      }
    ).end(file.buffer);
  });
}

async function uploadToImageKit(file, fileId) {
  const result = await imagekit.upload({
    file: file.buffer,
    fileName: `${fileId}_${file.originalFilename}`,
    folder: '/kabox'
  });
  return { url: result.url, storage: 'imagekit' };
}

async function uploadToSupabase(file, fileId) {
  const fileName = `${fileId}_${file.originalFilename}`;
  const { data, error } = await supabase.storage
    .from('kabox-files')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('kabox-files')
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl, storage: 'supabase' };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      author: process.env.AUTHOR_NAME,
      email: process.env.AUTHOR_EMAIL,
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024,
      maxFiles: 5
    });

    const [fields, files] = await form.parse(req);

    if (!files.files || files.files.length === 0) {
      return res.status(400).json({
        author: process.env.AUTHOR_NAME,
        email: process.env.AUTHOR_EMAIL,
        success: false,
        error: 'Tidak ada file yang diupload'
      });
    }

    const uploadResults = [];
    const fileArray = Array.isArray(files.files) ? files.files : [files.files];

    for (const file of fileArray) {
      const fileId = nanoid(12);
      const storage = getNextStorage();

      try {
        let result;
        const fs = require('fs');
        file.buffer = fs.readFileSync(file.filepath);

        if (storage === 'cloudinary') {
          result = await uploadToCloudinary(file, fileId);
        } else if (storage === 'imagekit') {
          result = await uploadToImageKit(file, fileId);
        } else {
          result = await uploadToSupabase(file, fileId);
        }

        const downloadUrl = `${process.env.VITE_APP_URL || 'https://kabox.my.id'}/files/${fileId}/download`;

        await supabase.from('files').insert([{
          id: fileId,
          name: file.originalFilename,
          size: file.size,
          mime_type: file.mimetype,
          storage: result.storage,
          url: result.url,
          status: 'completed'
        }]);

        uploadResults.push({
          success: true,
          id: fileId,
          name: file.originalFilename,
          size: file.size,
          downloadUrl: downloadUrl,
          storage: result.storage
        });
      } catch (error) {
        console.error('Upload error:', error);
        uploadResults.push({
          success: false,
          filename: file.originalFilename,
          error: error.message
        });
      }
    }

    return res.status(200).json({
      author: process.env.AUTHOR_NAME,
      email: process.env.AUTHOR_EMAIL,
      success: true,
      data: uploadResults
    });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      author: process.env.AUTHOR_NAME,
      email: process.env.AUTHOR_EMAIL,
      success: false,
      error: error.message || 'Terjadi kesalahan saat upload'
    });
  }
}