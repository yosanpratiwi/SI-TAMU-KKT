import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3002;
const DB_FILE = './guests_db.json';
const USERS_FILE = './users_db.json';

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Inisialisasi Database Tamu
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Inisialisasi Database User Sekuriti
if (!fs.existsSync(USERS_FILE)) {
  const defaultUsers = [
    { id: '1', username: 'admin', password: '123', name: 'Administrator IT', role: 'ADMIN' },
    { id: '2', username: 'sekuriti', password: '123', name: 'Petugas Jaga Lobi', role: 'SECURITY' }
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
}

const WHATSAPP_API_TOKEN = 'dWPXNHCioAhDWDW8X596';

const formatPhoneForFonnte = (phone) => {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
  else if (cleaned.startsWith('8')) cleaned = '62' + cleaned;
  return cleaned;
};

app.get('/', (req, res) => {
  res.send(`<h1 style="font-family:sans-serif;text-align:center;margin-top:50px;color:#00339a">SECUREGATE BACKEND ONLINE</h1>`);
});

// API Login Sekuriti
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync(USERS_FILE));
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          name: user.name, 
          role: user.role 
        } 
      });
    } else {
      res.status(401).json({ success: false, message: 'Username atau Password salah!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/guests', async (req, res) => {
  try {
    const newGuest = req.body;
    const { waPayload, ...guestData } = newGuest;
    
    const dbData = JSON.parse(fs.readFileSync(DB_FILE));
    dbData.unshift(guestData);
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));

    let waStatus = false;
    let waResult = { message: 'Pending' };

    if (waPayload && waPayload.target) {
      const cleanedTarget = formatPhoneForFonnte(waPayload.target);
      try {
        const response = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: { 'Authorization': WHATSAPP_API_TOKEN, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: cleanedTarget,
            message: waPayload.message,
            countryCode: '62',
            delay: '2'
          })
        });

        waResult = await response.json();
        waStatus = waResult.status === true;
      } catch (fetchError) {
        waResult = { message: fetchError.message };
      }
    }

    res.json({ 
      success: true, 
      guest: guestData, 
      waStatus: waStatus,
      backupMessage: waPayload ? waPayload.message : '',
      targetPhone: waPayload ? waPayload.target : ''
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/guests', (req, res) => {
  try {
    const dbData = JSON.parse(fs.readFileSync(DB_FILE));
    res.json(dbData);
  } catch (error) {
    res.status(500).json([]);
  }
});

app.put('/api/guests/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    let dbData = JSON.parse(fs.readFileSync(DB_FILE));
    dbData = dbData.map(g => g.id === id ? { ...g, ...updateData } : g);
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`SECUREGATE Backend running at http://localhost:${PORT}`);
});