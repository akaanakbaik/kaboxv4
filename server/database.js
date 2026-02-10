import { createClient } from '@supabase/supabase-js';
import { createClient as createLibsqlClient } from '@libsql/client';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

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
let currentDbIndex = 0;

function getNextDatabase() {
  const db = databases[currentDbIndex];
  currentDbIndex = (currentDbIndex + 1) % databases.length;
  return db;
}

export async function initializeDatabases() {
  try {
    const supabaseQuery = `
      CREATE TABLE IF NOT EXISTS files (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        size BIGINT NOT NULL,
        mime_type VARCHAR(255),
        storage VARCHAR(50),
        url TEXT,
        ip VARCHAR(45),
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const neonQuery = `
      CREATE TABLE IF NOT EXISTS files (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        size BIGINT NOT NULL,
        mime_type VARCHAR(255),
        storage VARCHAR(50),
        url TEXT,
        ip VARCHAR(45),
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const tursoQuery = `
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        size INTEGER NOT NULL,
        mime_type TEXT,
        storage TEXT,
        url TEXT,
        ip TEXT,
        status TEXT DEFAULT 'completed',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await supabase.from('files').select('id').limit(1);
    
    const neonClient = await neonPool.connect();
    await neonClient.query(neonQuery);
    neonClient.release();

    await tursoClient.execute(tursoQuery);

    console.log('✅ All databases initialized');
    return true;
  } catch (error) {
    console.error('Database init error:', error);
    return false;
  }
}

export async function saveFileToDatabase(fileData) {
  const targetDb = getNextDatabase();
  
  try {
    const data = {
      id: fileData.id,
      name: fileData.name,
      size: fileData.size,
      mime_type: fileData.mimeType,
      storage: fileData.storage,
      url: fileData.url,
      ip: fileData.ip,
      status: fileData.status || 'completed',
      created_at: new Date().toISOString()
    };

    switch (targetDb) {
      case 'supabase':
        await supabase.from('files').insert([{
          id: data.id,
          name: data.name,
          size: data.size,
          mime_type: data.mime_type,
          storage: data.storage,
          url: data.url,
          ip: data.ip,
          status: data.status
        }]);
        break;

      case 'neon':
        const neonClient = await neonPool.connect();
        await neonClient.query(
          'INSERT INTO files (id, name, size, mime_type, storage, url, ip, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [data.id, data.name, data.size, data.mime_type, data.storage, data.url, data.ip, data.status]
        );
        neonClient.release();
        break;

      case 'turso':
        await tursoClient.execute({
          sql: 'INSERT INTO files (id, name, size, mime_type, storage, url, ip, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          args: [data.id, data.name, data.size, data.mime_type, data.storage, data.url, data.ip, data.status, data.created_at]
        });
        break;
    }

    console.log(`✅ File saved to ${targetDb}: ${fileData.id}`);
    return { success: true, database: targetDb };
  } catch (error) {
    console.error(`Error saving to ${targetDb}:`, error);
    throw error;
  }
}

export async function getFileFromDatabase(fileId) {
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

export async function getFileStatus(fileId) {
  const file = await getFileFromDatabase(fileId);
  
  if (!file) {
    return null;
  }

  return {
    id: file.id,
    name: file.name,
    size: file.size,
    status: file.status,
    message: file.status === 'completed' ? 'Upload completed' : 'Upload in progress',
    chunked: false,
    chunkCount: 0,
    downloadUrl: file.status === 'completed' ? `${process.env.VITE_APP_URL}/files/${file.id}/download` : null
  };
}

export async function deleteFileFromDatabase(fileId) {
  for (const db of databases) {
    try {
      switch (db) {
        case 'supabase':
          await supabase.from('files').delete().eq('id', fileId);
          break;

        case 'neon':
          const neonClient = await neonPool.connect();
          await neonClient.query('DELETE FROM files WHERE id = $1', [fileId]);
          neonClient.release();
          break;

        case 'turso':
          await tursoClient.execute({
            sql: 'DELETE FROM files WHERE id = ?',
            args: [fileId]
          });
          break;
      }
    } catch (error) {
      console.error(`Error deleting from ${db}:`, error);
    }
  }
}