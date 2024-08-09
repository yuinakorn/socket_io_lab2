import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// โหลดตัวแปรแวดล้อมจากไฟล์ .env
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0
});

// ตรวจสอบการเชื่อมต่อ
async function checkConnection() {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      console.log('Database connection successful');
      connection.release();
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  }
  
  checkConnection();
  
  export default pool;
