import { processTournamentUpdates, startScheduledTournaments, endCompletedTournaments } from '../../services/tournamentService';
import { db } from '../../config/database';
import logger from '../../utils/logger';

jest.mock('../../config/database');
jest.mock('../../utils/logger');

describe('TournamentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('processes tournament updates', async () => {
    const mockStartScheduledTournaments = jest.spyOn(global, 'startScheduledTournaments').mockResolvedValue();
    const mockEndCompletedTournaments = jest.spyOn(global, 'endCompletedTournaments').mockResolvedValue();

    await processTournamentUpdates();

    expect(mockStartScheduledTournaments).toHaveBeenCalled();
    expect(mockEndCompletedTournaments).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith('Tournament updates processed successfully');
  });

  it('starts scheduled tournaments', async () => {
    const mockDate = new Date('2023-07-01T00:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const mockTournaments = [
      { _id: '1', status: 'scheduled', startDate: new Date('2023-06-30T00:00:00Z') },
      { _id: '2', status: 'scheduled', startDate: new Date('2023-07-02T00:00:00Z') },
    ];

    const mockFind = jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockTournaments),
    });

    const mockUpdateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

    (db.collection as jest.Mock).mockReturnValue({
      find: mockFind,
      updateOne: mockUpdateOne,
    });

    await startScheduledTournaments();

    expect(mockUpdateOne).toHaveBeenCalledWith(
      { _id: '1' },
      { $set: { status: 'ongoing' } }
    );
    expect(mockUpdateOne).not.toHaveBeenCalledWith(
      { _id: '2' },
      expect.anything()
    );
    expect(logger.info).toHaveBeenCalledWith('Tournament started', { tournamentId: '1' });
  });

  it('ends completed tournaments', async () => {
    const mockDate = new Date('2023-07-01T00:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const mockTournaments = [
      { _id: '1', status: 'ongoing', endDate: new Date('2023-06-30T00:00:00Z') },
      { _id: '2', status: 'ongoing', endDate: new Date('2023-07-02T00:00:00Z') },
    ];

    const mockFind = jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockTournaments),
    });

    const mockUpdateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

    (db.collection as jest.Mock).mockReturnValue({
      find: mockFind,
      updateOne: mockUpdateOne,
    });

    await endCompletedTournaments();

    expect(mockUpdateOne).toHaveBeenCalledWith(
      { _id: '1' },
      { $set: { status: 'completed' } }
    );
    expect(mockUpdateOne).not.toHaveBeenCalledWith(
      { _id: '2' },
      expect.anything()
    );
    expect(logger.info).toHaveBeenCalledWith('Tournament ended', { tournamentId: '1' });
  });
});