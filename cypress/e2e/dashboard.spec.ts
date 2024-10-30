describe('Dashboard', () => {
  beforeEach(() => {
    cy.login('testuser@example.com', 'password123');
  });

  it('should display the dashboard with key metrics', () => {
    cy.visit('/dashboard');
    cy.contains('Enterprise Dashboard').should('be.visible');
    cy.contains('Active Users').should('be.visible');
    cy.contains('Revenue').should('be.visible');
    cy.contains('Active Tournaments').should('be.visible');
    cy.contains('User Engagement').should('be.visible');
  });

  it('should navigate to different sections from the dashboard', () => {
    cy.visit('/dashboard');
    cy.findByRole('link', { name: /view reports/i }).click();
    cy.url().should('include', '/reports');

    cy.visit('/dashboard');
    cy.findByRole('link', { name: /manage users/i }).click();
    cy.url().should('include', '/users');

    cy.visit('/dashboard');
    cy.findByRole('link', { name: /create tournament/i }).click();
    cy.url().should('include', '/tournaments/create');
  });
});