import React, { createContext, useContext, useEffect } from 'react';
import { websocketService } from '../services/websocketService';
import { useAuth } from './AuthContext';

interface SocketContextType {
  createWager: (wagerData: any) => void;
  acceptWager: (wagerId: string) => void;
  completeWager: (wagerId: string, winnerId: string) => void;
  cancelWager: (wagerId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      websocketService.connect(user.id);
    }

    return () => {
      websocketService.disconnect();
    };
  }, [user]);

  const contextValue: SocketContextType = {
    createWager: websocketService.createWager.bind(websocketService),
    acceptWager: websocketService.acceptWager.bind(websocketService),
    completeWager: websocketService.completeWager.bind(websocketService),
    cancelWager: websocketService.cancelWager.bind(websocketService),
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};