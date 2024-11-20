import mysql from 'mysql2/promise';

export const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'node',
});

try {
  await connection.connect();
  console.log('Connected to the MySQL database');
} catch (err) {
  console.error('Error connecting to the database:', err);
}
