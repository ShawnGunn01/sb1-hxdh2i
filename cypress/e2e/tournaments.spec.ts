describe('Tournaments', () => {
  beforeEach(() => {
    cy.login('testuser@example.com', 'password123');
  });

  it('should display the list of tournaments', () => {
    cy.visit('/tournaments');
    cy.contains('Tournament Management').should('be.visible');
    cy.get('table').should('exist');
    cy.get('tr').should('have.length.gt', 1);
  });

  it('should allow creating a new tournament', () => {
    cy.visit('/tournaments/create');
    cy.findByLabelText('Tournament Name').type('Test Tournament');
    cy.findByLabelText('Start Date').type('2023-08-01');
    cy.findByLabelText('End Date').type('2023-08-07');
    cy.findByLabelText('Max Participants').type('100');
    cy.findByLabelText('Entry Fee').type('50');
    cy.findByRole('button', { name: /create tournament/i }).click();
    cy.contains('Tournament created successfully').should('be.visible');
  });

  it('should allow joining a tournament', () => {
    cy.visit('/tournaments');
    cy.contains('tr', 'Test Tournament').within(() => {
      cy.findByRole('button', { name: /join/i }).click();
    });
    cy.contains('Successfully joined the tournament').should('be.visible');
  });
});