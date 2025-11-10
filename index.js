const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = 3000;

// === KONEKSI DATABASE ===
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Azkhiyah903#',  
  database: 'api_key_db',
  port: 3308  
});

db.connect(err => {
  if (err) {
    console.error('❌ Gagal konek ke MySQL:', err);
  } else {
    console.log('✅ Terhubung ke database MySQL');
  }
});

// === MIDDLEWARE ===
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === ROUTE HALAMAN UTAMA ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === ROUTE: BUAT API KEY BARU ===
app.post('/create', (req, res) => {
  const apiKey = 'key_' + crypto.randomBytes(8).toString('hex');
  const date = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const status = 'active';

  const sql = 'INSERT INTO key_data (`key`, `date`, `status`, `email`) VALUES (?, ?, ?, ?)';
  db.query(sql, [apiKey, date, status, null], (err, result) => {
    if (err) {
      console.error('❌ Gagal simpan ke DB:', err);
      res.status(500).json({ error: 'Gagal menyimpan data' });
    } else {
      console.log('✅ API Key disimpan:', apiKey);
      res.json({ apiKey });
    }
  });
});

// === ROUTE: VALIDASI API KEY ===
app.get('/validate', (req, res) => {
  const apiKey = req.query.key;

  if (!apiKey) {
    return res.status(400).json({ valid: false, message: 'Key tidak diberikan' });
  }

  const sql = 'SELECT * FROM key_data WHERE `key` = ? AND `status` = "active"';
  db.query(sql, [apiKey], (err, results) => {
    if (err) {
      console.error('❌ Error saat cek key:', err);
      return res.status(500).json({ valid: false, message: 'Kesalahan server' });
    }

    if (results.length > 0) {
      res.json({
        valid: true,
        message: '✅ API Key valid',
        data: results[0]
      });
    } else {
      res.status(404).json({
        valid: false,
        message: '❌ API Key tidak ditemukan atau sudah tidak aktif'
      });
    }
  });
});

// === JALANKAN SERVER ===
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});
