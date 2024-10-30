describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('successfully logs in with correct credentials', () => {
    cy.intercept('POST', '/api/auth/login', { statusCode: 200, body: { token: 'fake-token', user: { id: '1', name: 'Test User' } } }).as('loginRequest');

    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Welcome, Test User');
  });

  it('displays error message with incorrect credentials', () => {
    cy.intercept('POST', '/api/auth/login', { statusCode: 401, body: { message: 'Invalid credentials' } }).as('loginRequest');

    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.contains('Invalid email or password');
  });
});