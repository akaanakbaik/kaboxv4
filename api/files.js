import { createClient } from '@supabase/supabase-js';
import { createClient as createLibsqlClient } from '@libsql/client';
import pkg from 'pg';
const { Pool } = pkg;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

let neonPool;
let tursoClient;

try {
  if (process.env.NEON_CONNECTION) {
    neonPool = new Pool({
      connectionString: process.env.NEON_CONNECTION,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
} catch (error) {
  console.error('Neon connection error:', error);
}

try {
  if (process.env.TURSO_URL && process.env.TURSO_TOKEN) {
    tursoClient = createLibsqlClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_TOKEN
    });
  }
} catch (error) {
  console.error('Turso connection error:', error);
}

async function getFileFromSupabase(fileId) {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();
    
    if (error) {
      console.error('Supabase query error:', error);
      return null;
    }

    if (data) {
      return {
        id: data.id,
        name: data.name,
        size: data.size,
        mimeType: data.mime_type,
        storage: data.storage,
        url: data.url,
        status: data.status,
        createdAt: data.created_at
      };
    }

    return null;
  } catch (error) {
    console.error('Supabase error:', error);
    return null;
  }
}

async function getFileFromNeon(fileId) {
  if (!neonPool) return null;

  try {
    const client = await neonPool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM files WHERE id = $1 LIMIT 1',
        [fileId]
      );

      if (result.rows.length > 0) {
        const row = result.rows[0];
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

      return null;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Neon query error:', error);
    return null;
  }
}

async function getFileFromTurso(fileId) {
  if (!tursoClient) return null;

  try {
    const result = await tursoClient.execute({
      sql: 'SELECT * FROM files WHERE id = ? LIMIT 1',
      args: [fileId]
    });

    if (result.rows.length > 0) {
      const row = result.rows[0];
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

    return null;
  } catch (error) {
    console.error('Turso query error:', error);
    return null;
  }
}

async function getFileFromDatabase(fileId) {
  console.log('Getting file from database:', fileId);

  const databases = [
    { name: 'supabase', fn: getFileFromSupabase },
    { name: 'neon', fn: getFileFromNeon },
    { name: 'turso', fn: getFileFromTurso }
  ];

  for (const db of databases) {
    try {
      console.log(`Trying ${db.name}...`);
      const file = await db.fn(fileId);
      
      if (file) {
        console.log(`File found in ${db.name}`);
        return file;
      }
    } catch (error) {
      console.error(`Error querying ${db.name}:`, error);
      continue;
    }
  }

  console.log('File not found in any database');
  return null;
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);

    console.log('Files handler called:', url.pathname);
    console.log('Path parts:', pathParts);

    if (pathParts.length < 2) {
      return res.status(400).json({
        author: process.env.AUTHOR_NAME || 'aka',
        email: process.env.AUTHOR_EMAIL || 'akaanakbaik17@proton.me',
        success: false,
        error: 'Invalid request'
      });
    }

    const fileId = pathParts[1];
    const action = pathParts[2];

    console.log('File ID:', fileId);
    console.log('Action:', action);

    const file = await getFileFromDatabase(fileId);

    if (!file) {
      console.log('File not found:', fileId);
      return res.status(404).json({
        author: process.env.AUTHOR_NAME || 'aka',
        email: process.env.AUTHOR_EMAIL || 'akaanakbaik17@proton.me',
        success: false,
        error: 'File tidak ditemukan'
      });
    }

    console.log('File found:', file);

    if (action === 'download') {
      console.log('Redirecting to:', file.url);
      return res.redirect(302, file.url);
    } else if (action === 'status') {
      return res.status(200).json({
        author: process.env.AUTHOR_NAME || 'aka',
        email: process.env.AUTHOR_EMAIL || 'akaanakbaik17@proton.me',
        success: true,
        data: {
          id: file.id,
          name: file.name,
          size: file.size,
          status: file.status || 'completed',
          message: 'Upload completed',
          chunked: false,
          chunkCount: 0,
          downloadUrl: `${process.env.VITE_APP_URL || 'https://kabox.my.id'}/files/${fileId}/download`
        }
      });
    } else {
      return res.status(200).json({
        author: process.env.AUTHOR_NAME || 'aka',
        email: process.env.AUTHOR_EMAIL || 'akaanakbaik17@proton.me',
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
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      author: process.env.AUTHOR_NAME || 'aka',
      email: process.env.AUTHOR_EMAIL || 'akaanakbaik17@proton.me',
      success: false,
      error: error.message || 'Terjadi kesalahan'
    });
  }
}