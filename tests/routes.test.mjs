import request from 'supertest';
import { expect } from 'chai';
import app from '../app.mjs'; 

describe('Testes de Rotas', () => {
it('Deve cadastrar um novo usuário', (done) => {
request(app)
.post('/cadastro') 
.send({
nome: 'João',
email: 'joao@example.com',
senha: '123456',
telefone: '1234567890', 
cpf: '12345678909'
})
.expect(302) 
.end((err, res) => {
if (err) return done(err);
expect(res.headers.location).to.equal('/menu_inicial.html'); 
done();
});
});

it('Deve fazer login com credenciais válidas', (done) => {
request(app)
.post('/login')
.send({
email: 'teste@example.com',
senha: 'teste123'
})
.expect(302) 
.end((err, res) => {
if (err) return done(err);
expect(res.headers.location).to.equal('/'); 
done();
});
});

it('Deve retornar erro ao fazer login com credenciais inválidas', (done) => {
request(app)
.post('/login')
.send({
email: 'teste@example.com',
senha: 'senhaerrada'
})
.expect(400) 
.end((err, res) => {
if (err) return done(err);
expect(res.text).to.include('Senha incorreta'); 
done();
});
});
});
