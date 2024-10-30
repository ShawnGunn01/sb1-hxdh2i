describe('P2P Wagering', () => {
  beforeEach(() => {
    cy.login(); // Custom command to log in
    cy.visit('/wagers');
  });

  it('creates a new wager', () => {
    cy.intercept('POST', '/api/p2p/wager', { statusCode: 201, body: { id: '1', amount: 100, opponentId: 'user2', gameId: 'game1', status: 'pending' } }).as('createWager');

    cy.get('input[name="amount"]').type('100');
    cy.get('input[name="opponentId"]').type('user2');
    cy.get('input[name="gameId"]').type('game1');
    cy.get('button').contains('Create Wager').click();

    cy.wait('@createWager');
    cy.contains('Wager created successfully');
  });

  it('accepts a pending wager', () => {
    cy.intercept('GET', '/api/p2p/user/*/wagers', { statusCode: 200, body: [{ id: '1', amount: 100, opponentId: 'user2', gameId: 'game1', status: 'pending' }] }).as('getWagers');
    cy.intercept('POST', '/api/p2p/wager/*/accept', { statusCode: 200, body: { success: true } }).as('acceptWager');

    cy.wait('@getWagers');
    cy.get('button').contains('Accept').click();

    cy.wait('@acceptWager');
    cy.contains('Wager accepted');
  });

  it('completes a wager', () => {
    cy.intercept('GET', '/api/p2p/user/*/wagers', { statusCode: 200, body: [{ id: '1', amount: 100, opponentId: 'user2', gameId: 'game1', status: 'accepted' }] }).as('getWagers');
    cy.intercept('POST', '/api/p2p/wager/*/complete', { statusCode: 200, body: { success: true } }).as('completeWager');

    cy.wait('@getWagers');
    cy.get('button').contains('Complete (You Win)').click();

    cy.wait('@completeWager');
    cy.contains('Wager completed');
  });
});