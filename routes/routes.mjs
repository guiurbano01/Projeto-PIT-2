import express from 'express';
import bcrypt from 'bcryptjs';
import mysql2 from 'mysql2/promise'; 
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import session from 'express-session';

dotenv.config();

const app = express();
app.use(express.json());

const router = express.Router();


const db = mysql2.createPool({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME
});

function isAuthenticated(req, res, next) {
if (req.session.usuario) {
return next();
}
return res.status(401).json({ message: 'Usuário não autenticado' });
}


router.use(session({
secret: process.env.SESSION_SECRET || 'seu-segredo',
resave: false,
saveUninitialized: true,
cookie: { secure: false } 
}));


const transporter = nodemailer.createTransport({
service: 'Gmail',
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS
}
});


export const verificarLogin = async (email, senha) => {
if (!email || !senha) {
throw new Error('Email ou senha não fornecidos');
}

const [results] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
if (results.length === 0) {
throw new Error('Usuário não encontrado');
}

const usuario = results[0];
const senhaValida = bcrypt.compareSync(senha, usuario.senha);

if (!senhaValida) {
throw new Error('Senha incorreta');
}

return usuario;
};


router.post('/cadastro', async (req, res) => {
const { nome, email, senha, telefone, cpf } = req.body;

if (!nome || !email || !senha || !telefone || !cpf) {
return res.status(400).send('Dados incompletos');
}

try {
const [results] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
if (results.length > 0) {
return res.status(400).send('E-mail já cadastrado');
}

const senhaCriptografada = bcrypt.hashSync(senha, 10);
await db.execute(
'INSERT INTO usuarios (nome, email, senha, telefone, cpf) VALUES (?, ?, ?, ?, ?)',
[nome, email, senhaCriptografada, telefone, cpf]
);

res.redirect('/menu_inicial.html');
} catch (error) {
console.error('Erro ao cadastrar usuário:', error);
res.status(500).send('Erro ao cadastrar usuário');
}
});


router.post('/login', async (req, res) => {
const { email, senha } = req.body;

try {
const usuario = await verificarLogin(email, senha);
req.session.usuario = usuario;
res.redirect('/menu_inicial.html');
} catch (error) {
console.error('Erro ao fazer login:', error);
res.status(400).send(error.message);
}
});


router.get('/usuario-logado', (req, res) => {
if (req.session.usuario) {
const { nome, email, telefone, cpf } = req.session.usuario;
res.json({ logado: true, nome, email, telefone, cpf });
} else {
res.json({ logado: false });
}
});


router.get('/recuperar_senha.html', (req, res) => {
res.sendFile(path.join(process.cwd(), 'public', 'recuperar_senha.html'));
});


router.post('/recuperar-senha', async (req, res) => {
const { email } = req.body;

try {
const [results] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
if (results.length === 0) {
return res.status(400).send('E-mail não encontrado');
}

const token = crypto.randomBytes(20).toString('hex');
const expires = new Date(Date.now() + 3600000); 

await db.execute('UPDATE usuarios SET reset_token = ?, reset_expires = ? WHERE email = ?', [token, expires, email]);

const link = `http://localhost:3000/redefinir_senha.html?token=${token}`;
const mailOptions = {
from: process.env.EMAIL_USER,
to: email,
subject: 'Recuperação de Senha',
text: `Você solicitou a recuperação de senha. Clique no link para redefinir sua senha: ${link}`
};

await transporter.sendMail(mailOptions);
res.send('Link de recuperação de senha enviado para o seu e-mail.');
} catch (error) {
console.error('Erro ao enviar e-mail:', error);
res.status(500).send('Erro ao enviar e-mail');
}
});


router.get('/redefinir_senha.html', (req, res) => {
const { token } = req.query;
if (token) {
res.sendFile(path.join(process.cwd(), 'public', 'redefinir_senha.html'), err => {
if (err) {
console.error('Erro ao enviar arquivo:', err);
res.status(500).send('Erro ao exibir a página de redefinição de senha');
}
});
} else {
res.status(400).send('Token não fornecido');
}
});


router.get('/medicos', async (req, res) => {
const especialidadeId = req.query.especialidade_id;

if (!especialidadeId) {
return res.status(400).json({ error: 'Especialidade não informada' });
}

try {
const [medicos] = await db.execute('SELECT m.id, u.nome FROM medicos m JOIN usuarios u ON m.usuario_id = u.id WHERE m.especialidade_id = ?', [especialidadeId]);
res.json(medicos);
} catch (error) {
console.error('Erro ao buscar médicos:', error);
res.status(500).json({ error: 'Erro ao buscar médicos' });
}
});


