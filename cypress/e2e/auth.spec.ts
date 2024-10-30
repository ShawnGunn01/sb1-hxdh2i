describe('Authentication', () => {
  it('should allow a user to log in', () => {
    cy.visit('/login');
    cy.findByLabelText('Email').type('testuser@example.com');
    cy.findByLabelText('Password').type('password123');
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome, Test User').should('be.visible');
  });

  it('should display an error for invalid credentials', () => {
    cy.visit('/login');
    cy.findByLabelText('Email').type('invalid@example.com');
    cy.findByLabelText('Password').type('wrongpassword');
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.contains('Invalid email or password').should('be.visible');
  });

  it('should allow a user to log out', () => {
    cy.login('testuser@example.com', 'password123');
    cy.logout();
    cy.url().should('include', '/login');
  });
});