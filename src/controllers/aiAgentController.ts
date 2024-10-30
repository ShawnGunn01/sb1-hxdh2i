import { Request, Response } from 'express';
import { AgentWorkflow } from '../services/aiAgent/AgentWorkflow';
import logger from '../utils/logger';

const agentWorkflow = new AgentWorkflow();

export const handleMessage = async (req: Request, res: Response) => {
  try {
    const { userId, message, channel } = req.body;

    if (!userId || !message || !channel) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const response = await agentWorkflow.handleMessage(userId, message, channel);
    res.json({ response });
  } catch (error) {
    logger.error('Error in AI agent controller', { error });
    res.status(500).json({ message: 'Error processing message' });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    switch (type) {
      case 'veriff_callback':
        // Handle Veriff webhook
        break;
      case 'strike_callback':
        // Handle Strike webhook
        break;
      default:
        logger.warn('Unknown webhook type', { type });
        return res.status(400).json({ message: 'Unknown webhook type' });
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    logger.error('Error processing webhook', { error });
    res.status(500).json({ message: 'Error processing webhook' });
  }
};