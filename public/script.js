
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mysql2 = require('mysql2/promise');


const db = mysql2.createPool({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME
});


router.post('/cadastro', async (req, res) => {
const { nome, email, senha } = req.body;

console.log('Dados recebidos:', { nome, email });


if (!nome || !email || !senha) {
return res.status(400).send('Todos os campos são obrigatórios');
}

try {

const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
if (rows.length > 0) {
return res.status(400).send('Email já cadastrado');
}


const senhaCriptografada = bcrypt.hashSync(senha, 10);


const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
await db.execute(sql, [nome, email, senhaCriptografada]);

console.log('Usuário cadastrado com sucesso:', { nome, email });
res.send('Usuário cadastrado com sucesso');
} catch (err) {
console.error('Erro ao cadastrar usuário:', err);
res.status(500).send('Erro ao cadastrar usuário');
}
});

module.exports = router;
