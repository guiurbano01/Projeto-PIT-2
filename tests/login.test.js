import { expect } from 'chai'; 
import { verificarLogin } from '../routes/routes.mjs'; 

describe('Teste de Login', () => {
it('deve retornar sucesso quando as credenciais estão corretas', () => {
const resultado = verificarLogin('usuario@teste.com', 'senha123');
expect(resultado).to.be.true; 
});

it('deve retornar erro quando as credenciais estão erradas', () => {
const resultado = verificarLogin('usuario@teste.com', 'senhaErrada');
expect(resultado).to.be.false; 
});
});