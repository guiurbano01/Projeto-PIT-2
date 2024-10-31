import express from 'express';
import session from 'express-session';
import path from 'path';
import dotenv from 'dotenv';
import routes from './routes/routes.mjs';

dotenv.config();

const app = express(); 
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));


app.use(session({
secret: process.env.SESSION_SECRET || 'secreto_para_sessao', 
resave: false, 
saveUninitialized: false, 
cookie: {
secure: process.env.NODE_ENV === 'production', 
httpOnly: true 
}
}));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(express.static(path.join(process.cwd(), 'public')));


app.use('/', routes);


app.get('/', (req, res) => {
res.sendFile(path.join(process.cwd(), 'public', 'menu_inicial.html'));
});

app.get('/consultas', (req, res) => {
res.sendFile(path.join(process.cwd(), 'public', 'agendamento.html'));
});


app.get('/logout', (req, res) => {
req.session.destroy((err) => {
if (err) {
    console.error('Erro ao fazer logout:', err);
    return res.status(500).send('Erro ao fazer logout');
}
res.clearCookie('connect.sid');
res.redirect('/');
});
});

app.post('/consultas', (req, res) => {
console.log(req.body);
const { paciente_nome, medico_id, especialidade_id, data_consulta, horario_consulta } = req.body;
if (!paciente_nome || !medico_id || !especialidade_id || !data_consulta || !horario_consulta) {
return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
}
});


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

