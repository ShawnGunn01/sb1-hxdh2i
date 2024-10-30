import { AIAgentService } from './AIAgentService';
import { ConversationState } from './types';
import { kycService } from '../kycService';
import { strikeService } from '../strikeService';
import { UserService } from '../userService';
import { GameRecommendationService } from '../gameRecommendationService';
import logger from '../../utils/logger';

export class AgentWorkflow {
  private aiAgent: AIAgentService;
  private conversationStates: Map<string, ConversationState>;

  constructor() {
    this.aiAgent = new AIAgentService();
    this.conversationStates = new Map();
  }

  async handleMessage(userId: string, message: string, channel: 'sms' | 'web'): Promise<string> {
    try {
      let state = this.conversationStates.get(userId) || this.initializeState(userId);
      const response = await this.processMessage(userId, message, state, channel);
      this.conversationStates.set(userId, state);
      return response;
    } catch (error) {
      logger.error('Error handling message', { error, userId, message });
      return 'I apologize, but I encountered an error. Please try again or contact support.';
    }
  }

  private initializeState(userId: string): ConversationState {
    return {
      step: 'welcome',
      data: {},
      lastInteraction: new Date(),
      channel: 'web'
    };
  }

  private async processMessage(
    userId: string,
    message: string,
    state: ConversationState,
    channel: 'sms' | 'web'
  ): Promise<string> {
    switch (state.step) {
      case 'welcome':
        return this.handleWelcome(userId, message, state);
      case 'registration':
        return this.handleRegistration(userId, message, state);
      case 'kyc_verification':
        return this.handleKYCVerification(userId, message, state);
      case 'payment_options':
        return this.handlePaymentOptions(userId, message, state);
      case 'deposit':
        return this.handleDeposit(userId, message, state);
      case 'withdrawal':
        return this.handleWithdrawal(userId, message, state);
      case 'game_recommendations':
        return this.handleGameRecommendations(userId, message, state);
      case 'support':
        return this.handleSupport(userId, message, state);
      default:
        return this.handleWelcome(userId, message, state);
    }
  }

  private async handleWelcome(userId: string, message: string, state: ConversationState): Promise<string> {
    const user = await UserService.findUser(userId);
    if (user) {
      state.step = 'payment_options';
      return `Welcome back! Would you like to:\n1. Make a deposit\n2. Withdraw funds\n3. View game recommendations\n4. Get support`;
    } else {
      state.step = 'registration';
      return 'Welcome to PLLAY! To get started, I\'ll need some information. What\'s your name?';
    }
  }

  private async handleRegistration(userId: string, message: string, state: ConversationState): Promise<string> {
    if (!state.data.name) {
      state.data.name = message;
      return 'Great! Now, please provide your email address.';
    } else if (!state.data.email) {
      state.data.email = message;
      state.step = 'kyc_verification';
      const veriffSession = await kycService.createSession(userId);
      return `Perfect! We need to verify your identity. Please click this link to complete verification: ${veriffSession.verification.url}`;
    }
    return 'Invalid registration state.';
  }

  private async handleKYCVerification(userId: string, message: string, state: ConversationState): Promise<string> {
    const kycStatus = await kycService.getVerificationStatus(state.data.veriffSessionId);
    if (kycStatus === 'approved') {
      state.step = 'payment_options';
      return 'Your identity has been verified! Would you like to make a deposit to start playing?';
    } else if (kycStatus === 'declined') {
      return 'Unfortunately, your verification was declined. Please contact support for assistance.';
    } else {
      return 'Your verification is still in progress. I\'ll notify you once it\'s complete.';
    }
  }

  private async handlePaymentOptions(userId: string, message: string, state: ConversationState): Promise<string> {
    if (message.toLowerCase().includes('deposit')) {
      state.step = 'deposit';
      return 'How much would you like to deposit?';
    } else if (message.toLowerCase().includes('withdraw')) {
      state.step = 'withdrawal';
      return 'How much would you like to withdraw?';
    } else {
      return 'Would you like to make a deposit or withdrawal?';
    }
  }

  private async handleDeposit(userId: string, message: string, state: ConversationState): Promise<string> {
    try {
      const amount = parseFloat(message);
      const invoice = await strikeService.createInvoice(amount, 'USD', 'PLLAY Deposit');
      state.data.pendingInvoiceId = invoice.invoiceId;
      return `Great! Please complete your payment using this Strike invoice: ${invoice.invoiceUrl}`;
    } catch (error) {
      logger.error('Error creating deposit', { error, userId, amount: message });
      return 'Sorry, I couldn\'t process your deposit. Please try again or contact support.';
    }
  }

  private async handleWithdrawal(userId: string, message: string, state: ConversationState): Promise<string> {
    try {
      const amount = parseFloat(message);
      const withdrawal = await strikeService.executeWithdrawal(amount, 'USD', state.data.strikeHandle);
      return `Your withdrawal of $${amount} has been initiated. You'll receive a confirmation once it's complete.`;
    } catch (error) {
      logger.error('Error processing withdrawal', { error, userId, amount: message });
      return 'Sorry, I couldn\'t process your withdrawal. Please try again or contact support.';
    }
  }

  private async handleGameRecommendations(userId: string, message: string, state: ConversationState): Promise<string> {
    const recommendations = await GameRecommendationService.getPersonalizedRecommendations(userId);
    return `Based on your preferences, I recommend:\n${recommendations.map(game => `- ${game.name}: ${game.description}`).join('\n')}`;
  }

  private async handleSupport(userId: string, message: string, state: ConversationState): Promise<string> {
    const needsHuman = this.checkIfNeedsHumanSupport(message);
    if (needsHuman) {
      await this.escalateToHumanAgent(userId, state);
      return 'I\'m connecting you with a human agent who can better assist you. They\'ll have access to our conversation history.';
    }
    return this.getAutomatedSupportResponse(message);
  }

  private checkIfNeedsHumanSupport(message: string): boolean {
    const complexKeywords = ['refund', 'complaint', 'dispute', 'bug', 'error'];
    return complexKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private async escalateToHumanAgent(userId: string, state: ConversationState): Promise<void> {
    // Implementation for human agent escalation
  }

  private getAutomatedSupportResponse(message: string): string {
    // Implementation for automated responses
    return 'I\'ll help you with that. What specific information do you need?';
  }
}