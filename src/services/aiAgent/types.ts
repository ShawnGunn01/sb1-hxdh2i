export interface ConversationState {
  step: 'welcome' | 'registration' | 'kyc_verification' | 'payment_options' | 'deposit' | 'withdrawal' | 'game_recommendations' | 'support';
  data: {
    name?: string;
    email?: string;
    veriffSessionId?: string;
    pendingInvoiceId?: string;
    strikeHandle?: string;
    [key: string]: any;
  };
  lastInteraction: Date;
  channel: 'sms' | 'web';
}

export interface GameRecommendation {
  id: string;
  name: string;
  description: string;
  matchScore: number;
}

export interface SupportEscalation {
  userId: string;
  conversationHistory: Array<{
    timestamp: Date;
    message: string;
    sender: 'user' | 'agent';
  }>;
  reason: string;
}