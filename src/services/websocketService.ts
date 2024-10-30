import { io, Socket } from 'socket.io-client';
import { createNotification } from '../controllers/notificationController';
import logger from '../utils/logger';

class WebSocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    this.userId = userId;
    this.socket = io('http://localhost:3001', {
      query: { userId }
    });

    this.socket.on('connect', () => {
      logger.info('Connected to WebSocket server', { userId });
    });

    this.socket.on('disconnect', () => {
      logger.info('Disconnected from WebSocket server', { userId });
    });

    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('newWagerRequest', this.handleNewWagerRequest);
    this.socket.on('wagerAccepted', this.handleWagerAccepted);
    this.socket.on('wagerCompleted', this.handleWagerCompleted);
    this.socket.on('wagerCancelled', this.handleWagerCancelled);
    this.socket.on('newNotification', this.handleNewNotification);
  }

  private handleNewWagerRequest = (wager: any) => {
    createNotification(this.userId!, 'info', `New wager request from ${wager.userId}`, wager.id);
    // Dispatch action or update state in your application
  }

  private handleWagerAccepted = (wager: any) => {
    createNotification(this.userId!, 'success', `Wager accepted by ${wager.opponentId}`, wager.id);
    // Dispatch action or update state in your application
  }

  private handleWagerCompleted = (wager: any) => {
    createNotification(this.userId!, 'info', `Wager completed. Winner: ${wager.winnerId}`, wager.id);
    // Dispatch action or update state in your application
  }

  private handleWagerCancelled = (wager: any) => {
    createNotification(this.userId!, 'warning', `Wager cancelled`, wager.id);
    // Dispatch action or update state in your application
  }

  private handleNewNotification = (notification: any) => {
    // Dispatch action or update state in your application to show the new notification
  }

  // Methods to emit events
  createWager(wagerData: any) {
    this.socket?.emit('createWager', wagerData);
  }

  acceptWager(wagerId: string) {
    this.socket?.emit('acceptWager', { wagerId, userId: this.userId });
  }

  completeWager(wagerId: string, winnerId: string) {
    this.socket?.emit('completeWager', { wagerId, winnerId });
  }

  cancelWager(wagerId: string) {
    this.socket?.emit('cancelWager', wagerId);
  }
}

export const websocketService = new WebSocketService();