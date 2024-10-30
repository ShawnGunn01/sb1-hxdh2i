import { Server as SocketIOServer, Socket } from 'socket.io';
import { handleNewWager, handleAcceptWager, handleCompleteWager, handleCancelWager } from './services/wagerService';
import { createNotification } from './controllers/notificationController';

export function setupSocketHandlers(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log('A user connected');

    // Join a room for the user
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      socket.join(userId);
    }

    socket.on('createWager', async (wagerData) => {
      try {
        const newWager = await handleNewWager(wagerData);
        io.to(newWager.opponentId).emit('newWagerRequest', newWager);
        
        // Create a notification for the opponent
        await createNotification(newWager.opponentId, 'info', `You have a new wager request from ${newWager.userId}`, newWager.id);
        io.to(newWager.opponentId).emit('newNotification', {
          type: 'info',
          message: `You have a new wager request from ${newWager.userId}`,
          createdAt: new Date(),
          read: false
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to create wager' });
      }
    });

    socket.on('acceptWager', async ({ wagerId, userId }) => {
      try {
        const updatedWager = await handleAcceptWager(wagerId, userId);
        io.to(updatedWager.userId).to(updatedWager.opponentId).emit('wagerAccepted', updatedWager);
        
        // Create notifications for both users
        await createNotification(updatedWager.userId, 'success', `Your wager has been accepted by ${updatedWager.opponentId}`, wagerId);
        await createNotification(updatedWager.opponentId, 'success', `You have accepted a wager from ${updatedWager.userId}`, wagerId);
        
        io.to(updatedWager.userId).to(updatedWager.opponentId).emit('newNotification', {
          type: 'success',
          message: `Wager between ${updatedWager.userId} and ${updatedWager.opponentId} has been accepted`,
          createdAt: new Date(),
          read: false
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to accept wager' });
      }
    });

    socket.on('completeWager', async ({ wagerId, winnerId }) => {
      try {
        const completedWager = await handleCompleteWager(wagerId, winnerId);
        io.to(completedWager.userId).to(completedWager.opponentId).emit('wagerCompleted', completedWager);
        
        // Create notifications for both users
        await createNotification(completedWager.userId, 'info', `Your wager has been completed. Winner: ${winnerId}`, wagerId);
        await createNotification(completedWager.opponentId, 'info', `Your wager has been completed. Winner: ${winnerId}`, wagerId);
        
        io.to(completedWager.userId).to(completedWager.opponentId).emit('newNotification', {
          type: 'info',
          message: `Wager completed. Winner: ${winnerId}`,
          createdAt: new Date(),
          read: false
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to complete wager' });
      }
    });

    socket.on('cancelWager', async (wagerId) => {
      try {
        const cancelledWager = await handleCancelWager(wagerId);
        io.to(cancelledWager.userId).to(cancelledWager.opponentId).emit('wagerCancelled', cancelledWager);
        
        // Create notifications for both users
        await createNotification(cancelledWager.userId, 'warning', `Your wager has been cancelled`, wagerId);
        await createNotification(cancelledWager.opponentId, 'warning', `A wager you were involved in has been cancelled`, wagerId);
        
        io.to(cancelledWager.userId).to(cancelledWager.opponentId).emit('newNotification', {
          type: 'warning',
          message: `Wager cancelled`,
          createdAt: new Date(),
          read: false
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to cancel wager' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}