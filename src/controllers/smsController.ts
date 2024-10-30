import { Request, Response } from 'express';
import { SMSCommandHandler } from '../services/aiAgent/SMSCommandHandler';
import { UserService } from '../services/userService';
import logger from '../utils/logger';

const smsCommandHandler = new SMSCommandHandler();

export const handleIncomingSMS = async (req: Request, res: Response) => {
  try {
    const { From: phoneNumber, Body: message } = req.body;

    // Find or create user based on phone number
    const user = await UserService.findOrCreateByPhone(phoneNumber);

    // Process the command
    await smsCommandHandler.handleCommand(user.id, phoneNumber, message);

    res.status(200).send('OK');
  } catch (error) {
    logger.error('Error handling incoming SMS', { error });
    res.status(500).json({ message: 'Error processing SMS' });
  }
};