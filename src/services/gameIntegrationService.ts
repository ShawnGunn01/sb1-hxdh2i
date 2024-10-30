import axios from 'axios';
import logger from '../utils/logger';

const GAME_API_ENDPOINT = process.env.GAME_API_ENDPOINT || 'https://api.gameintegration.com/v1';
const GAME_API_KEY = process.env.GAME_API_KEY;

export const gameIntegrationService = {
  async startGameSession(userId: string, gameId: string): Promise<any> {
    try {
      const response = await axios.post(`${GAME_API_ENDPOINT}/sessions`, {
        userId,
        gameId,
      }, {
        headers: {
          'Authorization': `Bearer ${GAME_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      logger.info('Game session started', { userId, gameId, sessionId: response.data.sessionId });
      return response.data;
    } catch (error) {
      logger.error('Error starting game session', { error, userId, gameId });
      throw error;
    }
  },

  async endGameSession(sessionId: string, score: number): Promise<any> {
    try {
      const response = await axios.put(`${GAME_API_ENDPOINT}/sessions/${sessionId}`, {
        score,
        status: 'completed',
      }, {
        headers: {
          'Authorization': `Bearer ${GAME_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      logger.info('Game session ended', { sessionId, score });
      return response.data;
    } catch (error) {
      logger.error('Error ending game session', { error, sessionId, score });
      throw error;
    }
  },

  async getGameResults(sessionId: string): Promise<any> {
    try {
      const response = await axios.get(`${GAME_API_ENDPOINT}/sessions/${sessionId}/results`, {
        headers: {
          'Authorization': `Bearer ${GAME_API_KEY}`,
        },
      });
      logger.info('Game results retrieved', { sessionId });
      return response.data;
    } catch (error) {
      logger.error('Error getting game results', { error, sessionId });
      throw error;
    }
  },

  async updateGameConfig(gameId: string, config: any): Promise<any> {
    try {
      const response = await axios.put(`${GAME_API_ENDPOINT}/games/${gameId}/config`, config, {
        headers: {
          'Authorization': `Bearer ${GAME_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      logger.info('Game configuration updated', { gameId });
      return response.data;
    } catch (error) {
      logger.error('Error updating game configuration', { error, gameId });
      throw error;
    }
  },
};