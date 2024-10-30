import { db } from '../config/database';
import logger from '../utils/logger';

export async function processTournamentUpdates() {
  logger.info('Processing tournament updates');

  try {
    // Update ongoing tournaments
    await updateOngoingTournaments();

    // Start scheduled tournaments
    await startScheduledTournaments();

    // End completed tournaments
    await endCompletedTournaments();

    logger.info('Tournament updates processed successfully');
  } catch (error) {
    logger.error('Error processing tournament updates', { error });
    throw error;
  }
}

async function updateOngoingTournaments() {
  // Implement logic to update ongoing tournaments
  // This might include updating leaderboards, processing interim results, etc.
}

async function startScheduledTournaments() {
  const now = new Date();
  const scheduledTournaments = await db.collection('tournaments').find({
    startDate: { $lte: now },
    status: 'scheduled'
  }).toArray();

  for (const tournament of scheduledTournaments) {
    await db.collection('tournaments').updateOne(
      { _id: tournament._id },
      { $set: { status: 'ongoing' } }
    );
    logger.info('Tournament started', { tournamentId: tournament._id });
  }
}

async function endCompletedTournaments() {
  const now = new Date();
  const completedTournaments = await db.collection('tournaments').find({
    endDate: { $lte: now },
    status: 'ongoing'
  }).toArray();

  for (const tournament of completedTournaments) {
    await db.collection('tournaments').updateOne(
      { _id: tournament._id },
      { $set: { status: 'completed' } }
    );
    // Implement logic to process final results, distribute prizes, etc.
    logger.info('Tournament ended', { tournamentId: tournament._id });
  }
}