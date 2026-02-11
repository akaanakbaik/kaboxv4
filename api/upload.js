import formidable from 'formidable';
import { nanoid } from 'nanoid';
import { v2 as cloudinary } from 'cloudinary';
import ImageKit from 'imagekit';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { createReadStream } from 'fs';

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
    const fileBuffer = readFileSync(file.filepath);
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: fileId,
        resource_type: 'auto',
        folder: 'kabox'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary error:', error);
          reject(error);
        } else {
          resolve({ url: result.secure_url, storage: 'cloudinary' });
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
}

async function uploadToImageKit(file, fileId) {
  try {
    const fileBuffer = readFileSync(file.filepath);
    
    const result = await imagekit.upload({
      file: fileBuffer,
      fileName: `${fileId}_${file.originalFilename}`,
      folder: '/kabox'
    });
    
    return { url: result.url, storage: 'imagekit' };
  } catch (error) {
    console.error('ImageKit error:', error);
    throw error;
  }
}

async function uploadToSupabase(file, fileId) {
  try {
    const fileBuffer = readFileSync(file.filepath);
    const fileName = `${fileId}_${file.originalFilename}`;
    
    const { data, error } = await supabase.storage
      .from('kabox-files')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase storage error:', error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('kabox-files')
      .getPublicUrl(fileName);

    return { url: urlData.publicUrl, storage: 'supabase' };
  } catch (error) {
    console.error('Supabase error:', error);
    throw error;
  }
}

async function saveToDatabase(fileData) {
  try {
    const { data, error } = await supabase
      .from('files')
      .insert([{
        id: fileData.id,
        name: fileData.name,
        size: fileData.size,
        mime_type: fileData.mimeType,
        storage: fileData.storage,
        url: fileData.url,
        status: 'completed'
      }])
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Database save error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      author: process.env.AUTHOR_NAME || 'aka',
      email: process.env.AUTHOR_EMAIL || 'akaanakbaik17@proton.me',
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    console.log('Upload request received');
    
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024,
      maxFiles: 5,
      keepExtensions: true,
      multiples: true
    });

    const [fields, files] = await form.parse(req);

    console.log('Files parsed:', files);

    if (!files.files || files.files.length === 0) {
      return res.status(400).json({
        author: process.env.AUTHOR_NAME || 'aka',
        email: process.env.AUTHOR_EMAIL || 'akaanakbaik17@proton.me',
        success: false,
        error: 'Tidak ada file yang diupload'
      });
    }

    const uploadResults = [];
    const fileArray = Array.isArray(files.files) ? files.files : [files.files];

    console.log(`Processing ${fileArray.length} files`);

    for (const file of fileArray) {
      const fileId = nanoid(12);
      const storage = getNextStorage();

      console.log(`Processing file: ${file.originalFilename}, storage: ${storage}`);

      try {
        let result;

        if (storage === 'cloudinary') {
          console.log('Uploading to Cloudinary...');
          result = await uploadToCloudinary(file, fileId);
        } else if (storage === 'imagekit') {
          console.log('Uploading to ImageKit...');
          result = await uploadToImageKit(file, fileId);
        } else {
          console.log('Uploading to Supabase...');
          result = await uploadToSupabase(file, fileId);
        }

        console.log('Upload successful:', result);

        const downloadUrl = `${process.env.VITE_APP_URL || 'https://kabox.my.id'}/files/${fileId}/download`;

        console.log('Saving to database...');
        await saveToDatabase({
          id: fileId,
          name: file.originalFilename,
          size: file.size,
          mimeType: file.mimetype,
          storage: result.storage,
          url: result.url
        });

        console.log('Database save successful');

        uploadResults.push({
          success: true,
          id: fileId,
          name: file.originalFilename,
          size: file.size,
          downloadUrl: downloadUrl,
          storage: result.storage
        });

        console.log('File processed successfully:', fileId);
      } catch (error) {
        console.error(`Error processing file ${file.originalFilename}:`, error);
        console.error('Error stack:', error.stack);
        
        uploadResults.push({
          success: false,
          filename: file.originalFilename,
          error: error.message || 'Upload failed'
        });
      }
    }

    console.log('Upload complete, results:', uploadResults);

    return res.status(200).json({
      author: process.env.AUTHOR_NAME || 'aka',
      email: process.env.AUTHOR_EMAIL || 'akaanakbaik17@proton.me',
      success: true,
      data: uploadResults
    });
  } catch (error) {
    console.error('Handler error:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      author: process.env.AUTHOR_NAME || 'aka',
      email: process.env.AUTHOR_EMAIL || 'akaanakbaik17@proton.me',
      success: false,
      error: error.message || 'Terjadi kesalahan saat upload'
    });
  }
}
