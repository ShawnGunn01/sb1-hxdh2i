import { updateWalletBalance, getWalletBalance, moveToEscrow, releaseFromEscrow } from '../services/walletService';
import { db } from '../config/database';

jest.mock('../config/database');

describe('Wallet Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('update wallet balance', async () => {
    const mockUpdateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
    (db.wallets.updateOne as jest.Mock).mockReturnValue({ updateOne: mockUpdateOne });

    await updateWalletBalance('user1', 100);
    expect(mockUpdateOne).toHaveBeenCalledWith(
      { userId: 'user1' },
      { $inc: { balance: 100 } },
      { upsert: true }
    );
  });

  test('get wallet balance', async () => {
    const mockWallet = { userId: 'user1', balance: 500, tokenBalance: 1000, escrowBalance: 0 };
    (db.wallets.findOne as jest.Mock).mockResolvedValue(mockWallet);

    const result = await getWalletBalance('user1');
    expect(result).toEqual(mockWallet);
  });

  // Add more tests for moveToEscrow, releaseFromEscrow, etc.
});