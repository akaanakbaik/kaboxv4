import { v2 as cloudinary } from 'cloudinary';
import ImageKit from 'imagekit';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

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

const storageProviders = ['cloudinary', 'imagekit', 'supabase'];
let currentStorageIndex = 0;

function getNextStorage() {
  const storage = storageProviders[currentStorageIndex];
  currentStorageIndex = (currentStorageIndex + 1) % storageProviders.length;
  return storage;
}

export async function uploadToStorage(file, fileId) {
  const targetStorage = getNextStorage();
  
  try {
    let result;

    switch (targetStorage) {
      case 'cloudinary':
        result = await uploadToCloudinary(file, fileId);
        break;
      case 'imagekit':
        result = await uploadToImageKit(file, fileId);
        break;
      case 'supabase':
        result = await uploadToSupabase(file, fileId);
        break;
    }

    return {
      storage: targetStorage,
      url: result.url,
      publicId: result.publicId || fileId
    };
  } catch (error) {
    console.error(`Upload to ${targetStorage} failed:`, error);
    
    for (const fallbackStorage of storageProviders) {
      if (fallbackStorage === targetStorage) continue;
      
      try {
        let fallbackResult;
        
        switch (fallbackStorage) {
          case 'cloudinary':
            fallbackResult = await uploadToCloudinary(file, fileId);
            break;
          case 'imagekit':
            fallbackResult = await uploadToImageKit(file, fileId);
            break;
          case 'supabase':
            fallbackResult = await uploadToSupabase(file, fileId);
            break;
        }

        return {
          storage: fallbackStorage,
          url: fallbackResult.url,
          publicId: fallbackResult.publicId || fileId
        };
      } catch (fallbackError) {
        console.error(`Fallback to ${fallbackStorage} failed:`, fallbackError);
        continue;
      }
    }

    throw new Error('All storage providers failed');
  }
}

async function uploadToCloudinary(file, fileId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: fileId,
        resource_type: 'auto',
        folder: 'kabox',
        use_filename: true,
        unique_filename: false
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    uploadStream.end(file.data);
  });
}

async function uploadToImageKit(file, fileId) {
  try {
    const result = await imagekit.upload({
      file: file.data,
      fileName: `${fileId}_${file.name}`,
      folder: '/kabox',
      useUniqueFileName: false
    });

    return {
      url: result.url,
      publicId: result.fileId
    };
  } catch (error) {
    throw error;
  }
}

async function uploadToSupabase(file, fileId) {
  try {
    const fileName = `${fileId}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('kabox-files')
      .upload(fileName, file.data, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      if (error.message.includes('Bucket not found')) {
        const { error: createBucketError } = await supabase.storage.createBucket('kabox-files', {
          public: true
        });

        if (!createBucketError) {
          const { data: retryData, error: retryError } = await supabase.storage
            .from('kabox-files')
            .upload(fileName, file.data, {
              contentType: file.mimetype,
              upsert: false
            });

          if (retryError) throw retryError;
          
          const { data: urlData } = supabase.storage
            .from('kabox-files')
            .getPublicUrl(fileName);

          return {
            url: urlData.publicUrl,
            publicId: fileName
          };
        }
      }
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('kabox-files')
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      publicId: fileName
    };
  } catch (error) {
    throw error;
  }
}

export async function getStorageUrl(file) {
  try {
    if (file.url) {
      return file.url;
    }

    switch (file.storage) {
      case 'cloudinary':
        return file.url || `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/kabox/${file.id}`;
      
      case 'imagekit':
        return file.url || `${process.env.IMAGEKIT_URL_ENDPOINT}/kabox/${file.id}_${file.name}`;
      
      case 'supabase':
        const fileName = file.url ? file.url.split('/').pop() : `${file.id}_${file.name}`;
        const { data } = supabase.storage
          .from('kabox-files')
          .getPublicUrl(fileName);
        return data.publicUrl;
      
      default:
        return file.url;
    }
  } catch (error) {
    console.error('Error getting storage URL:', error);
    return file.url;
  }
}

export async function deleteFromStorage(file) {
  try {
    switch (file.storage) {
      case 'cloudinary':
        await cloudinary.uploader.destroy(file.publicId || file.id);
        break;
      
      case 'imagekit':
        await imagekit.deleteFile(file.publicId || file.id);
        break;
      
      case 'supabase':
        const fileName = file.url ? file.url.split('/').pop() : `${file.id}_${file.name}`;
        await supabase.storage.from('kabox-files').remove([fileName]);
        break;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting from storage:', error);
    return false;
  }
}