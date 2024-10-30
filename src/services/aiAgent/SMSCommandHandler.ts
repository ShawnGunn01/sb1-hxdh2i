import { smsService } from '../smsService';
import { strikeService } from '../strikeService';
import { kycService } from '../kycService';
import logger from '../../utils/logger';

export class SMSCommandHandler {
  private readonly commands = {
    BALANCE: /^balance$/i,
    DEPOSIT: /^deposit\s+(\d+)$/i,
    WITHDRAW: /^withdraw\s+(\d+)$/i,
    VERIFY: /^verify$/i,
    HELP: /^help$/i,
    SUPPORT: /^support$/i,
    GAMES: /^games$/i,
    JOIN: /^join\s+(\w+)$/i
  };

  async handleCommand(userId: string, phoneNumber: string, message: string): Promise<void> {
    try {
      const command = this.parseCommand(message);
      switch (command.type) {
        case 'BALANCE':
          await this.handleBalanceCheck(userId, phoneNumber);
          break;
        case 'DEPOSIT':
          await this.handleDeposit(userId, phoneNumber, command.amount);
          break;
        case 'WITHDRAW':
          await this.handleWithdraw(userId, phoneNumber, command.amount);
          break;
        case 'VERIFY':
          await this.handleVerification(userId, phoneNumber);
          break;
        case 'HELP':
          await this.sendHelpMessage(phoneNumber);
          break;
        case 'SUPPORT':
          await this.escalateToSupport(userId, phoneNumber);
          break;
        case 'GAMES':
          await this.sendGamesList(userId, phoneNumber);
          break;
        case 'JOIN':
          await this.handleGameJoin(userId, phoneNumber, command.gameId);
          break;
        default:
          await smsService.sendMessage(phoneNumber, 'Command not recognized. Text HELP for available commands.');
      }
    } catch (error) {
      logger.error('Error handling SMS command', { error, userId, message });
      await smsService.sendMessage(phoneNumber, 'Sorry, there was an error processing your request. Please try again.');
    }
  }

  private parseCommand(message: string): { type: string; amount?: number; gameId?: string } {
    for (const [type, regex] of Object.entries(this.commands)) {
      const match = message.match(regex);
      if (match) {
        return {
          type,
          amount: match[1] ? parseFloat(match[1]) : undefined,
          gameId: match[1]
        };
      }
    }
    return { type: 'UNKNOWN' };
  }

  private async handleBalanceCheck(userId: string, phoneNumber: string): Promise<void> {
    const balance = await strikeService.getBalance(userId);
    await smsService.sendMessage(phoneNumber, `Your current balance is $${balance.toFixed(2)}`);
  }

  private async handleDeposit(userId: string, phoneNumber: string, amount: number): Promise<void> {
    const depositLink = await smsService.generateSecureLink('/deposit', userId);
    await smsService.sendMessage(
      phoneNumber,
      `To deposit $${amount}, please complete the process here: ${depositLink}\nLink expires in 1 hour.`
    );
  }

  private async handleWithdraw(userId: string, phoneNumber: string, amount: number): Promise<void> {
    const withdrawLink = await smsService.generateSecureLink('/withdraw', userId);
    await smsService.sendMessage(
      phoneNumber,
      `To withdraw $${amount}, please complete the process here: ${withdrawLink}\nLink expires in 1 hour.`
    );
  }

  private async handleVerification(userId: string, phoneNumber: string): Promise<void> {
    const verificationLink = await smsService.generateSecureLink('/verify', userId);
    await smsService.sendMessage(
      phoneNumber,
      `Complete your identity verification here: ${verificationLink}\nLink expires in 1 hour.`
    );
  }

  private async sendHelpMessage(phoneNumber: string): Promise<void> {
    const helpMessage = `
Available commands:
BALANCE - Check your balance
DEPOSIT [amount] - Make a deposit
WITHDRAW [amount] - Make a withdrawal
VERIFY - Complete identity verification
GAMES - View available games
JOIN [game_id] - Join a game
SUPPORT - Get help from our team
HELP - Show this message
    `.trim();
    await smsService.sendMessage(phoneNumber, helpMessage);
  }

  private async escalateToSupport(userId: string, phoneNumber: string): Promise<void> {
    const supportLink = await smsService.generateSecureLink('/support', userId);
    await smsService.sendMessage(
      phoneNumber,
      `Connect with our support team here: ${supportLink}\nA team member will assist you shortly.`
    );
  }

  private async sendGamesList(userId: string, phoneNumber: string): Promise<void> {
    const gamesLink = await smsService.generateSecureLink('/games', userId);
    await smsService.sendMessage(
      phoneNumber,
      `View available games and tournaments here: ${gamesLink}`
    );
  }

  private async handleGameJoin(userId: string, phoneNumber: string, gameId: string): Promise<void> {
    const gameLink = await smsService.generateSecureLink(`/games/${gameId}/join`, userId);
    await smsService.sendMessage(
      phoneNumber,
      `Join the game here: ${gameLink}\nGood luck!`
    );
  }
}