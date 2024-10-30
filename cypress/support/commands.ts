import '@testing-library/cypress/add-commands';

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.findByLabelText('Email').type(email);
  cy.findByLabelText('Password').type(password);
  cy.findByRole('button', { name: /sign in/i }).click();
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.findByRole('button', { name: /logout/i }).click();
});