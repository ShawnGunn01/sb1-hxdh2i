describe('Payment System', () => {
  beforeEach(() => {
    cy.login('testuser@example.com', 'password123');
  });

  it('should display wallet balance', () => {
    cy.visit('/payments');
    cy.contains('Wallet Balance').should('be.visible');
    cy.contains('Currency:').should('be.visible');
    cy.contains('Tokens:').should('be.visible');
  });

  it('should process a deposit', () => {
    cy.visit('/payments');
    cy.get('input[name="amount"]').type('100');
    cy.get('select[name="processor"]').select('stripe');
    cy.get('button').contains('Process Payment').click();
    cy.contains('Payment processed successfully').should('be.visible');
  });

  it('should request a withdrawal', () => {
    cy.visit('/payments');
    cy.get('input[name="withdrawAmount"]').type('50');
    cy.get('select[name="withdrawMethod"]').select('bank_transfer');
    cy.get('button').contains('Request Withdrawal').click();
    cy.contains('Withdrawal request submitted successfully').should('be.visible');
  });

  it('should convert currency to tokens', () => {
    cy.visit('/payments');
    cy.get('input[name="convertAmount"]').type('100');
    cy.get('button').contains('Convert to Tokens').click();
    cy.contains('Conversion successful').should('be.visible');
  });
});