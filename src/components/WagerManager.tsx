import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { ComplianceService } from '../services/complianceService';

// ... (previous imports and interfaces)

const WagerManager: React.FC = () => {
  // ... (previous state declarations)

  const { createWager, acceptWager, completeWager, cancelWager } = useSocket();
  const { user } = useAuth();

  const handleCreateWager = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Check user eligibility before creating wager
      const isEligible = await ComplianceService.checkUserEligibility(user?.id, newWager.gameId);
      if (!isEligible) {
        setError('You are not eligible to create this wager. Please check compliance requirements.');
        return;
      }

      createWager({
        ...newWager,
        userId: user?.id,
        amount: parseFloat(newWager.amount)
      });
      setNewWager({ amount: '', opponentId: '', gameId: '' });
      setError(null);

      // Log wager activity for compliance
      await ComplianceService.logWagerActivity(user?.id, newWager.gameId, parseFloat(newWager.amount));
    } catch (err) {
      setError('Failed to create wager. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptWager = (wagerId: string) => {
    acceptWager(wagerId);
  };

  const handleCompleteWager = (wagerId: string, winnerId: string) => {
    completeWager(wagerId, winnerId);
  };

  const handleCancelWager = (wagerId: string) => {
    cancelWager(wagerId);
  };

  // ... (rest of the component remains the same)
};

export default WagerManager;