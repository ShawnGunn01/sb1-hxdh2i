describe('Wallet Management', () => {
  beforeEach(() => {
    cy.login(); // Custom command to log in
    cy.visit('/wallet');
  });

  it('displays wallet balance', () => {
    cy.intercept('GET', '/api/payments/wallet', { statusCode: 200, body: { balance: 1000, tokenBalance: 5000 } }).as('getWallet');

    cy.wait('@getWallet');
    cy.contains('$1000.00');
    cy.contains('5000 PLLAY Tokens');
  });

  it('converts currency to tokens', () => {
    cy.intercept('POST', '/api/payments/convert-to-tokens', { statusCode: 200, body: { success: true } }).as('convertToTokens');

    cy.get('input[name="amount"]').type('100');
    cy.get('select[name="conversionType"]').select('toTokens');
    cy.get('button').contains('Convert').click();

    cy.wait('@convertToTokens');
    cy.contains('Conversion successful');
  });

  it('converts tokens to currency', () => {
    cy.intercept('POST', '/api/payments/convert-to-currency', { statusCode: 200, body: { success: true } }).as('convertToCurrency');

    cy.get('input[name="amount"]').type('500');
    cy.get('select[name="conversionType"]').select('toCurrency');
    cy.get('button').contains('Convert').click();

    cy.wait('@convertToCurrency');
    cy.contains('Conversion successful');
  });
});