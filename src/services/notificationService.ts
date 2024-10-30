import { smsService } from './smsService';
import logger from '../utils/logger';

export const notificationService = {
  async sendKYCUpdate(userId: string, status: string, phoneNumber: string): Promise<void> {
    try {
      let message = '';
      switch (status) {
        case 'approved':
          message = 'Your identity verification is complete! You can now start playing on PLLAY.';
          break;
        case 'rejected':
          const supportLink = await smsService.generateSecureLink('/support', userId);
          message = `Your identity verification was not successful. Please visit ${supportLink} for assistance.`;
          break;
        case 'pending':
          message = 'Your identity verification is being processed. We\'ll notify you once complete.';
          break;
      }
      await smsService.sendMessage(phoneNumber, message);
    } catch (error) {
      logger.error('Error sending KYC update', { error, userId, status });
    }
  },

  async sendGameResult(userId: string, phoneNumber: string, gameResult: any): Promise<void> {
    try {
      const resultLink = await smsService.generateSecureLink(`/games/${gameResult.gameId}/result`, userId);
      const message = `Game Result: ${gameResult.outcome === 'win' ? 'You won!' : 'Better luck next time!'}\nView details: ${resultLink}`;
      await smsService.sendMessage(phoneNumber, message);
    } catch (error) {
      logger.error('Error sending game result', { error, userId, gameResult });
    }
  },

  async sendTournamentReminder(userId: string, phoneNumber: string, tournament: any): Promise<void> {
    try {
      const tournamentLink = await smsService.generateSecureLink(`/tournaments/${tournament.id}`, userId);
      const message = `Reminder: ${tournament.name} starts in 1 hour!\nJoin here: ${tournamentLink}`;
      await smsService.sendMessage(phoneNumber, message);
    } catch (error) {
      logger.error('Error sending tournament reminder', { error, userId, tournament });
    }
  }
};