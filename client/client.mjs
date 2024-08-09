import { io } from 'socket.io-client';
import db from './config/db.mjs';
import fs from 'fs/promises';

const socket = io('http://localhost:3000');
const clientName = 'hospital_1';
const clientNumber = 5;

socket.on('connect', () => {
    console.log('connected to server');
    socket.emit('register', clientName);
});

socket.on('greeting', (message) => {
    console.log(message);
});

socket.on('calculate', (number) => {
    const result = clientNumber + number;
    console.log(`Received number ${number} to calculate, result is ${result}`);
    setTimeout(() => {
        socket.emit('calculateResult', { result, clientName });
    }, 8000);
});

socket.on('disconnect', () => {
    console.log('disconnected from server');
});

socket.on('query', async (reportId) => {
    console.log(`Received query for reportId: ${reportId}`); // เพิ่ม log เพื่อตรวจสอบว่ารับ event ถูกต้อง
    try {
        const results = await queryDatabase(reportId);
        setTimeout(() => {
            socket.emit('queryResult', { reportId, result: results, clientName });
        }, 3000);

    } catch (error) {
        socket.emit('queryError', { reportId, error: error.message, clientName });
    }
});

async function queryDatabase(reportId) {
    console.log(`Received report_id: ${reportId}`);

    // อ่านไฟล์ script_report.json 
    const script = await fs.readFile('./script_report.json', 'utf-8');
    const reports = JSON.parse(script);
    console.log('Reports:', reports);

    // ค้นหา script ตาม report_id
    const report = reports.find(r => r.report_id === parseInt(reportId));

    if (!report) {
        console.log(`Report with id ${reportId} not found`);
        throw new Error(`Report with id ${reportId} not found`);
    }

    console.log('script:', report.script);

    try {
        const [rows] = await db.query(report.script);
        console.log('Query results:', rows);
        return rows;
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
}