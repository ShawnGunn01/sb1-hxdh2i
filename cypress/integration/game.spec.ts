describe('Game Integration', () => {
  beforeEach(() => {
    cy.login('testuser@example.com', 'password123');
  });

  it('should display list of games', () => {
    cy.visit('/games');
    cy.contains('Game Integration').should('be.visible');
    cy.get('table').should('exist');
    cy.get('tr').should('have.length.gt', 1);
  });

  it('should search for games', () => {
    cy.visit('/games');
    cy.get('input[placeholder="Search games..."]').type('Test Game');
    cy.get('table tr').should('have.length', 2); // Header + 1 result
    cy.contains('Test Game').should('be.visible');
  });

  it('should navigate to game details', () => {
    cy.visit('/games');
    cy.get('table tr').eq(1).find('a').click();
    cy.url().should('include', '/games/');
    cy.contains('Game Details').should('be.visible');
  });

  it('should start a game session', () => {
    cy.visit('/games/1'); // Assuming game with ID 1 exists
    cy.contains('Start Game').click();
    cy.contains('Game session active').should('be.visible');
  });
});