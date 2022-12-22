import mysql2, { OkPacket, RowDataPacket } from 'mysql2/promise';

interface User extends RowDataPacket {
    id?: number;
    name: string;
    email: string;
}

interface Post extends RowDataPacket {
    id?: number;
    title: string;
    content: string;
    user_id: number;
}

interface Like extends RowDataPacket {
    id?: number;
    user_id: number;
    post_id: number;
}

async function main() {
    try {
        const connection = await mysql2.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'tutorial'
        });
        console.log("Connected!");
        // Query all rows from the users table
        const [rows_users] = await connection.execute<User[]>('SELECT * FROM `users`');

        console.log(rows_users);

        // Query one row from the users table without prepared statements
        const [rows_user] = await connection.execute<User[]>('SELECT * FROM `users` WHERE `id` = 1');

        console.log(rows_user[0]);

        // Query one row from the users table with prepared statements
        const [rows_user_prepared] = await connection.execute<User[]>('SELECT * FROM `users` WHERE `id` = ?', [1]);
        console.log(rows_user_prepared[0]);

        // Add a new user to the users table
        const [result] = await connection.execute<OkPacket>('INSERT INTO `users` (`name`, `email`) VALUES (?, ?)', ['Andie Similon', 'andie.similon@ap.be']);
        console.log(result.insertId);

        // Update a user in the users table
        const [result_update] = await connection.execute<OkPacket>('UPDATE `users` SET `name` = ? WHERE `id` = ?', ['Jon', 1]);
        console.log(result_update.affectedRows);


        // Delete a user in the users table
        const [result_delete] = await connection.execute<OkPacket>('DELETE FROM `users` WHERE `id` = ?', [result.insertId]);
        console.log(result_delete.affectedRows);
        connection.end();
    } catch (error) {
        console.log(error);
    }



}

main();