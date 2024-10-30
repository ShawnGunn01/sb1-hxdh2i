import { tracer } from '../config/datadog';

export const incrementActiveUsers = () => {
  tracer.increment('pllay.active_users', 1);
};

export const decrementActiveUsers = () => {
  tracer.decrement('pllay.active_users', 1);
};

export const recordRevenue = (amount: number) => {
  tracer.increment('pllay.revenue', amount);
};

export const recordWager = (amount: number) => {
  tracer.increment('pllay.wager_amount', amount);
};

export const recordGamePlay = (gameId: string) => {
  tracer.increment('pllay.game_plays', 1, [`game:${gameId}`]);
};