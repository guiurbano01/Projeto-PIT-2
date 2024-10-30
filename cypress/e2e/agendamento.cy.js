describe('Agendamento de Consultas', () => {
  beforeEach(() => {
      // Visitar a página de agendamento
      cy.visit('/agendamento.html');
  });

  it('Deve agendar uma consulta com sucesso', () => {
      // Preencher o formulário de agendamento
      cy.get('#medico').select('Médico Teste - Especialidade Teste', { force: true })
          .should('have.value', 'medico_id_aqui'); // Ajuste para o ID real do médico

      // Preencher a data e hora da consulta
      cy.get('#data').type('2024-10-15'); // Data da consulta
      cy.get('#hora').type('10:00'); // Hora da consulta

      // Submeter o formulário
      cy.get('#form-agendamento').submit();

      // Verifica se a consulta foi agendada com sucesso
      cy.contains('Consulta agendada com sucesso!', { timeout: 10000 }).should('be.visible');
  });

  it('Deve mostrar erro se o formulário estiver incompleto', () => {
      // Tentar submeter o formulário sem preencher os campos obrigatórios
      cy.get('#form-agendamento').submit();

      // Verifica se aparece a mensagem de erro para campos obrigatórios
      cy.contains('Este campo é obrigatório').should('be.visible');
  });
});
