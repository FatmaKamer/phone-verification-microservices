const http = require('http');
const mysql = require('mysql2/promise'); 

const PORT = 3000;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root_password';
const DB_NAME = process.env.DB_NAME || 'telefon_numarasi';

let pool;

try {
  pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log(`Veritabanı bağlantısı kuruldu: ${DB_HOST}`);
} catch (err) {
  console.error('Veritabanı bağlantı hatası:', err);
  process.exit(1);
}

function validateNumber(numberStr) {
  if (!/^\d{6}$/.test(numberStr)) {
    return { error: '400: Hatalı Format: 6 basamaklı sayı değil' };
  }
  const digits = numberStr.split('').map(d => parseInt(d, 10));
  const hasNonZeroDigit = digits.some(d => d !== 0);
  const sumFirst = digits[0] + digits[1] + digits[2];
  const sumLast = digits[3] + digits[4] + digits[5];
  const sumOdd = digits[0] + digits[2] + digits[4];
  const sumEven = digits[1] + digits[3] + digits[5];

  return {
    hasNonZeroDigit,
    sumFirstEqualsLast: sumFirst === sumLast,
    sumOddEqualsEven: sumOdd === sumEven,
    isValid: hasNonZeroDigit && sumFirst === sumLast && sumOdd === sumEven
  };
}

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      callback(JSON.parse(body));
    } catch {
      callback({});
    }
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  if (req.method === 'POST' && req.url === '/api/phone/validate') {
    return parseBody(req, (data) => {
      const { number } = data;
      if (!number) return sendJSON(res, 400, { error: '400: Numara alanı eksik' });
      const result = validateNumber(number);
      if (result.error) return sendJSON(res, 400, { error: result.error });

      return sendJSON(res, 200, {
        number,
        rules: {},
        isValid: result.isValid
      });
    });
  }

  if (req.method === 'POST' && req.url === '/api/registration') {
    return parseBody(req, async (data) => {
      const { name, surname, email, phone } = data;

      if (!name || !surname || !email || !phone) {
        return sendJSON(res, 400, { status: 'denied', message: '400: Eksik alan! Tüm alanları doldurun.' });
      }

      const check = validateNumber(phone);
      if (check.error || !check.isValid) {
        return sendJSON(res, 422, {
          status: 'denied',
          message: '422: Geçersiz telefon numarası. Lütfen yeni bir numara deneyin.',
          isValid: false
        });
      }

      try {
        const [existing] = await pool.execute('SELECT phone FROM registrations WHERE phone = ?', [phone]);
        if (existing.length > 0) {
          return sendJSON(res, 409, { status: 'denied', message: '409: Bu telefon zaten kayıtlı.' });
        }

        const sql = 'INSERT INTO registrations (name, surname, email, phone) VALUES (?, ?, ?, ?)';
        const [result] = await pool.execute(sql, [name, surname, email, phone]);
        
        return sendJSON(res, 201, {
          status: 'accepted',
          message: '201: Kayıt başarılı.',
          data: { id: result.insertId, name, surname, email, phone }
        });

      } catch (err) {
        console.error('Veritabanı kayıt hatası:', err);
        return sendJSON(res, 500, { status: 'denied', message: '500: Sunucu hatası: Kayıt yapılamadı.' });
      }
    });
  }

  if (req.method === 'GET' && req.url === '/api/registration/list') {
    try {
      const [rows] = await pool.execute('SELECT id, name, surname, email, phone FROM registrations ORDER BY created_at DESC LIMIT 10');
      
      return sendJSON(res, 200, { data: rows });
    } catch (err) {
      console.error('Veritabanı listeleme hatası:', err);
      return sendJSON(res, 500, { status: 'denied', message: '500: Sunucu hatası: Kayıtlar getirilemedi.' });
    }
  }

  if (req.method === 'GET' && req.url === '/api/phone/count') {
    try {
      const [rows] = await pool.execute('SELECT COUNT(DISTINCT phone) AS count FROM registrations');
      const count = rows[0].count;
      return sendJSON(res, 200, { 
        status: 'success', 
        total_count: count 
      });
    } catch (err) {
      console.error('Veritabanından sayı çekme hatası:', err);
      return sendJSON(res, 500, {
        status: 'error',
        message: '500: Sunucu hatası: Toplam sayı hesaplanamadı.'
      });
    }
  }

  sendJSON(res, 404, { error: "404: Bu endpoint bulunamadı." });
});

server.listen(PORT, () => {
  console.log(`API çalışıyor: http://localhost:${PORT}`);
});