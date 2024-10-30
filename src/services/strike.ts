// This is a mock implementation. You would need to integrate with Strike's actual API.
export const strike = {
  async processPayment(amount: number, token: string, userId: string) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate successful payment
    return {
      success: true,
      transactionId: `strike-${Date.now()}`,
    };
  },

  async processWithdrawal(amount: number, accountInfo: any, userId: string) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate successful withdrawal
    return {
      success: true,
      transactionId: `strike-withdrawal-${Date.now()}`,
    };
  },
};