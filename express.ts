import express from 'express';
import mysql2, { OkPacket } from 'mysql2/promise';
import { User } from './types';

const app = express();
const port = 3000;

let connection: mysql2.Connection;

app.use(express.json());

app.get('/users', async (req, res) => {
    const [rows] = await connection.execute<User[]>('SELECT * FROM `users`');
    res.json(rows);
});

app.get('/users/:id', async (req, res) => {
    const [rows] = await connection.execute<User[]>('SELECT * FROM `users` WHERE `id` = ?', [req.params.id]);
    res.json(rows);
});

app.post('/users', async (req, res) => {
    const [result] = await connection.execute<OkPacket>('INSERT INTO `users` (`name`, `email`) VALUES (?, ?)', [req.body.name, req.body.email]);
    const [rows] = await connection.execute<User[]>('SELECT * FROM `users` WHERE `id` = ?', [result.insertId]);
    res.json(rows[0]);
});

app.put('/users/:id', async (req, res) => {
    const [result] = await connection.execute<OkPacket>('UPDATE `users` SET `name` = ? WHERE `id` = ?', [req.body.name, req.params.id]);
    if (result.affectedRows === 1) {
        const [rows] = await connection.execute<User[]>('SELECT * FROM `users` WHERE `id` = ?', [req.params.id]);
        return res.json(rows[0]);
    }
    return res.status(404).json({ message: 'User not found' });
});

app.delete('/users/:id', async (req, res) => {
    const [result] = await connection.execute<OkPacket>('DELETE FROM `users` WHERE `id` = ?', [req.params.id]);
    if (result.affectedRows === 1) {
        return res.status(200).json({ message: 'User deleted' });
    }
    return res.status(404).json({ message: 'User not found' });
});

app.listen(port, async () => {
    connection = await mysql2.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'tutorial'
    });
    console.log(`Example app listening at http://localhost:${port}`);
});