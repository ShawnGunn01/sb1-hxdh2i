import { Request, Response } from 'express';
import { db } from '../config/database';
import { createObjectCsvStringifier } from 'csv-writer';
import logger from '../utils/logger';

export const getReportData = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, game, type } = req.query;

    // Implement the logic to fetch and aggregate data based on the query parameters
    // This is a placeholder implementation
    const reportData = await generateReportData(startDate as string, endDate as string, game as string, type as string);

    res.json(reportData);
  } catch (error) {
    logger.error('Error generating report data', { error });
    res.status(500).json({ message: 'Error generating report data' });
  }
};

export const downloadReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, game, type } = req.query;

    // Generate report data
    const reportData = await generateReportData(startDate as string, endDate as string, game as string, type as string);

    // Convert report data to CSV
    const csvData = convertToCSV(reportData, type as string);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report_${type}_${new Date().toISOString()}.csv`);

    // Send CSV data
    res.send(csvData);
  } catch (error) {
    logger.error('Error downloading report', { error });
    res.status(500).json({ message: 'Error downloading report' });
  }
};

async function generateReportData(startDate: string, endDate: string, game: string, type: string) {
  // Implement the logic to fetch and aggregate data from the database
  // This is a placeholder implementation
  return {
    userGrowth: [],
    revenueByGame: [],
    tournamentParticipation: [],
    dailyActiveUsers: [],
    wagerDistribution: [],
  };
}

function convertToCSV(data: any, type: string) {
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'date', title: 'Date' },
      { id: 'value', title: 'Value' },
    ],
  });

  const records = data[type].map((item: any) => ({
    date: item.date || item.game || item.tournament || item.amount,
    value: item.count || item.revenue || item.participants,
  }));

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
}