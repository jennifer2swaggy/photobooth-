import express from 'express';
import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Upload endpoint
app.post('/api/upload', async (req, res) => {
  try {
    const { imageData, filename } = req.body;

    if (!imageData || !filename) {
      return res.status(400).json({ error: 'Missing imageData or filename' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(imageData.split(',')[1], 'base64');

    // Upload to remote server
    await uploadToServer(buffer, filename);

    res.json({ success: true, message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

function uploadToServer(fileBuffer, filename) {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn
      .on('ready', () => {
        conn.sftp((err, sftp) => {
          if (err) {
            conn.end();
            return reject(err);
          }

          const remotePath = `${process.env.REMOTE_DIR}/${filename}`;

          sftp.writeFile(remotePath, fileBuffer, (err) => {
            conn.end();
            if (err) {
              reject(err);
            } else {
              console.log(`File uploaded: ${remotePath}`);
              resolve();
            }
          });
        });
      })
      .on('error', reject)
      .connect({
        host: process.env.REMOTE_HOST,
        port: process.env.REMOTE_PORT || 22,
        username: process.env.REMOTE_USER,
        privateKey: fs.readFileSync(process.env.SSH_KEY_PATH),
        passphrase: process.env.SSH_PASSPHRASE || undefined,
      });
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
