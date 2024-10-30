import { Request, Response } from 'express';
import { db } from '../config/database';
import logger from '../utils/logger';
import { ObjectId } from 'mongodb';

export const getAdvancedAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, segment } = req.query;

    // Convert string dates to Date objects
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const end = endDate ? new Date(endDate as string) : new Date();

    const userRetention = await calculateUserRetention(start, end, segment as string);
    const lifetimeValue = await calculateLifetimeValue(segment as string);
    const churnRate = await calculateChurnRate(start, end, segment as string);
    const gamePopularity = await calculateGamePopularity(start, end);
    const wagerDistribution = await calculateWagerDistribution(start, end);
    const peakActivityTimes = await calculatePeakActivityTimes(start, end);

    res.json({
      userRetention,
      lifetimeValue,
      churnRate,
      gamePopularity,
      wagerDistribution,
      peakActivityTimes,
    });
  } catch (error) {
    logger.error('Error fetching advanced analytics', { error });
    res.status(500).json({ message: 'Error fetching advanced analytics' });
  }
};

async function calculateUserRetention(start: Date, end: Date, segment: string) {
  // Implement user retention calculation logic
  // This is a placeholder implementation
  return [
    { date: '2023-06-01', rate: 0.8 },
    { date: '2023-06-08', rate: 0.75 },
    { date: '2023-06-15', rate: 0.72 },
    { date: '2023-06-22', rate: 0.7 },
    { date: '2023-06-29', rate: 0.68 },
  ];
}

async function calculateLifetimeValue(segment: string) {
  // Implement lifetime value calculation logic
  // This is a placeholder implementation
  return [
    { segment: 'New Users', value: 100 },
    { segment: '1-3 Months', value: 250 },
    { segment: '3-6 Months', value: 500 },
    { segment: '6-12 Months', value: 1000 },
    { segment: '1+ Year', value: 2000 },
  ];
}

async function calculateChurnRate(start: Date, end: Date, segment: string) {
  // Implement churn rate calculation logic
  // This is a placeholder implementation
  return [
    { date: '2023-06-01', rate: 0.05 },
    { date: '2023-06-08', rate: 0.04 },
    { date: '2023-06-15', rate: 0.06 },
    { date: '2023-06-22', rate: 0.03 },
    { date: '2023-06-29', rate: 0.04 },
  ];
}

async function calculateGamePopularity(start: Date, end: Date) {
  // Implement game popularity calculation logic
  const result = await db.collection('games').aggregate([
    {
      $lookup: {
        from: 'wagers',
        localField: '_id',
        foreignField: 'gameId',
        as: 'wagers'
      }
    },
    {
      $project: {
        game: '$name',
        players: { $size: '$wagers' }
      }
    },
    {
      $sort: { players: -1 }
    },
    {
      $limit: 10
    }
  ]).toArray();

  return result;
}

async function calculateWagerDistribution(start: Date, end: Date) {
  // Implement wager distribution calculation logic
  const result = await db.collection('wagers').aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $bucket: {
        groupBy: '$amount',
        boundaries: [0, 10, 50, 100, 500, 1000, Infinity],
        default: 'Other',
        output: {
          count: { $sum: 1 }
        }
      }
    },
    {
      $project: {
        range: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 'Other'] }, then: 'Other' },
              { case: { $eq: ['$_id', 1000] }, then: '$1000+' },
              { case: { $eq: ['$_id', 0] }, then: '$0-$10' },
              { case: { $eq: ['$_id', 10] }, then: '$10-$50' },
              { case: { $eq: ['$_id', 50] }, then: '$50-$100' },
              { case: { $eq: ['$_id', 100] }, then: '$100-$500' },
              { case: { $eq: ['$_id', 500] }, then: '$500-$1000' },
            ],
            default: 'Unknown'
          }
        },
        count: 1
      }
    }
  ]).toArray();

  const total = result.reduce((sum, item) => sum + item.count, 0);
  return result.map(item => ({
    range: item.range,
    percentage: item.count / total
  }));
}

async function calculatePeakActivityTimes(start: Date, end: Date) {
  // Implement peak activity times calculation logic
  const result = await db.collection('wagers').aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        activity: { $sum: 1 }
      }
    },
    {
      $project: {
        hour: '$_id',
        activity: 1,
        _id: 0
      }
    },
    {
      $sort: { hour: 1 }
    }
  ]).toArray();

  return result;
}

export const downloadAdvancedAnalyticsReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, segment } = req.query;

    // Fetch the data (reuse the getAdvancedAnalytics logic)
    const analyticsData = await getAdvancedAnalyticsData(startDate as string, endDate as string, segment as string);

    // Convert the data to CSV format
    const csv = convertToCSV(analyticsData);

    // Set the appropriate headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=advanced_analytics_report.csv');

    // Send the CSV data
    res.send(csv);
  } catch (error) {
    logger.error('Error generating advanced analytics report', { error });
    res.status(500).json({ message: 'Error generating advanced analytics report' });
  }
};

async function getAdvancedAnalyticsData(startDate: string, endDate: string, segment: string) {
  // Reuse the logic from getAdvancedAnalytics
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const userRetention = await calculateUserRetention(start, end, segment);
  const lifetimeValue = await calculateLifetimeValue(segment);
  const churnRate = await calculateChurnRate(start, end, segment);
  const gamePopularity = await calculateGamePopularity(start, end);
  const wagerDistribution = await calculateWagerDistribution(start, end);
  const peakActivityTimes = await calculatePeakActivityTimes(start, end);

  return {
    userRetention,
    lifetimeValue,
    churnRate,
    gamePopularity,
    wagerDistribution,
    peakActivityTimes,
  };
}

function convertToCSV(data: any) {
  const headers = [
    'Metric',
    'Date/Segment',
    'Value',
  ];

  const rows = [
    headers,
    ...data.userRetention.map((item: any) => ['User Retention', item.date, item.rate]),
    ...data.lifetimeValue.map((item: any) => ['Lifetime Value', item.segment, item.value]),
    ...data.churnRate.map((item: any) => ['Churn Rate', item.date, item.rate]),
    ...data.gamePopularity.map((item: any) => ['Game Popularity', item.game, item.players]),
    ...data.wagerDistribution.map((item: any) => ['Wager Distribution', item.range, item.percentage]),
    ...data.peakActivityTimes.map((item: any) => ['Peak Activity Times', item.hour, item.activity]),
  ];

  return rows.map(row => row.join(',')).join('\n');
}