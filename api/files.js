import { createClient } from '@supabase/supabase-js';
import { createClient as createLibsqlClient } from '@libsql/client';
import pkg from 'pg';
const { Pool } = pkg;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const neonPool = new Pool({
  connectionString: process.env.NEON_CONNECTION,
  ssl: { rejectUnauthorized: false }
});

const tursoClient = createLibsqlClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN
});

const databases = ['supabase', 'neon', 'turso'];

async function getFileFromDatabase(fileId) {
  for (const db of databases) {
    try {
      let result;

      switch (db) {
        case 'supabase':
          const { data: supabaseData } = await supabase
            .from('files')
            .select('*')
            .eq('id', fileId)
            .single();
          
          if (supabaseData) {
            return {
              id: supabaseData.id,
              name: supabaseData.name,
              size: supabaseData.size,
              mimeType: supabaseData.mime_type,
              storage: supabaseData.storage,
              url: supabaseData.url,
              status: supabaseData.status,
              createdAt: supabaseData.created_at
            };
          }
          break;

        case 'neon':
          const neonClient = await neonPool.connect();
          const neonResult = await neonClient.query(
            'SELECT * FROM files WHERE id = $1',
            [fileId]
          );
          neonClient.release();

          if (neonResult.rows.length > 0) {
            const row = neonResult.rows[0];
            return {
              id: row.id,
              name: row.name,
              size: row.size,
              mimeType: row.mime_type,
              storage: row.storage,
              url: row.url,
              status: row.status,
              createdAt: row.created_at
            };
          }
          break;

        case 'turso':
          const tursoResult = await tursoClient.execute({
            sql: 'SELECT * FROM files WHERE id = ?',
            args: [fileId]
          });

          if (tursoResult.rows.length > 0) {
            const row = tursoResult.rows[0];
            return {
              id: row.id,
              name: row.name,
              size: row.size,
              mimeType: row.mime_type,
              storage: row.storage,
              url: row.url,
              status: row.status,
              createdAt: row.created_at
            };
          }
          break;
      }
    } catch (error) {
      console.error(`Error querying ${db}:`, error);
      continue;
    }
  }

  return null;
}

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/').filter(Boolean);

  if (pathParts.length < 2) {
    return res.status(400).json({
      author: process.env.AUTHOR_NAME,
      email: process.env.AUTHOR_EMAIL,
      success: false,
      error: 'Invalid request'
    });
  }

  const fileId = pathParts[1];
  const action = pathParts[2];

  try {
    const file = await getFileFromDatabase(fileId);

    if (!file) {
      return res.status(404).json({
        author: process.env.AUTHOR_NAME,
        email: process.env.AUTHOR_EMAIL,
        success: false,
        error: 'File tidak ditemukan'
      });
    }

    if (action === 'download') {
      return res.redirect(302, file.url);
    } else if (action === 'status') {
      return res.status(200).json({
        author: process.env.AUTHOR_NAME,
        email: process.env.AUTHOR_EMAIL,
        success: true,
        data: {
          id: file.id,
          name: file.name,
          size: file.size,
          status: file.status,
          message: 'Upload completed',
          chunked: false,
          chunkCount: 0,
          downloadUrl: `${process.env.VITE_APP_URL || 'https://kabox.my.id'}/files/${fileId}/download`
        }
      });
    } else {
      return res.status(200).json({
        author: process.env.AUTHOR_NAME,
        email: process.env.AUTHOR_EMAIL,
        success: true,
        data: {
          id: file.id,
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
          createdAt: file.createdAt,
          downloadUrl: `${process.env.VITE_APP_URL || 'https://kabox.my.id'}/files/${fileId}/download`
        }
      });
    }
  } catch (error) {
    console.error('Files handler error:', error);
    return res.status(500).json({
      author: process.env.AUTHOR_NAME,
      email: process.env.AUTHOR_EMAIL,
      success: false,
      error: 'Terjadi kesalahan'
    });
  }
}