let consultasAgendadas = [];


router.post('/consultas', async (req, res) => {
const { especialidade_id, paciente_nome, medico, data, hora } = req.body;

try {

const [usuario] = await db.execute(`SELECT id FROM usuarios WHERE nome = ? AND tipo = 'paciente'`, [paciente_nome]);

if (usuario.length === 0) {
return res.status(404).json({ message: 'Paciente não encontrado ou não é um paciente.' });
}

const usuario_id = usuario[0].id;


const [paciente] = await db.execute(`SELECT id FROM pacientes WHERE usuario_id = ?`, [usuario_id]);

if (paciente.length === 0) {
return res.status(404).json({ message: 'Paciente não encontrado.' });
}

if (paciente.length === 0) {
return res.status(404).json({ message: 'Paciente não encontrado.' });
}


const paciente_id = paciente[0].id;
await db.execute(`INSERT INTO consultas (paciente_id, medico_id, especialidade_id, data_consulta, horario_consulta)
    VALUES (?, ?, ?, ?, ?)`, [paciente_id, medico, especialidade_id, data, hora]);


const [novaConsulta] = await db.execute(`
SELECT 
c.id,
c.data_consulta,
c.horario_consulta,
c.status,
up.nome AS nome_paciente,
um.nome AS nome_medico,
e.nome AS nome_especialidade
FROM 
consultas c
JOIN 
pacientes p ON c.paciente_id = p.id
JOIN 
usuarios up ON p.usuario_id = up.id
JOIN 
medicos m ON c.medico_id = m.id
JOIN 
usuarios um ON m.usuario_id = um.id
JOIN 
especialidades e ON c.especialidade_id = e.id
WHERE 
c.paciente_id = ? AND c.data_consulta = ? AND c.horario_consulta = ?
ORDER BY 
c.id DESC
LIMIT 1
`, [paciente_id, data, hora]);

res.status(201).json({
message: 'Consulta agendada com sucesso!',
consulta: novaConsulta[0] 
});
} catch (error) {
console.error('Erro ao agendar consulta:', error);
res.status(500).json({ message: 'Erro ao agendar consulta.' });
}
});



async function buscarConsultasPorUsuario(usuario_id) {
const query = `
SELECT 
c.id,
c.data_consulta,
c.horario_consulta,
c.status,
up.nome AS nome_paciente,
um.nome AS nome_medico,
e.nome AS nome_especialidade
FROM 
consultas c
JOIN 
pacientes p ON c.paciente_id = p.id
JOIN 
usuarios up ON p.usuario_id = up.id
JOIN 
medicos m ON c.medico_id = m.id
JOIN 
usuarios um ON m.usuario_id = um.id
JOIN 
especialidades e ON c.especialidade_id = e.id
ORDER BY 
c.data_consulta DESC, c.horario_consulta DESC
LIMIT 1;

`; 
const [rows] = await db.query(query, [usuario_id]);
return rows;
}


router.get('/minhas-consultas', async (req, res) => {
if (!req.session.usuario) {
return res.status(401).json({ logado: false, message: 'Usuário não está autenticado' });
}

try {
const consultas = await buscarConsultasPorUsuario(req.session.usuario.id);


const consultasComNomes = consultas.map(consulta => ({
id: consulta.id,
data_consulta: consulta.data_consulta,
horario_consulta: consulta.horario_consulta,
status: consulta.status,
paciente: consulta.nome_paciente,
medico: consulta.nome_medico,
especialidade: consulta.nome_especialidade,
}));

res.json({ logado: true, consultas: consultasComNomes });
} catch (error) {
console.error('Erro ao buscar consultas:', error);
res.status(500).json({ message: 'Erro ao buscar consultas' });
}
});
async function atualizarMinhasConsultas() {
try {
const response = await fetch('http://localhost:3000/minhas-consultas');

if (!response.ok) {
throw new Error('Erro ao buscar consultas.');
}

const data = await response.json();


const listaConsultas = document.getElementById('lista-consultas');
listaConsultas.innerHTML = ''; 


data.consultas.forEach(consulta => {
const itemConsulta = document.createElement('li');
itemConsulta.textContent = `Consulta com ${consulta.medico} em ${consulta.data_consulta} às ${consulta.horario_consulta} - Status: ${consulta.status}`;
listaConsultas.appendChild(itemConsulta);
});

} catch (error) {
console.error('Erro ao atualizar consultas:', error);
}
}






export default router;





