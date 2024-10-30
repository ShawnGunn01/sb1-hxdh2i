import { P2PWageringService } from '../../services/p2pWageringService';
import { db } from '../../config/database';
import { WalletService } from '../../services/walletService';
import logger from '../../utils/logger';

jest.mock('../../config/database');
jest.mock('../../services/walletService');
jest.mock('../../utils/logger');

describe('P2P Wagering Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createWager successfully creates a new wager', async () => {
    const mockWagerData = {
      userId: 'user123',
      opponentId: 'user456',
      gameId: 'game789',
      amount: 100,
    };

    const mockInsertedId = 'wager123';
    (db.collection('wagers').insertOne as jest.Mock).mockResolvedValueOnce({ insertedId: mockInsertedId });
    (WalletService.reserveAmount as jest.Mock).mockResolvedValueOnce(true);

    const result = await P2PWageringService.createWager(mockWagerData);

    expect(result).toEqual(expect.objectContaining({
      ...mockWagerData,
      _id: mockInsertedId,
      status: 'pending',
    }));
    expect(WalletService.reserveAmount).toHaveBeenCalledWith(mockWagerData.userId, mockWagerData.amount);
    expect(logger.info).toHaveBeenCalledWith('Wager created successfully', expect.any(Object));
  });

  test('acceptWager successfully accepts a wager', async () => {
    const wagerId = 'wager123';
    const userId = 'user456';
    const mockWager = {
      _id: wagerId,
      userId: 'user123',
      opponentId: userId,
      amount: 100,
      status: 'pending',
    };

    (db.collection('wagers').findOne as jest.Mock).mockResolvedValueOnce(mockWager);
    (db.collection('wagers').updateOne as jest.Mock).mockResolvedValueOnce({ modifiedCount: 1 });
    (WalletService.reserveAmount as jest.Mock).mockResolvedValueOnce(true);

    const result = await P2PWageringService.acceptWager(wagerId, userId);

    expect(result).toEqual(expect.objectContaining({
      ...mockWager,
      status: 'accepted',
    }));
    expect(WalletService.reserveAmount).toHaveBeenCalledWith(userId, mockWager.amount);
    expect(logger.info).toHaveBeenCalledWith('Wager accepted successfully', expect.any(Object));
  });

  test('completeWager successfully completes a wager', async () => {
    const wagerId = 'wager123';
    const winnerId = 'user123';
    const mockWager = {
      _id: wagerId,
      userId: 'user123',
      opponentId: 'user456',
      amount: 100,
      status: 'accepted',
    };

    (db.collection('wagers').findOne as jest.Mock).mockResolvedValueOnce(mockWager);
    (db.collection('wagers').updateOne as jest.Mock).mockResolvedValueOnce({ modifiedCount: 1 });
    (WalletService.transferAmount as jest.Mock).mockResolvedValueOnce(true);

    const result = await P2PWageringService.completeWager(wagerId, winnerId);

    expect(result).toEqual(expect.objectContaining({
      ...mockWager,
      status: 'completed',
      winnerId,
    }));
    expect(WalletService.transferAmount).toHaveBeenCalledWith(mockWager.opponentId, winnerId, mockWager.amount * 2);
    expect(logger.info).toHaveBeenCalledWith('Wager completed successfully', expect.any(Object));
  });

  test('cancelWager successfully cancels a wager', async () => {
    const wagerId = 'wager123';
    const mockWager = {
      _id: wagerId,
      userId: 'user123',
      amount: 100,
      status: 'pending',
    };

    (db.collection('wagers').findOne as jest.Mock).mockResolvedValueOnce(mockWager);
    (db.collection('wagers').updateOne as jest.Mock).mockResolvedValueOnce({ modifiedCount: 1 });
    (WalletService.releaseAmount as jest.Mock).mockResolvedValueOnce(true);

    const result = await P2PWageringService.cancelWager(wagerId);

    expect(result).toEqual(expect.objectContaining({
      ...mockWager,
      status: 'cancelled',
    }));
    expect(WalletService.releaseAmount).toHaveBeenCalledWith(mockWager.userId, mockWager.amount);
    expect(logger.info).toHaveBeenCalledWith('Wager cancelled successfully', expect.any(Object));
  });

  test('createWager throws error when wallet reservation fails', async () => {
    const mockWagerData = {
      userId: 'user123',
      opponentId: 'user456',
      gameId: 'game789',
      amount: 100,
    };

    (WalletService.reserveAmount as jest.Mock).mockResolvedValueOnce(false);

    await expect(P2PWageringService.createWager(mockWagerData)).rejects.toThrow('Insufficient funds');
    expect(logger.error).toHaveBeenCalledWith('Error creating wager', expect.any(Object));
  });

  test('acceptWager throws error for non-existent wager', async () => {
    (db.collection('wagers').findOne as jest.Mock).mockResolvedValueOnce(null);

    await expect(P2PWageringService.acceptWager('nonexistent', 'user123')).rejects.toThrow('Wager not found');
    expect(logger.error).toHaveBeenCalledWith('Error accepting wager', expect.any(Object));
  });
});